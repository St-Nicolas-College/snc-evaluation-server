import type { Core } from "@strapi/strapi";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number;
  iat?: number;
  exp?: number;
}

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    // Only enforce restrictions on API routes.
    if (!ctx.path.startsWith("/api/")) {
      return next();
    }

    // Authentication endpoints remain accessible.
    // Login, refresh, and logout have their own validation.
    const publicAuthPaths = [
      "/api/auth/login",
      "/api/auth/refresh",
      "/api/auth/logout",
    ];

    if (publicAuthPaths.includes(ctx.path)) {
      return next();
    }

    const authorization = ctx.request.headers.authorization;

    // Requests without a Bearer token continue through
    // Strapi's existing authentication and permissions.
    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    ) {
      return next();
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return ctx.unauthorized("Invalid access token.");
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      strapi.log.error("JWT_SECRET is not configured.");
      return ctx.internalServerError("Authentication configuration error.");
    }

    let payload: TokenPayload;

    try {
      payload = jwt.verify(token, secret, {
        algorithms: ["HS256"],
      }) as TokenPayload;

      if (
        !payload ||
        typeof payload.id !== "number" ||
        !Number.isInteger(payload.id)
      ) {
        return ctx.unauthorized("Invalid access token.");
      }
    } catch {
      return ctx.unauthorized("Invalid or expired access token.");
    }

    // Read the latest user status from the database.
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: payload.id },
        populate: { role: true },
      });

    if (!user || user.blocked) {
      return ctx.unauthorized("Account is unavailable.");
    }

    const isStudent = String(user.role?.name || "").toLowerCase() === "student";

    const mustChangePassword = isStudent && user.must_change_password === true;

    // Normal users are unaffected.
    if (!mustChangePassword) {
      return next();
    }

    // The student must be able to update their password.
    const isPasswordChangeRequest =
      ctx.method === "PUT" && ctx.path === "/api/students/me/change-password";

    if (isPasswordChangeRequest) {
      return next();
    }

    // All other API requests with this student's token
    // are blocked until the password is changed.
    return ctx.forbidden(
      "You must change your temporary password before continuing.",
    );
  };
};
