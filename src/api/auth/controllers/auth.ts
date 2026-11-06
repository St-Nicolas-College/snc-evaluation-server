import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required.");
}
const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES_DAYS = 7;

export default {
  // ======================
  // LOGIN
  // ======================

  async login(ctx) {
    const { identifier, password } = ctx.request.body;

    if (!identifier || !password) {
      return ctx.badRequest("Missing credentials");
    }

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: {
          $or: [{ email: identifier }, { username: identifier }],
        },
        populate: {
          role: true,
          user_info: true,
          teacher: true,
          student: true,
        },
      });

    if (!user) {
      return ctx.unauthorized("Invalid credentials");
    }

    const validPassword = await strapi
      .plugin("users-permissions")
      .service("user")
      .validatePassword(password, user.password);

    if (!validPassword) {
      return ctx.unauthorized("Invalid password");
    }

    // Prevent blocked accounts from logging in.
    if (user.blocked) {
      return ctx.forbidden("This account has been blocked.");
    }

    // Create access  token
    const accessToken = jwt.sign(
      { id: user.id, session_version: user.session_version },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRES }, // short-lived
    );

    // Create refresh token
    const refreshTokenValue = randomBytes(64).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

    // Save refresh token in DB
    await strapi.db.query("api::refresh-token.refresh-token").create({
      data: { token: refreshTokenValue, user: user.id, expiresAt },
    });

    // Enforce mandatory password changes for all account roles.
    // This includes Student, Faculty, Dean, HR, and Admin.
    const mustChangePassword = user.must_change_password === true;

    ctx.send({
      jwt: accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role?.name,
        user_info: user.user_info,
        teacher: user.teacher,
        student: user.student,

        // NEW: First-login password-change requirement.
        must_change_password: mustChangePassword,
      },
    });
  },

  // ======================
  // REFRESH ACCESS TOKEN
  // ======================

  async refresh(ctx) {
    const { refreshToken } = ctx.request.body || {};

    if (!refreshToken) {
      return ctx.unauthorized("Missing refresh token");
    }

    // Find refresh token in the database.
    const stored = await strapi.db
      .query("api::refresh-token.refresh-token")
      .findOne({
        where: { token: refreshToken },
        populate: {
          user: {
            populate: ["role", "user_info", "teacher", "student"],
          },
        },
      });

    if (
      !stored ||
      !stored.user ||
      new Date(stored.expiresAt).getTime() <= Date.now()
    ) {
      return ctx.unauthorized("Invalid or expired refresh token");
    }

    const user = stored.user;

    // Reject blocked accounts.
    if (user.blocked) {
      return ctx.forbidden("This account has been blocked.");
    }

    // Enforce mandatory password changes for all account roles.
    // This includes Student, Faculty, Dean, HR, and Admin.
    const mustChangePassword = user.must_change_password === true;

    // Generate a new access token using the same secret
    // and token structure as the existing login controller.
    const newAccessToken = jwt.sign(
      { id: user.id, session_version: user.session_version },
      JWT_SECRET,
      {
        expiresIn: ACCESS_EXPIRES,
      },
    );

    ctx.send({
      jwt: newAccessToken,

      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role?.name,
        user_info: user.user_info,
        teacher: user.teacher,
        student: user.student,

        // NEW: Preserve the password-change requirement.
        must_change_password: mustChangePassword,
      },
    });
  },

  // ======================
  // LOGOUT
  // ======================
  async logout(ctx) {
    const { refreshToken } = ctx.request.body;
    if (!refreshToken) return ctx.badRequest("Missing refresh token");

    await strapi.db
      .query("api::refresh-token.refresh-token")
      .delete({ where: { token: refreshToken } });

    ctx.send({ success: true });
  },

  // ======================
  // CHANGE PASSWORD
  // ======================

  async changePassword(ctx) {
    const actorId = ctx.state.user?.id;

    if (!actorId) {
      return ctx.unauthorized("Authentication required.");
    }

    const { current_password, new_password } = ctx.request.body || {};

    if (
      typeof current_password !== "string" ||
      !current_password ||
      typeof new_password !== "string" ||
      new_password.length < 12 ||
      new_password.length > 128
    ) {
      return ctx.badRequest(
        "Current password and a new password of 12–128 characters are required.",
      );
    }

    const USER_UID = "plugin::users-permissions.user";
    const REFRESH_UID = "api::refresh-token.refresh-token";

    const userQuery = strapi.db.query(USER_UID);

    const user = await userQuery.findOne({
      where: { id: actorId },
    });

    if (!user || user.blocked) {
      return ctx.unauthorized("Account unavailable.");
    }

    const userService = strapi.plugin("users-permissions").service("user");

    const valid = await userService.validatePassword(
      current_password,
      user.password,
    );

    if (!valid) {
      return ctx.badRequest("Current password is incorrect.");
    }

    const reused = await userService.validatePassword(
      new_password,
      user.password,
    );

    if (reused) {
      return ctx.badRequest("Choose a different password.");
    }

    await strapi.db.transaction(async ({ trx }) => {
      // Update the password using Strapi's password hashing.
      await userService.edit(user.id, {
        password: new_password,
      });

      // Increment the version atomically.
      // Existing JWTs will no longer match.
      const updated = await trx("up_users")
        .where({ id: user.id })
        .increment("session_version", 1)
        .update({
          must_change_password: false,
        });

      if (updated !== 1) {
        throw new Error("Unable to update account session version.");
      }

      // Revoke existing refresh tokens.
      await strapi.db.query(REFRESH_UID).deleteMany({
        where: { user: user.id },
      });
    });

    return ctx.send({
      message: "Password updated. Please sign in again.",
    });
  },
};
