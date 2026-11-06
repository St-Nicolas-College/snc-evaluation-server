/** SNC Admin User Management — Strapi v5 / Users & Permissions. */
const USER_UID = "plugin::users-permissions.user";
const ROLE_UID = "plugin::users-permissions.role";
const populated = { role: true, teacher: true, student: true };

const requireAdmin = async (ctx: any) => {
  const id = ctx.state.user?.id;
  if (!id) {
    ctx.unauthorized("Authentication required.");
    return null;
  }
  const actor = await strapi.db
    .query(USER_UID)
    .findOne({ where: { id }, populate: { role: true } });
  if (!actor || actor.blocked) {
    ctx.unauthorized("Invalid user account.");
    return null;
  }
  if (
    String(actor.role?.name ?? "")
      .trim()
      .toLowerCase() !== "admin"
  ) {
    ctx.forbidden("Admin access required.");
    return null;
  }
  return actor;
};

const publicUser = (user: any) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  confirmed: Boolean(user.confirmed),
  blocked: Boolean(user.blocked),
  role: user.role
    ? { id: user.role.id, name: user.role.name, type: user.role.type }
    : null,
  teacher: user.teacher
    ? {
        id: user.teacher.id,
        documentId: user.teacher.documentId,
        employee_no: user.teacher.employee_no,
        name: user.teacher.name,
      }
    : null,
  student: user.student
    ? {
        id: user.student.id,
        documentId: user.student.documentId,
        student_id: user.student.student_id,
        name: user.student.name,
      }
    : null,
});
const validId = (v: any) => Number.isSafeInteger(Number(v)) && Number(v) > 0;
const normalizedEmail = (v: any) =>
  String(v ?? "")
    .trim()
    .toLowerCase();
const emailValid = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length >= 6 && v.length <= 254;
const roleName = (r: any) =>
  String(r?.name ?? "")
    .trim()
    .toLowerCase();
const restrictedRoles = new Set(["student", "faculty", "dean"]);
const safeError = (ctx: any, error: any, action: string) => {
  strapi.log.error(`[admin-user] ${action}: ${error?.message ?? error}`);
  return ctx.internalServerError(`Unable to ${action}.`);
};
const findRole = (id: any) =>
  strapi.db.query(ROLE_UID).findOne({ where: { id: Number(id) } });
const findUser = (id: number) =>
  strapi.db.query(USER_UID).findOne({ where: { id }, populate: populated });
const countActiveAdmins = async () => {
  const adminRoles = await strapi.db.query(ROLE_UID).findMany();
  const ids = adminRoles
    .filter((r: any) => roleName(r) === "admin")
    .map((r: any) => r.id);
  if (!ids.length) return 0;
  return strapi.db
    .query(USER_UID)
    .count({ where: { role: { id: { $in: ids } }, blocked: false } });
};
const uniqueConflict = async (
  username?: string,
  email?: string,
  exceptId?: number,
) => {
  const or: any[] = [];
  if (username) or.push({ username });
  if (email) or.push({ email });
  if (!or.length) return null;
  const where: any = { $or: or };
  if (exceptId) where.id = { $ne: exceptId };
  return strapi.db.query(USER_UID).findOne({ where });
};

