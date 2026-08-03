import { factories } from "@strapi/strapi";
import { ensureFacultyPortfolio } from "../../../utils/ensure-faculty-portfolio";
import { recalculatePortfolio } from "../../../utils/recalculate-portfolio";

const UID =
  "api::faculty-portfolio.faculty-portfolio";

export default factories.createCoreController(
  UID,
  ({ strapi }) => ({
    async myPortfolio(ctx) {
      const user = requireUser(ctx);

      const teacher: any = await strapi.db
        .query("api::teacher.teacher")
        .findOne({
          where: {
            user: {
              id: user.id,
            },
          },
          populate: {
            user: true,
          },
        });

      if (!teacher) {
        return ctx.notFound(
          "Faculty profile was not found.",
        );
      }

      const portfolio: any =
        await ensureFacultyPortfolio(
          strapi,
          teacher.documentId ||
            teacher.id,
        );

      const populated: any = await strapi
        .documents(UID)
        .findOne({
          documentId:
            portfolio.documentId,
          populate: {
            faculty: {
              populate: {
                department: true,
                user: true,
              },
            },
            entries: {
              populate: {
                evidence: {
                  populate: {
                    file: true,
                  },
                },
                verification_history: {
                  populate: {
                    reviewer: true,
                  },
                },
              },
            },
          },
        });

      ctx.body = {
        data: populated,
      };
    },

    async departmentPortfolios(ctx) {
      const user = requireUser(ctx);
      const roleName =
        getRoleName(user);

      if (
        !["Dean", "Admin"].includes(roleName)
      ) {
        return ctx.forbidden(
          "Only Dean or Admin users may access department portfolios.",
        );
      }

      const query = ctx.request.query || {};

      const page = Math.max(
        1,
        Number(query.page || 1),
      );

      const pageSize = Math.min(
        100,
        Math.max(
          1,
          Number(query.pageSize || 25),
        ),
      );

      const search = String(
        query.search || "",
      )
        .trim()
        .toLowerCase();

      const portfolioStatus = String(
        query.portfolio_status || "",
      ).trim();

      const dean = roleName === "Dean"
        ? await getDeanRecord(
            strapi,
            user.id,
          )
        : null;

      if (
        roleName === "Dean" &&
        !dean
      ) {
        return ctx.notFound(
          "Dean profile was not found.",
        );
      }

      const department =
        dean?.department || null;

      if (
        roleName === "Dean" &&
        !department
      ) {
        return ctx.badRequest(
          "The Dean account is not assigned to a department.",
        );
      }

      const filters: any = {};

      if (roleName === "Dean") {
        filters.faculty = {
          department: {
            documentId: {
              $eq:
                department.documentId,
            },
          },
        };
      }

      if (portfolioStatus) {
        filters.portfolio_status = {
          $eq: portfolioStatus,
        };
      }

      const allPortfolios: any[] =
        await strapi
          .documents(UID)
          .findMany({
            filters,
            populate: {
              faculty: {
                populate: {
                  department: true,
                  user: true,
                },
              },
              entries: {
                populate: {
                  evidence: {
                    populate: {
                      file: true,
                    },
                  },
                },
              },
            },
            sort: [
              "updatedAt:desc",
            ],
            pagination: {
              page: 1,
              pageSize: 1000,
            },
          });

      const searched = search
        ? allPortfolios.filter(
            (portfolio: any) => {
              const faculty =
                portfolio?.faculty;

              const searchable = [
                faculty?.name,
                faculty?.full_name,
                faculty?.employee_no,
                faculty?.user
                  ?.username,
                faculty?.user?.email,
                portfolio?.portfolio_no,
                portfolio
                  ?.portfolio_status,
                faculty?.department
                  ?.name,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

              return searchable.includes(
                search,
              );
            },
          )
        : allPortfolios;

      const total =
        searched.length;

      const pageCount = Math.max(
        1,
        Math.ceil(total / pageSize),
      );

      const safePage = Math.min(
        page,
        pageCount,
      );

      const start =
        (safePage - 1) * pageSize;

      const paginated =
        searched.slice(
          start,
          start + pageSize,
        );

      ctx.body = {
        data: paginated.map(
          summarizePortfolio,
        ),
        meta: {
          pagination: {
            page: safePage,
            pageSize,
            pageCount,
            total,
          },
          department:
            department
              ? {
                  id:
                    department.id,
                  documentId:
                    department.documentId,
                  name:
                    department.name,
                }
              : null,
        },
      };
    },

    async departmentPortfolioDetail(
      ctx,
    ) {
      const user = requireUser(ctx);
      const roleName =
        getRoleName(user);

      if (
        !["Dean", "Admin"].includes(roleName)
      ) {
        return ctx.forbidden(
          "Only Dean or Admin users may review faculty portfolios.",
        );
      }

      const documentId = String(
        ctx.params.documentId || "",
      ).trim();

      if (
        !documentId ||
        documentId === "undefined" ||
        documentId === "null"
      ) {
        return ctx.badRequest(
          "A valid portfolio document ID is required.",
        );
      }

      const portfolio: any =
        await strapi
          .documents(UID)
          .findOne({
            documentId,
            populate: {
              faculty: {
                populate: {
                  department: true,
                  user: true,
                },
              },
              entries: {
                populate: {
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
              },
            },
          });

      if (!portfolio) {
        return ctx.notFound(
          "Faculty portfolio was not found.",
        );
      }

      if (roleName === "Dean") {
        const dean = await getDeanRecord(
          strapi,
          user.id,
        );

        const deanDepartmentId =
          dean?.department
            ?.documentId;

        const facultyDepartmentId =
          portfolio?.faculty
            ?.department
            ?.documentId;

        if (
          !deanDepartmentId ||
          deanDepartmentId !==
            facultyDepartmentId
        ) {
          return ctx.forbidden(
            "You may review only faculty portfolios within your department.",
          );
        }
      }

      ctx.body = {
        data: portfolio,
      };
    },

    async recalculate(ctx) {
      requireUser(ctx);

      const documentId =
        String(
          ctx.params.documentId,
        );

      await ensurePortfolioAccess(
        strapi,
        ctx,
        documentId,
      );

      const updated =
        await recalculatePortfolio(
          strapi,
          documentId,
        );

      ctx.body = {
        data: updated,
      };
    },
  }),
);

function requireUser(ctx: any) {
  const user = ctx.state.user;

  if (!user) {
    ctx.unauthorized(
      "Authentication is required.",
    );
  }

  return user;
}

function getRoleName(user: any) {
  return String(
    user?.role?.name ||
      user?.role?.type ||
      "",
  );
}

async function getDeanRecord(
  strapi: any,
  userId: number,
) {
  return strapi.db
    .query("api::teacher.teacher")
    .findOne({
      where: {
        user: {
          id: userId,
        },
      },
      populate: {
        user: {
          populate: {
            role: true,
          },
        },
        department: true,
      },
    });
}

function summarizePortfolio(
  portfolio: any,
) {
  const entries = Array.isArray(
    portfolio?.entries,
  )
    ? portfolio.entries
    : [];

  const countStatus = (
    statuses: string[],
  ) =>
    entries.filter((entry: any) =>
      statuses.includes(
        entry?.verification_status,
      ),
    ).length;

  return {
    id:
      portfolio?.id,

    documentId:
      portfolio?.documentId,

    portfolio_no:
      portfolio?.portfolio_no,

    portfolio_status:
      portfolio?.portfolio_status,

    completion_percentage:
      portfolio?.completion_percentage,

    last_verified_at:
      portfolio?.last_verified_at,

    remarks:
      portfolio?.remarks,

    createdAt:
      portfolio?.createdAt,

    updatedAt:
      portfolio?.updatedAt,

    faculty:
      portfolio?.faculty,

    entries,

    summary: {
      total_entries:
        entries.length,

      draft:
        countStatus(["draft"]),

      for_verification:
        countStatus([
          "for_verification",
          "pending",
        ]),

      verified:
        countStatus(["verified"]),

      needs_correction:
        countStatus([
          "needs_correction",
        ]),

      rejected:
        countStatus(["rejected"]),

      expired:
        countStatus(["expired"]),
    },
  };
}

async function ensurePortfolioAccess(
  strapi: any,
  ctx: any,
  portfolioDocumentId: string,
) {
  const user = requireUser(ctx);
  const roleName =
    getRoleName(user);

  const portfolio: any =
    await strapi
      .documents(UID)
      .findOne({
        documentId:
          portfolioDocumentId,
        populate: {
          faculty: {
            populate: {
              user: true,
              department: true,
            },
          },
        },
      });

  if (!portfolio) {
    ctx.notFound(
      "Faculty portfolio was not found.",
    );
  }

  if (
    roleName === "Faculty" &&
    portfolio?.faculty?.user?.id !==
      user.id
  ) {
    ctx.forbidden(
      "You may access only your own portfolio.",
    );
  }

  if (roleName === "Dean") {
    const dean = await getDeanRecord(
      strapi,
      user.id,
    );

    if (
      dean?.department?.documentId !==
      portfolio?.faculty?.department
        ?.documentId
    ) {
      ctx.forbidden(
        "You may access only portfolios within your department.",
      );
    }
  }

  if (
    ![
      "Faculty",
      "Dean",
      "Admin",
    ].includes(roleName)
  ) {
    ctx.forbidden(
      "You are not allowed to access this portfolio.",
    );
  }

  return portfolio;
}
