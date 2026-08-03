import { recalculatePortfolio } from "../../../../utils/recalculate-portfolio";

async function getPortfolioDocumentId(
  entryId: number | string,
) {
  const entry: any = await strapi.db
    .query("api::portfolio-entry.portfolio-entry")
    .findOne({
      where: {
        id: Number(entryId),
      },
      populate: {
        faculty_portfolio: true,
      },
    });

  return entry?.faculty_portfolio?.documentId || null;
}

function validateDates(
  startDate?: string | null,
  endDate?: string | null,
) {
  if (
    startDate &&
    endDate &&
    new Date(endDate) < new Date(startDate)
  ) {
    throw new Error(
      "End date cannot be earlier than start date.",
    );
  }
}

export default {
  async beforeCreate(event: any) {
    validateDates(
      event.params.data?.start_date,
      event.params.data?.end_date,
    );
  },

  async beforeUpdate(event: any) {
    const existing: any = await strapi.db
      .query("api::portfolio-entry.portfolio-entry")
      .findOne({
        where: event.params.where,
      });

    if (
      existing?.is_locked &&
      !event.params.data?.verification_status
    ) {
      throw new Error(
        "This portfolio entry is locked and cannot be edited.",
      );
    }

    validateDates(
      event.params.data?.start_date ?? existing?.start_date,
      event.params.data?.end_date ?? existing?.end_date,
    );
  },

  async afterCreate(event: any) {
    const portfolioDocumentId =
      await getPortfolioDocumentId(event.result.id);

    if (portfolioDocumentId) {
      await recalculatePortfolio(
        strapi,
        portfolioDocumentId,
      );
    }
  },

  async afterUpdate(event: any) {
    const portfolioDocumentId =
      await getPortfolioDocumentId(event.result.id);

    if (portfolioDocumentId) {
      await recalculatePortfolio(
        strapi,
        portfolioDocumentId,
      );
    }
  },

  async afterDelete(event: any) {
    const relation =
      event.params.data?.faculty_portfolio;

    const portfolioDocumentId =
      relation?.documentId ||
      relation?.connect?.[0]?.documentId ||
      null;

    if (portfolioDocumentId) {
      await recalculatePortfolio(
        strapi,
        portfolioDocumentId,
      );
    }
  },
};
