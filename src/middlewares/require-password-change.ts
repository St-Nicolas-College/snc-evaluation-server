import type { Core } from "@strapi/strapi";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number;
  session_version?: number;
  iat?: number;
  exp?: number;
}

const USER_UID = "plugin::users-permissions.user";

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    // Apply protection only to API routes.
    if (!ctx.path.startsWith("/api/")) {
      return next();
    }

    // These endpoints manage authentication separately.
    const publicAuthPaths = new Set([
      "/api/auth/login",
      "/api/auth/refresh",
      "/api/auth/logout",
    ]);

    if (publicAuthPaths.has(ctx.path)) {
      return next();
    }

    const authorization = ctx.request.headers.authorization;

    // Let Strapi handle requests without Bearer tokens.
    if (
      typeof authorization !== "string" ||
      !/^Bearer\s+/i.test(authorization)
    ) {
      return next();
    }

    const token = authorization.replace(/^Bearer\s+/i, "").trim();

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
        !Number.isSafeInteger(payload.id) ||
        payload.id <= 0
      ) {
        return ctx.unauthorized("Invalid access token.");
      }
    } catch {
      return ctx.unauthorized("Invalid or expired access token.");
    }

    // Always check the current user status in Strapi.
    const user = await strapi.db.query(USER_UID).findOne({
      where: { id: payload.id },
    });

    const currentSessionVersion = user.session_version;

    if (
      !Number.isSafeInteger(currentSessionVersion) ||
      currentSessionVersion < 0
    ) {
      strapi.log.error(`[auth] Invalid session version for user ${user.id}`);

      return ctx.unauthorized("Invalid account session.");
    }

    // Reject tokens with missing or outdated session versions.
    if (
      !Number.isSafeInteger(payload.session_version) ||
      payload.session_version !== currentSessionVersion
    ) {
      return ctx.unauthorized(
        "Your session has expired. Please sign in again.",
      );
    }

    if (!user || user.blocked) {
      return ctx.unauthorized("This account is blocked or unavailable.");
    }

    // Apply mandatory password changes to ALL roles.
    const mustChangePassword = user.must_change_password === true;

    if (!mustChangePassword) {
      return next();
    }

    // Allow the shared password-change endpoint.
    const isSharedPasswordChange =
      ctx.method === "PUT" && ctx.path === "/api/auth/change-password";

    // Retain the existing Student endpoint for compatibility.
    const isStudentPasswordChange =
      ctx.method === "PUT" && ctx.path === "/api/students/me/change-password";

    if (isSharedPasswordChange || isStudentPasswordChange) {
      return next();
    }

    return ctx.forbidden(
      "You must change your temporary password before continuing.",
    );
  };
};
