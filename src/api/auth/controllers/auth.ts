import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
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

    // Create access  token
    const accessToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: "15m" }, // short-lived
    );

    // Create refresh token
    const refreshTokenValue = randomBytes(64).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

    // Save refresh token in DB
    await strapi.db.query("api::refresh-token.refresh-token").create({
      data: { token: refreshTokenValue, user: user.id, expiresAt },
    });

    ctx.send({
      jwt: accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role?.name,
        user_info: user.user_info,
      },
    });
  },

  // ======================
  // REFRESH ACCESS TOKEN
  // ======================
  async refresh(ctx) {
    const { refreshToken } = ctx.request.body;
    if (!refreshToken) return ctx.unauthorized("Missing refresh token");

    // Find refresh token in DB
    const stored = await strapi.db
      .query("api::refresh-token.refresh-token")
      .findOne({
        where: { token: refreshToken },
        populate: { user: { populate: ["role", "user_info"] } },
      });

    if (!stored || new Date(stored.expiresAt) < new Date()) {
      return ctx.unauthorized("Invalid or expired refresh token");
    }

    // const user = await strapi
    //   .query("plugin::users-permissions.user")
    //   .findOne({ where: { id: stored.user.id } });
    const user = stored.user;

    console.log(user);

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role?.name },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "15m" },
    );

    ctx.send({
      jwt: newAccessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role?.name,
        user_info: user.user_info,
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
};
