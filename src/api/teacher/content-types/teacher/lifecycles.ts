/**
 * MERGE this logic into your existing Teacher lifecycle file.
 * Do not overwrite an existing lifecycle that already handles
 * full names, codes, or audit logs.
 */

import { ensureFacultyPortfolio } from "../../../../utils/ensure-faculty-portfolio";

export default {
  async afterCreate(event: any) {
    try {
      const teacher =
        event?.result;

      if (!teacher?.id) {
        return;
      }

      await ensureFacultyPortfolio(
        strapi,
        teacher.documentId ||
          teacher.id,
      );
    } catch (error) {
      strapi.log.error(
        "[Faculty Portfolio] Unable to create portfolio after teacher creation.",
        error,
      );
    }
  },

  async afterUpdate(event: any) {
    try {
      const teacher =
        event?.result;

      if (!teacher?.id) {
        return;
      }

      await ensureFacultyPortfolio(
        strapi,
        teacher.documentId ||
          teacher.id,
      );
    } catch (error) {
      strapi.log.error(
        "[Faculty Portfolio] Unable to ensure portfolio after teacher update.",
        error,
      );
    }
  },
};
