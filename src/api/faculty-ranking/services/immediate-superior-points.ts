const EVALUATION_UID =
  "api::evaluation.evaluation";

const IMMEDIATE_SUPERIOR_CODE =
  "dean-to-faculty";

type CalculateImmediateSuperiorPointsParams = {
  strapi: any;
  teacherDocumentId: string;
  schoolYear: string;
  semester: string;
  maximumPoints?: number;
};

export type ImmediateSuperiorResult = {
  evaluationType: string;
  evaluationCode: string;
  recordCount: number;
  rawAverageScore: number;
  overallRating:
    | "Excellent"
    | "Satisfactory"
    | "Fair"
    | "Poor"
    | "No Rating";
  awardedPoints: number;
  maximumPoints: number;
};

export async function calculateImmediateSuperiorEvaluationPoints({
  strapi,
  teacherDocumentId,
  schoolYear,
  semester,
  maximumPoints = 4,
}: CalculateImmediateSuperiorPointsParams): Promise<ImmediateSuperiorResult> {
  validateInput({
    teacherDocumentId,
    schoolYear,
    semester,
    maximumPoints,
  });

  const evaluations: any[] =
    await strapi
      .documents(EVALUATION_UID)
      .findMany({
        filters: {
          teacher: {
            documentId: {
              $eq: teacherDocumentId,
            },
          },

          batch: {
            school_year: {
              $eq: schoolYear,
            },

            semester: {
              $eq: semester,
            },

            evaluation_type: {
              code: {
                $eq:
                  IMMEDIATE_SUPERIOR_CODE,
              },
            },
          },
        },

        populate: {
          batch: {
            populate: {
              evaluation_type: true,
            },
          },

          dean_coordinator: true,
        },

        pagination: {
          page: 1,
          pageSize: 1000,
        },
      });

  const validEvaluations =
    evaluations.filter(
      (evaluation: any) =>
        Number.isFinite(
          Number(
            evaluation.average_score,
          ),
        ) &&
        Number(
          evaluation.average_score,
        ) > 0,
    );

  const evaluationType =
    validEvaluations[0]
      ?.batch?.evaluation_type ||
    evaluations[0]
      ?.batch?.evaluation_type ||
    null;

  if (
    validEvaluations.length === 0
  ) {
    return {
      evaluationType:
        evaluationType?.name ||
        "Immediate Superior Evaluation",

      evaluationCode:
        evaluationType?.code ||
        IMMEDIATE_SUPERIOR_CODE,

      recordCount: 0,

      rawAverageScore: 0,

      overallRating:
        "No Rating",

      awardedPoints: 0,

      maximumPoints:
        Number(maximumPoints),
    };
  }

  const scoreTotal =
    validEvaluations.reduce(
      (
        total: number,
        evaluation: any,
      ) =>
        total +
        Number(
          evaluation.average_score,
        ),
      0,
    );

  const rawAverageScore =
    round(
      scoreTotal /
        validEvaluations.length,
      4,
    );

  const ratingResult =
    resolveImmediateSuperiorRating(
      rawAverageScore,
    );

  return {
    evaluationType:
      evaluationType?.name ||
      "Immediate Superior Evaluation",

    evaluationCode:
      evaluationType?.code ||
      IMMEDIATE_SUPERIOR_CODE,

    recordCount:
      validEvaluations.length,

    rawAverageScore,

    overallRating:
      ratingResult.rating,

    awardedPoints:
      Math.min(
        ratingResult.points,
        Number(maximumPoints),
      ),

    maximumPoints:
      Number(maximumPoints),
  };
}

function resolveImmediateSuperiorRating(
  averageScore: number,
): {
  rating:
    | "Excellent"
    | "Satisfactory"
    | "Fair"
    | "Poor"
    | "No Rating";
  points: number;
} {
  if (
    !Number.isFinite(
      averageScore,
    ) ||
    averageScore <= 0
  ) {
    return {
      rating: "No Rating",
      points: 0,
    };
  }

  /*
   * Assumes a 1–4 rating scale:
   *
   * 3.50–4.00 = Excellent
   * 2.50–3.49 = Satisfactory
   * 1.50–2.49 = Fair
   * 1.00–1.49 = Poor
   */

  if (averageScore >= 3.5) {
    return {
      rating: "Excellent",
      points: 4,
    };
  }

  if (averageScore >= 2.5) {
    return {
      rating: "Satisfactory",
      points: 3,
    };
  }

  if (averageScore >= 1.5) {
    return {
      rating: "Fair",
      points: 2,
    };
  }

  return {
    rating: "Poor",
    points: 1,
  };
}

function validateInput({
  teacherDocumentId,
  schoolYear,
  semester,
  maximumPoints,
}: {
  teacherDocumentId: string;
  schoolYear: string;
  semester: string;
  maximumPoints: number;
}) {
  if (
    !String(
      teacherDocumentId || "",
    ).trim()
  ) {
    throw new Error(
      "Teacher document ID is required.",
    );
  }

  if (
    !String(
      schoolYear || "",
    ).trim()
  ) {
    throw new Error(
      "School year is required.",
    );
  }

  if (
    !String(
      semester || "",
    ).trim()
  ) {
    throw new Error(
      "Semester is required.",
    );
  }

  const parsedMaximum =
    Number(maximumPoints);

  if (
    !Number.isFinite(
      parsedMaximum,
    ) ||
    parsedMaximum < 0
  ) {
    throw new Error(
      "Immediate Superior maximum points must be a valid non-negative number.",
    );
  }
}

function round(
  value: number,
  decimals = 4,
) {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      (
        value +
        Number.EPSILON
      ) *
        multiplier,
    ) / multiplier
  );
}