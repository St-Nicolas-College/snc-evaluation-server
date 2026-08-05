import type { Core } from '@strapi/strapi';
import {
  seedFacultyMaxRates,
} from "./scripts/seed-faculty-max-rates";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi; }) {
     const rankingSchemeDocumentId =
      process.env
        .RANKING_SCHEME_DOCUMENT_ID;

    if (!rankingSchemeDocumentId) {
      strapi.log.warn(
        "[Faculty MAX Rate Seed] RANKING_SCHEME_DOCUMENT_ID is not configured.",
      );

      return;
    }

    await seedFacultyMaxRates(
      strapi,
      rankingSchemeDocumentId,
    );
  },
};
