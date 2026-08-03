// import type { Core } from '@strapi/strapi';
import { seedRankingScheme2025 } from "./scripts/seed-ranking-scheme-2025";

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
  async bootstrap({ strapi }: { strapi: any }) {
    if (process.env.SEED_RANKING_SCHEME_2025 === "true") {
      await seedRankingScheme2025(strapi);
    }
  },
};
