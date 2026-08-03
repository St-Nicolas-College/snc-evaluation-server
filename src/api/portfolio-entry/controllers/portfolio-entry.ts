import { factories } from "@strapi/strapi";

const UID = "api::portfolio-entry.portfolio-entry";

export default factories.createCoreController(UID, ({ strapi }) => ({
  async submit(ctx) {
    return runTransition(strapi, ctx, "for_verification");
  },

  async returnForCorrection(ctx) {
    return runTransition(strapi, ctx, "needs_correction");
  },

  async verify(ctx) {
    return runTransition(strapi, ctx, "verified");
  },

  async reject(ctx) {
    return runTransition(strapi, ctx, "rejected");
  },

  async reopen(ctx) {
    return runTransition(strapi, ctx, "needs_correction");
  },

  async expire(ctx) {
    return runTransition(strapi, ctx, "expired");
  },

  /**
   * Merge these methods into the object returned by your existing
   * portfolio-entry controller.
   */

  async verificationQueue(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Authentication is required.");
    }

    const roleName = String(user?.role?.name || user?.role?.type || "");

    if (!["HR", "Admin"].includes(roleName)) {
      return ctx.forbidden(
        "Only HR or Admin users may access the verification queue.",
      );
    }

    const query = ctx.request.query || {};

    const page = Math.max(1, Number(query.page || 1));

    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || 25)));

    const search = String(query.search || "")
      .trim()
      .toLowerCase();

    const entryType = String(query.entry_type || "").trim();

    const verificationStatus = String(
      query.verification_status || "for_verification",
    ).trim();

    const filters: any = {};

    if (entryType) {
      filters.entry_type = {
        $eq: entryType,
      };
    }

    if (verificationStatus) {
      filters.verification_status = {
        $eq: verificationStatus,
      };
    }

    const allEntries: any[] = await strapi
      .documents("api::portfolio-entry.portfolio-entry")
      .findMany({
        filters,

        populate: {
          faculty_portfolio: {
            populate: {
              faculty: {
                populate: {
                  department: true,
                  user: true,
                },
              },
            },
          },

          evidence: {
            populate: {
              file: true,
            },
          },

          verified_by: true,
        },

        sort: ["updatedAt:desc"],

        pagination: {
          page: 1,
          pageSize: 1000,
        },
      });

    const searched = search
      ? allEntries.filter((entry: any) => {
          const faculty = entry?.faculty_portfolio?.faculty;

          const searchable = [
            entry?.title,
            entry?.description,
            entry?.entry_type,

            faculty?.name,
            faculty?.full_name,
            faculty?.employee_no,

            faculty?.user?.username,

            faculty?.user?.email,

            faculty?.department?.name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(search);
        })
      : allEntries;

    const total = searched.length;

    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    const safePage = Math.min(page, pageCount);

    const start = (safePage - 1) * pageSize;

    ctx.body = {
      data: searched.slice(start, start + pageSize),

      meta: {
        pagination: {
          page: safePage,
          pageSize,
          pageCount,
          total,
        },
      },
    };
  },

  async verificationQueueDetail(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Authentication is required.");
    }

    const roleName = String(user?.role?.name || user?.role?.type || "");

    if (!["HR", "Admin"].includes(roleName)) {
      return ctx.forbidden(
        "Only HR or Admin users may review portfolio entries.",
      );
    }

    const documentId = String(ctx.params.documentId || "").trim();

    if (!documentId || documentId === "undefined" || documentId === "null") {
      return ctx.badRequest("A valid portfolio entry document ID is required.");
    }

    const entry: any = await strapi
      .documents("api::portfolio-entry.portfolio-entry")
      .findOne({
        documentId,

        populate: {
          faculty_portfolio: {
            populate: {
              faculty: {
                populate: {
                  department: true,
                  user: true,
                },
              },
            },
          },

          evidence: {
            populate: {
              file: true,
              verified_by: true,
            },
          },

          verified_by: true,

          verification_history: {
            populate: {
              reviewer: true,
            },
          },
        },
      });

    if (!entry) {
      return ctx.notFound("Portfolio entry was not found.");
    }

    ctx.body = {
      data: entry,
    };
  },
}));

async function runTransition(
  strapi: any,
  ctx: any,
  nextStatus:
    | "for_verification"
    | "needs_correction"
    | "verified"
    | "rejected"
    | "expired",
) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized("Authentication is required.");
  }

  try {
    const service = strapi.service("api::portfolio-entry.portfolio-entry");

    const data = await service.transition({
      entryDocumentId: String(ctx.params.documentId),
      user,
      nextStatus,
      remarks:
        ctx.request.body?.remarks || ctx.request.body?.data?.remarks || "",
    });

    ctx.body = { data };
  } catch (error: any) {
    return ctx.badRequest(error?.message || "The portfolio action failed.");
  }
}
