const EVALUATION_UID =
  "api::evaluation.evaluation";

const STUDENT_EVALUATION_CODE =
  "student-faculty";

type CalculateStudentEvaluationPointsParams = {
  strapi: any;
  teacherDocumentId: string;
  schoolYear: string;
  semester: string;
  maximumPoints?: number;
};

export type StudentEvaluationResult = {
  evaluationType: string;
  evaluationCode: string;
  recordCount: number;
  rawAverageScore: number;
  overallRating:
    | "Outstanding"
    | "Excellent"
    | "Satisfactory"
    | "Fair"
    | "Poor"
    | "No Rating";
  awardedPoints: number;
  maximumPoints: number;
};

export async function calculateStudentEvaluationPoints({
  strapi,
  teacherDocumentId,
  schoolYear,
  semester,
}: CalculateStudentEvaluationPointsParams): Promise<StudentEvaluationResult> {
  validateInput({
    teacherDocumentId,
    schoolYear,
    semester,
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
                $eq: STUDENT_EVALUATION_CODE,
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
        ),
    );

  if (
    validEvaluations.length === 0
  ) {
    return {
      evaluationType:
        "Student Evaluation",

      evaluationCode:
        STUDENT_EVALUATION_CODE,

      recordCount: 0,

      rawAverageScore: 0,

      overallRating:
        "No Rating",

      awardedPoints: 0,

      maximumPoints: 5,
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
    resolveStudentOverallRating(
      rawAverageScore,
    );

  const evaluationType =
    validEvaluations[0]
      ?.batch
      ?.evaluation_type ||
    null;

  return {
    evaluationType:
      evaluationType?.name ||
      "Student Evaluation",

    evaluationCode:
      evaluationType?.code ||
      STUDENT_EVALUATION_CODE,

    recordCount:
      validEvaluations.length,

    rawAverageScore,

    overallRating:
      ratingResult.rating,

    awardedPoints:
      ratingResult.points,

    maximumPoints: 5,
  };
}

function resolveStudentOverallRating(
  averageScore: number,
): {
  rating:
    | "Outstanding"
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

  if (averageScore >= 4.5) {
    return {
      rating: "Outstanding",
      points: 5,
    };
  }

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
}: {
  teacherDocumentId: string;
  schoolYear: string;
  semester: string;
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