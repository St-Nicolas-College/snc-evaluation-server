import { factories } from "@strapi/strapi";

import { computeFacultyRanking } from "../services/ranking-computation";

const UID = "api::faculty-ranking.faculty-ranking";

export default factories.createCoreController(UID, ({ strapi }) => ({
  async compute(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Authentication is required.");
    }

    const roleName = String(user?.role?.name || user?.role?.type || "");

    if (!["HR", "Admin"].includes(roleName)) {
      return ctx.forbidden(
        "Only HR or Admin users may compute faculty rankings.",
      );
    }

    const teacherDocumentId = String(ctx.params.teacherDocumentId || "").trim();

    const requestData = ctx.request.body?.data || ctx.request.body || {};

    const rankingSchemeDocumentId = String(
      requestData.ranking_scheme_document_id ||
        process.env.RANKING_SCHEME_DOCUMENT_ID ||
        "",
    ).trim();

    const schoolYear = String(requestData.school_year || "").trim();

    const semester = String(requestData.semester || "Annual").trim();

    if (!teacherDocumentId) {
      return ctx.badRequest("Teacher document ID is required.");
    }

    if (!rankingSchemeDocumentId) {
      return ctx.badRequest("Ranking scheme document ID is required.");
    }

    if (!schoolYear) {
      return ctx.badRequest("School year is required.");
    }

    try {
      const result = await computeFacultyRanking({
        strapi,

        teacherDocumentId,

        rankingSchemeDocumentId,

        schoolYear,

        semester: semester as any,

        computedByUserId: user.id,
      });

      ctx.body = {
        data: result,
      };
    } catch (error: any) {
      strapi.log.error("[Faculty Ranking Compute]", error);

      return ctx.badRequest(
        error?.message || "Unable to compute the faculty ranking.",
      );
    }
  },

  async batchCompute(ctx) {
      try {
        const body = ctx.request.body?.data || ctx.request.body || {};

        const rankingSchemeDocumentId = String(
          body.ranking_scheme_document_id || "",
        ).trim();

        const schoolYear = String(
          body.school_year || "",
        ).trim();

        const semester = String(
          body.semester || "",
        ).trim();

        const teacherDocumentIds = Array.isArray(
          body.teacher_document_ids,
        )
          ? body.teacher_document_ids
              .map((value: unknown) =>
                String(value || "").trim(),
              )
              .filter(Boolean)
          : [];

        if (!rankingSchemeDocumentId) {
          return ctx.badRequest(
            "Ranking scheme is required.",
          );
        }

        if (!schoolYear) {
          return ctx.badRequest(
            "School year is required.",
          );
        }

        if (!semester) {
          return ctx.badRequest(
            "Semester is required.",
          );
        }

        if (!teacherDocumentIds.length) {
          return ctx.badRequest(
            "At least one faculty or dean must be selected.",
          );
        }

        const computedByUserId =
          ctx.state?.user?.id || undefined;

        const results: any[] = [];
        const errors: any[] = [];

        for (const teacherDocumentId of teacherDocumentIds) {
          try {
            const existingRankings: any[] = await strapi
              .documents(
                "api::faculty-ranking.faculty-ranking",
              )
              .findMany({
                filters: {
                  teacher: {
                    documentId: {
                      $eq: teacherDocumentId,
                    },
                  },

                  ranking_scheme: {
                    documentId: {
                      $eq: rankingSchemeDocumentId,
                    },
                  },

                  school_year: {
                    $eq: schoolYear,
                  },

                  semester: {
                    $eq: semester,
                  },
                },

                pagination: {
                  page: 1,
                  pageSize: 1,
                },
              });

            const existing =
              existingRankings?.[0];

            if (
              existing?.computation_status ===
              "finalized"
            ) {
              errors.push({
                teacher_document_id:
                  teacherDocumentId,

                status: "skipped",

                message:
                  "Ranking is already finalized and was not recomputed.",
              });

              continue;
            }

            const computed =
              await computeFacultyRanking({
                strapi,
                teacherDocumentId,
                rankingSchemeDocumentId,
                schoolYear,
                semester,
                computedByUserId,
              });

            results.push({
              teacher_document_id:
                teacherDocumentId,

              status: "computed",

              ranking_document_id:
                computed?.ranking?.documentId ||
                null,

              total_points:
                computed?.points
                  ?.totalRankingPoints || 0,

              rank:
                computed?.ranking?.rank_name ||
                null,

              salary_rate:
                computed?.ranking?.salary_rate ||
                null,
            });
          } catch (error: any) {
            errors.push({
              teacher_document_id:
                teacherDocumentId,

              status: "failed",

              message:
                error?.message ||
                "Unable to compute faculty ranking.",
            });
          }
        }

        ctx.body = {
          data: {
            requested:
              teacherDocumentIds.length,

            successful:
              results.length,

            failed:
              errors.filter(
                (item) =>
                  item.status === "failed",
              ).length,

            skipped:
              errors.filter(
                (item) =>
                  item.status === "skipped",
              ).length,

            results,
            errors,
          },
        };
      } catch (error: any) {
        strapi.log.error(
          "[Batch Faculty Ranking] Error",
          error,
        );

        return ctx.internalServerError(
          error?.message ||
            "Unable to batch compute faculty rankings.",
        );
      }
    },
}));
