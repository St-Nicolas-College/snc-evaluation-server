const SALARY_RATE_UID =
  "api::salary-rate.salary-rate";

export type RateAssignmentStatus =
  | "matched"
  | "minimum_rate"
  | "not_configured";

export interface MaxRateResult {
  salaryRate: any | null;
  maxRate: number | null;
  status: RateAssignmentStatus;
  message: string;
}

export async function resolveMaxRate(
  strapi: any,
  rankingSchemeDocumentId: string,
  totalRankingPoints: number,
): Promise<MaxRateResult> {
  const totalPoints = Number(
    totalRankingPoints,
  );

  if (
    !Number.isFinite(totalPoints) ||
    totalPoints < 0
  ) {
    return {
      salaryRate: null,
      maxRate: null,
      status: "not_configured",
      message:
        "Rate not configured.",
    };
  }

  const rates: any[] =
    await strapi
      .documents(SALARY_RATE_UID)
      .findMany({
        filters: {
          ranking_scheme: {
            documentId: {
              $eq:
                rankingSchemeDocumentId,
            },
          },

          is_active: {
            $eq: true,
          },
        },

        sort: [
          "sort_order:asc",
        ],

        pagination: {
          page: 1,
          pageSize: 1000,
        },
      });

  /*
   * Rule 1:
   * Total faculty points equal to
   * or below 25 receive MAX RATE 147.
   */
  if (totalPoints <= 25) {
    const minimumRate =
      rates.find(
        (rate: any) =>
          rate.is_below_minimum ===
          true,
      );

    return {
      salaryRate:
        minimumRate || null,

      maxRate:
        minimumRate
          ? Number(
              minimumRate.max_rate,
            )
          : 147,

      status:
        "minimum_rate",

      message:
        "Total faculty points are equal to or below 25. MAX RATE 147 was assigned.",
    };
  }

  /*
   * Rule 2:
   * Above 25 points must exactly
   * match a configured point value.
   */
  const exactRate =
    rates.find(
      (rate: any) =>
        rate.is_below_minimum !==
          true &&
        Number(
          rate.point_value,
        ) === totalPoints,
    );

  if (exactRate) {
    return {
      salaryRate:
        exactRate,

      maxRate:
        Number(
          exactRate.max_rate,
        ),

      status:
        "matched",

      message:
        `Exact MAX RATE found for ${totalPoints} faculty points.`,
    };
  }

  /*
   * Rule 3:
   * No rounding, truncation,
   * interpolation, or nearest match.
   */
  return {
    salaryRate: null,
    maxRate: null,
    status:
      "not_configured",

    message:
      "Rate not configured.",
  };
}