export default {
  // Phase 1B endpoints — retained.
  async list(ctx: any) {
    if (!(await requireAdmin(ctx))) return;
    try {
      const q = ctx.query ?? {};
      const page = Number(q.page ?? 1);
      const pageSize = Number(q.pageSize ?? 20);
      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(pageSize) ||
        pageSize < 1 ||
        pageSize > 100
      )
        return ctx.badRequest(
          "page must be >= 1 and pageSize must be between 1 and 100.",
        );
      const where: any = {};
      const search = String(q.search ?? "").trim();
      if (search.length > 100) return ctx.badRequest("Search is too long.");
      if (search)
        where.$or = [
          { username: { $containsi: search } },
          { email: { $containsi: search } },
        ];
      if (q.roleId !== undefined && q.roleId !== "") {
        if (!validId(q.roleId)) return ctx.badRequest("Invalid roleId.");
        where.role = { id: Number(q.roleId) };
      }
      if (q.status !== undefined && q.status !== "") {
        if (!["active", "blocked"].includes(String(q.status)))
          return ctx.badRequest("Invalid status.");
        where.blocked = q.status === "blocked";
      }
      const [users, total] = await Promise.all([
        strapi.db.query(USER_UID).findMany({
          where,
          populate: populated,
          orderBy: { id: "desc" },
          limit: pageSize,
          offset: (page - 1) * pageSize,
        }),
        strapi.db.query(USER_UID).count({ where }),
      ]);
      return ctx.send({
        data: users.map(publicUser),
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            total,
          },
        },
      });
    } catch (error) {
      return safeError(ctx, error, "list users");
    }
  },
  async detail(ctx: any) {
    if (!(await requireAdmin(ctx))) return;
    if (!validId(ctx.params.id)) return ctx.badRequest("Invalid user ID.");
    try {
      const user = await findUser(Number(ctx.params.id));
      if (!user) return ctx.notFound("User not found.");
      return ctx.send({ data: publicUser(user) });
    } catch (error) {
      return safeError(ctx, error, "get user details");
    }
  },
  async summary(ctx: any) {
    if (!(await requireAdmin(ctx))) return;
    try {
      const [total, blocked] = await Promise.all([
        strapi.db.query(USER_UID).count(),
        strapi.db.query(USER_UID).count({ where: { blocked: true } }),
      ]);
      return ctx.send({ data: { total, active: total - blocked, blocked } });
    } catch (error) {
      return safeError(ctx, error, "get user summary");
    }
  },
  async roles(ctx: any) {
    if (!(await requireAdmin(ctx))) return;
    try {
      const roles = await strapi.db
        .query(ROLE_UID)
        .findMany({ orderBy: { name: "asc" } });
      return ctx.send({
        data: roles.map((role: any) => ({
          id: role.id,
          name: role.name,
          type: role.type,
        })),
      });
    } catch (error) {
      return safeError(ctx, error, "get roles");
    }
  },

  // Standalone administrative account creation only. Student and teacher accounts
  // MUST use their existing registration controllers to create linked profiles.
  async create(ctx: any) {
    if (!(await requireAdmin(ctx))) return;
    const body = ctx.request.body ?? {};
    const username = String(body.username ?? "").trim();
    const email = normalizedEmail(body.email);
    const password = String(body.password ?? "");
    if (!/^[a-zA-Z0-9_.-]{3,80}$/.test(username))
      return ctx.badRequest(
        "Username must be 3–80 characters (letters, numbers, _, ., -).",
      );
    if (!emailValid(email)) return ctx.badRequest("Invalid email address.");
    if (password.length < 12 || password.length > 128)
      return ctx.badRequest("Temporary password must be 12–128 characters.");
    if (!validId(body.roleId))
      return ctx.badRequest("Valid roleId is required.");
    try {
      const role = await findRole(body.roleId);
      if (!role) return ctx.badRequest("Role not found.");
      if (
        restrictedRoles.has(roleName(role)) ||
        ["authenticated", "public"].includes(roleName(role))
      )
        return ctx.badRequest(
          "This role requires a dedicated registration workflow or is not assignable.",
        );
      if (await uniqueConflict(username, email))
        return ctx.badRequest("Username or email already exists.");
      const user = await strapi
        .plugin("users-permissions")
        .service("user")
        .add({
          username,
          email,
          password,
          role: role.id,
          confirmed: true,
          blocked: false,
          must_change_password: true,
        });
      await strapi.db.query(USER_UID).update({
        where: { id: user.id },
        data: { must_change_password: true },
      });
      const created = await findUser(user.id);
      return ctx.send(
        { message: "User account created.", data: publicUser(created) },
        201,
      );
    } catch (error) {
      return safeError(ctx, error, "create user");
    }
  },

  // Email-only edit: role and profile changes have separate safeguards.
  async update(ctx: any) {
    if (!(await requireAdmin(ctx))) return;
    if (!validId(ctx.params.id)) return ctx.badRequest("Invalid user ID.");
    const body = ctx.request.body ?? {};
    if (Object.keys(body).some((k) => k !== "email"))
      return ctx.badRequest(
        "Only email can be edited here. Use dedicated workflows for username and role changes.",
      );
    const email = normalizedEmail(body.email);
    if (!emailValid(email)) return ctx.badRequest("Invalid email address.");
    try {
      const id = Number(ctx.params.id);
      const user = await findUser(id);
      if (!user) return ctx.notFound("User not found.");
      if (user.student || user.teacher)
        return ctx.badRequest(
          "Update linked Student/Teacher email through its existing management module to keep profile data consistent.",
        );
      if (await uniqueConflict(undefined, email, id))
        return ctx.badRequest("Email already exists.");
      await strapi.db
        .query(USER_UID)
        .update({ where: { id }, data: { email } });
      return ctx.send({
        message: "Account email updated.",
        data: publicUser(await findUser(id)),
      });
    } catch (error) {
      return safeError(ctx, error, "update user");
    }
  },

  async changeRole(ctx: any) {
    if (!(await requireAdmin(ctx))) return;
    if (!validId(ctx.params.id) || !validId(ctx.request.body?.roleId))
      return ctx.badRequest("Valid user ID and roleId required.");
    try {
      const id = Number(ctx.params.id);
      const user = await findUser(id);
      if (!user) return ctx.notFound("User not found.");
      if (user.student || user.teacher)
        return ctx.badRequest(
          "Linked Student/Teacher role changes must use the corresponding management workflow.",
        );
      const role = await findRole(ctx.request.body.roleId);
      if (!role) return ctx.badRequest("Role not found.");
      if (
        restrictedRoles.has(roleName(role)) ||
        ["authenticated", "public"].includes(roleName(role))
      )
        return ctx.badRequest(
          "This role cannot be assigned to a standalone account.",
        );
      if (id === Number(ctx.state.user.id) && roleName(role) !== "admin")
        return ctx.badRequest("You cannot remove your own Admin role.");
      if (
        roleName(user.role) === "admin" &&
        roleName(role) !== "admin" &&
        !user.blocked &&
        (await countActiveAdmins()) <= 1
      )
        return ctx.badRequest("Cannot remove the last active Admin.");

      await strapi.db.transaction(async ({ trx }) => {
        // STEP 1: Update the role through Strapi.
        // Strapi handles the relationship/link table.
        await strapi.db.query(USER_UID).update({
          where: { id },
          data: {
            role: role.id,
          },
        });

        // STEP 2: Increment session version atomically.
        const updated = await trx("up_users")
          .where({ id })
          .increment("session_version", 1);

        if (updated !== 1) {
          throw new Error("Unable to invalidate existing sessions.");
        }

        // STEP 3: Revoke all refresh tokens.
        await strapi.db.query("api::refresh-token.refresh-token").deleteMany({
          where: { user: id },
        });
      });

      return ctx.send({
        message: "Account role updated.",
        data: publicUser(await findUser(id)),
      });
    } catch (error) {
      return safeError(ctx, error, "change user role");
    }
  },

  async setBlocked(ctx: any) {
    if (!(await requireAdmin(ctx))) return;
    if (
      !validId(ctx.params.id) ||
      typeof ctx.request.body?.blocked !== "boolean"
    )
      return ctx.badRequest("Valid user ID and boolean blocked are required.");
    try {
      const id = Number(ctx.params.id);
      const blocked = ctx.request.body.blocked;
      const user = await findUser(id);
      if (!user) return ctx.notFound("User not found.");
      if (id === Number(ctx.state.user.id) && blocked)
        return ctx.badRequest("You cannot block your own account.");
      if (
        blocked &&
        !user.blocked &&
        roleName(user.role) === "admin" &&
        (await countActiveAdmins()) <= 1
      )
        return ctx.badRequest("Cannot block the last active Admin.");

      await strapi.db.transaction(async ({ trx }) => {
        const updated = await trx("up_users")
          .where({ id })
          .increment("session_version", 1)
          .update({
            blocked,
          });

        if (updated !== 1) {
          throw new Error("Unable to update account status.");
        }

        await strapi.db.query("api::refresh-token.refresh-token").deleteMany({
          where: { user: id },
        });
      });

      // Important: JWT/session invalidation must also be enforced in auth middleware.
      return ctx.send({
        message: blocked ? "Account blocked." : "Account unblocked.",
        data: publicUser(await findUser(id)),
      });
    } catch (error) {
      return safeError(ctx, error, "change account status");
    }
  },

  async resetPassword(ctx: any) {
    if (!(await requireAdmin(ctx))) return;

    if (!validId(ctx.params.id)) {
      return ctx.badRequest("Invalid user ID.");
    }

    const password = String(ctx.request.body?.temporaryPassword ?? "");

    if (password.length < 12 || password.length > 128) {
      return ctx.badRequest("Temporary password must be 12–128 characters.");
    }

    try {
      const id = Number(ctx.params.id);
      const user = await findUser(id);

      if (!user) {
        return ctx.notFound("User not found.");
      }

      // Prevent Admin from resetting their own password.
      if (id === Number(ctx.state.user.id)) {
        return ctx.badRequest(
          "Use Account Settings to change your own password.",
        );
      }

      const userService = strapi.plugin("users-permissions").service("user");

      // Temporary password must differ from current password.
      const isSame = await userService.validatePassword(
        password,
        user.password,
      );

      if (isSame) {
        return ctx.badRequest(
          "Temporary password must differ from the current password.",
        );
      }

      await strapi.db.transaction(async ({ trx }) => {
        // STEP 1: Update password using Strapi hashing.
        await userService.edit(id, {
          password,
        });

        // STEP 2: Increment session version atomically.
        // This invalidates previously issued JWTs.
        const updated = await trx("up_users")
          .where({ id })
          .increment("session_version", 1)
          .update({
            must_change_password: true,
          });

        if (updated !== 1) {
          throw new Error("Unable to invalidate existing sessions.");
        }

        // STEP 3: Revoke all existing refresh tokens.
        await strapi.db.query("api::refresh-token.refresh-token").deleteMany({
          where: { user: id },
        });
      });

      return ctx.send({
        message: "Temporary password set. User must change it at next login.",
      });
    } catch (error) {
      return safeError(ctx, error, "reset password");
    }
  },
};
