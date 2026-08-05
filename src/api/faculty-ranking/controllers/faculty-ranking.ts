import {
  factories,
} from "@strapi/strapi";

import {
  computeFacultyRanking,
} from "../services/ranking-computation";

const UID =
  "api::faculty-ranking.faculty-ranking";

export default factories.createCoreController(
  UID,
  ({ strapi }) => ({
    async compute(ctx) {
      const user =
        ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication is required.",
        );
      }

      const roleName = String(
        user?.role?.name ||
          user?.role?.type ||
          "",
      );

      if (
        !["HR", "Admin"].includes(
          roleName,
        )
      ) {
        return ctx.forbidden(
          "Only HR or Admin users may compute faculty rankings.",
        );
      }

      const teacherDocumentId =
        String(
          ctx.params
            .teacherDocumentId ||
            "",
        ).trim();

      const requestData =
        ctx.request.body?.data ||
        ctx.request.body ||
        {};

      const rankingSchemeDocumentId =
        String(
          requestData
            .ranking_scheme_document_id ||
            process.env
              .RANKING_SCHEME_DOCUMENT_ID ||
            "",
        ).trim();

      const schoolYear =
        String(
          requestData.school_year ||
            "",
        ).trim();

      const semester =
        String(
          requestData.semester ||
            "annual",
        ).trim();

      if (!teacherDocumentId) {
        return ctx.badRequest(
          "Teacher document ID is required.",
        );
      }

      if (
        !rankingSchemeDocumentId
      ) {
        return ctx.badRequest(
          "Ranking scheme document ID is required.",
        );
      }

      if (!schoolYear) {
        return ctx.badRequest(
          "School year is required.",
        );
      }

      try {
        const result =
          await computeFacultyRanking({
            strapi,

            teacherDocumentId,

            rankingSchemeDocumentId,

            schoolYear,

            semester:
              semester as any,

            computedByUserId:
              user.id,
          });

        ctx.body = {
          data: result,
        };
      } catch (error: any) {
        strapi.log.error(
          "[Faculty Ranking Compute]",
          error,
        );

        return ctx.badRequest(
          error?.message ||
            "Unable to compute the faculty ranking.",
        );
      }
    },
  }),
);