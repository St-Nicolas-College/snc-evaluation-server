import { calculateImmediateSuperiorEvaluationPoints } from "./immediate-superior-points";

import { resolveMaxRate } from "./max-rate-resolver";

import { calculateStudentEvaluationPoints } from "./student-evaluation-points";

const TEACHER_UID = "api::teacher.teacher";

const PORTFOLIO_ENTRY_UID = "api::portfolio-entry.portfolio-entry";

const RANKING_SCHEME_UID = "api::ranking-scheme.ranking-scheme";

const FACULTY_RANKING_UID = "api::faculty-ranking.faculty-ranking";

type CategoryTotals = {
  educationalQualifications: number;
  eligibility: number;
  trainingSeminars: number;
  research: number;
  awardsRecognition: number;
  professionalExperience: number;
  loyalty: number;
  corporateSocialResponsibility: number;

  manualImmediateSuperiorEvaluation: number;
  manualHrEvaluation: number;
};

type ComputeFacultyRankingParams = {
  strapi: any;
  teacherDocumentId: string;
  rankingSchemeDocumentId: string;
  schoolYear: string;
  semester: string;
  computedByUserId?: number;
};

const ALLOWED_SEMESTERS = ["1st Semester", "2nd Semester", "Summer", "Annual"];

export async function computeFacultyRanking({
  strapi,
  teacherDocumentId,
  rankingSchemeDocumentId,
  schoolYear,
  semester,
  computedByUserId,
}: ComputeFacultyRankingParams) {
  validateRequest({
    teacherDocumentId,
    rankingSchemeDocumentId,
    schoolYear,
    semester,
  });

  /* ========================================================
     LOAD TEACHER
  ======================================================== */

  const teacher: any = await strapi.documents(TEACHER_UID).findOne({
    documentId: teacherDocumentId,

    populate: {
      department: true,

      user: {
        populate: {
          role: true,
        },
      },
    },
  });

  if (!teacher) {
    throw new Error("Faculty record was not found.");
  }

  const teacherRole = resolveTeacherRole(teacher);

  const isDean = teacherRole === "dean";

  /* ========================================================
     LOAD RANKING SCHEME
  ======================================================== */

  const rankingScheme: any = await strapi
    .documents(RANKING_SCHEME_UID)
    .findOne({
      documentId: rankingSchemeDocumentId,

      populate: {
        categories: {
          populate: {
            criteria: true,
          },
        },

        rank_bands: true,
      },
    });

  if (!rankingScheme) {
    throw new Error("Ranking scheme was not found.");
  }

  if (
    rankingScheme.is_active !== true ||
    rankingScheme.scheme_status !== "active"
  ) {
    throw new Error("The selected ranking scheme is not active.");
  }

  if (
    rankingScheme.academic_year &&
    String(rankingScheme.academic_year).trim() !== schoolYear
  ) {
    throw new Error(
      `The selected ranking scheme is configured for Academic Year ${rankingScheme.academic_year}.`,
    );
  }

  /* ========================================================
     EVALUATION MAXIMUMS
  ======================================================== */

  const studentEvaluationMaximum = toNonNegativeNumber(
    rankingScheme.student_evaluation_max_points,
    5,
  );

  const immediateSuperiorMaximum = toNonNegativeNumber(
    rankingScheme.immediate_superior_max_points,
    4,
  );

  const hrEvaluationMaximum = toNonNegativeNumber(
    rankingScheme.hr_evaluation_max_points,
    4,
  );

  const evaluationMaximum = toNonNegativeNumber(
    rankingScheme.evaluation_max_points,
    13,
  );

  const componentMaximumTotal =
    studentEvaluationMaximum + immediateSuperiorMaximum + hrEvaluationMaximum;

  if (!approximatelyEqual(componentMaximumTotal, evaluationMaximum)) {
    throw new Error(
      `Evaluation component maximums total ${formatNumber(
        componentMaximumTotal,
      )}, but the ranking scheme evaluation maximum is ${formatNumber(
        evaluationMaximum,
      )}.`,
    );
  }

  /* ========================================================
     LOAD PORTFOLIO ENTRIES
  ======================================================== */

  const allCurrentEntries: any[] = await strapi
    .documents(PORTFOLIO_ENTRY_UID)
    .findMany({
      filters: {
        teacher: {
          documentId: {
            $eq: teacherDocumentId,
          },
        },

        is_current: {
          $eq: true,
        },
      },

      sort: ["entry_type:asc", "date_earned:desc", "createdAt:desc"],

      pagination: {
        page: 1,
        pageSize: 1000,
      },
    });

  /*
   * Ordinary portfolio entries remain
   * usable across ranking cycles.
   *
   * Evaluation entries must match the
   * selected school year and semester.
   */
  const portfolioEntries = allCurrentEntries.filter((entry: any) => {
    if (entry.entry_type !== "evaluation") {
      return true;
    }

    return (
      normalizeText(entry.school_year) === normalizeText(schoolYear) &&
      normalizeText(entry.semester) === normalizeText(semester)
    );
  });

  const categoryTotals = calculatePortfolioPoints(portfolioEntries);

  /* ========================================================
     AUTOMATIC STUDENT EVALUATION
  ======================================================== */

  const studentEvaluationResult = await calculateStudentEvaluationPoints({
    strapi,
    teacherDocumentId,
    schoolYear,
    semester,
  });

  const studentEvaluationPoints = Number(
    studentEvaluationResult.awardedPoints || 0,
  );

  /* ========================================================
     IMMEDIATE SUPERIOR EVALUATION
  ======================================================== */

  let automaticSuperiorResult: any | null = null;

  let immediateSuperiorPoints = 0;

  if (isDean) {
    /*
     * A Dean's immediate superior
     * evaluation is entered manually
     * by HR as an Evaluation portfolio
     * entry.
     */
    immediateSuperiorPoints = round(
      categoryTotals.manualImmediateSuperiorEvaluation,
      4,
    );

    if (immediateSuperiorPoints <= 0) {
      throw new Error(
        "A manual Immediate Superior Evaluation entry is required when computing a Dean ranking.",
      );
    }
  } else {
    /*
     * A regular Faculty member's
     * immediate superior evaluation
     * comes automatically from the
     * Dean-to-Faculty evaluation.
     */
    if (categoryTotals.manualImmediateSuperiorEvaluation > 0) {
      throw new Error(
        "Immediate Superior Evaluation for a regular Faculty member must come from the Dean-to-Faculty evaluation records. Remove the manually entered Immediate Superior Evaluation entry.",
      );
    }

    automaticSuperiorResult = await calculateImmediateSuperiorEvaluationPoints({
      strapi,
      teacherDocumentId,
      schoolYear,
      semester,
      maximumPoints: immediateSuperiorMaximum,
    });

    immediateSuperiorPoints = round(
      Number(automaticSuperiorResult?.awardedPoints || 0),
      4,
    );
  }

  /* ========================================================
     MANUAL HR EVALUATION
  ======================================================== */

  const hrEvaluationPoints = round(categoryTotals.manualHrEvaluation, 4);

  if (hrEvaluationPoints <= 0) {
    throw new Error(
      "A manual HR Evaluation portfolio entry is required before computing the ranking.",
    );
  }

  /* ========================================================
     VALIDATE EVALUATION COMPONENTS
  ======================================================== */

  validateComponentMaximum({
    componentName: "Student Evaluation",

    points: studentEvaluationPoints,

    maximum: studentEvaluationMaximum,
  });

  validateComponentMaximum({
    componentName: "Immediate Superior Evaluation",

    points: immediateSuperiorPoints,

    maximum: immediateSuperiorMaximum,
  });

  validateComponentMaximum({
    componentName: "HR Evaluation",

    points: hrEvaluationPoints,

    maximum: hrEvaluationMaximum,
  });

  const totalEvaluationPoints = round(
    studentEvaluationPoints + immediateSuperiorPoints + hrEvaluationPoints,
    4,
  );

  if (totalEvaluationPoints > evaluationMaximum + 0.0001) {
    throw new Error(
      `Combined evaluation points cannot exceed ${formatNumber(
        evaluationMaximum,
      )}. Current total: ${formatNumber(totalEvaluationPoints)}.`,
    );
  }

  /* ========================================================
     CALCULATE PORTFOLIO POINTS
  ======================================================== */

  const educationalQualificationTotalPoints = round(
    categoryTotals.educationalQualifications +
      categoryTotals.eligibility +
      categoryTotals.trainingSeminars +
      categoryTotals.research +
      categoryTotals.awardsRecognition +
      categoryTotals.professionalExperience,
    4,
  );

  /*
   * The four major ranking criteria are:
   *
   * 1. Educational Qualification
   * 2. Loyalty
   * 3. Evaluation
   * 4. Corporate Social Responsibility
   *
   * total_portfolio_points and
   * total_ranking_points therefore store
   * the same final sum of these four criteria.
   */
  const totalPortfolioPoints = round(
    educationalQualificationTotalPoints +
      categoryTotals.loyalty +
      totalEvaluationPoints +
      categoryTotals.corporateSocialResponsibility,
    4,
  );

  const totalRankingPoints = totalPortfolioPoints;

  const maximumPoints = toNonNegativeNumber(rankingScheme.total_max_points, 0);

  if (maximumPoints > 0 && totalRankingPoints > maximumPoints + 0.0001) {
    throw new Error(
      `Computed ranking points of ${formatNumber(
        totalRankingPoints,
      )} exceed the scheme maximum of ${formatNumber(maximumPoints)}.`,
    );
  }

  /* ========================================================
     DETERMINE RANK BAND AND MAX RATE
  ======================================================== */

  const rankLookupPoints = normalizePointsForRankBand(totalRankingPoints);

  const rankBand = findRankBand(
    rankingScheme.rank_bands || [],
    rankLookupPoints,
  );
  const rateResult = await resolveMaxRate(
    strapi,
    rankingSchemeDocumentId,
    totalRankingPoints,
  );

  /* ========================================================
     CREATE RANKING IDENTITY
  ======================================================== */

  const teacherName =
    teacher.name || teacher.full_name || teacher.user?.username || "Faculty";

  const rankingLabel = `${teacherName} - ${schoolYear} - ${semester}`;

  const teacherIdentifier =
    teacher.employee_no || teacher.user?.username || teacher.documentId;

  const rankingNo = createRankingNo(teacherIdentifier, schoolYear, semester);

  /* ========================================================
     FIND EXISTING RANKING
  ======================================================== */

  const existingRankings: any[] = await strapi
    .documents(FACULTY_RANKING_UID)
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

  /* ========================================================
     PREPARE RANKING DATA
  ======================================================== */

  const resolvedRankName = rankBand
    ? formatRankName(rankBand.rank_name, rankBand.rank_level)
    : null;

  const resolvedRankCode = rankBand
    ? createRankCode(rankBand.rank_name, rankBand.rank_level)
    : null;

  const rankingData: any = {
    ranking_no: rankingNo,

    ranking_label: rankingLabel,

    school_year: schoolYear,

    semester,

    educational_qualification_points: round(
      categoryTotals.educationalQualifications,
      4,
    ),

    eligibility_points: round(categoryTotals.eligibility, 4),

    training_seminar_points: round(categoryTotals.trainingSeminars, 4),

    research_points: round(categoryTotals.research, 4),

    awards_recognition_points: round(categoryTotals.awardsRecognition, 4),

    professional_experience_points: round(
      categoryTotals.professionalExperience,
      4,
    ),

    educational_qualification_total_points: educationalQualificationTotalPoints,

    loyalty_points: round(categoryTotals.loyalty, 4),

    csr_points: round(categoryTotals.corporateSocialResponsibility, 4),

    student_evaluation_points: studentEvaluationPoints,

    immediate_superior_evaluation_points: immediateSuperiorPoints,

    hr_evaluation_points: hrEvaluationPoints,

    evaluation_points: totalEvaluationPoints,

    total_portfolio_points: totalPortfolioPoints,

    total_ranking_points: totalRankingPoints,

    rank_name: resolvedRankName,

    rank_code: resolvedRankCode,

    salary_rate: rateResult.maxRate,

    rate_assignment_status: rateResult.status,

    rate_assignment_message: rateResult.message,

    computation_status: "computed",

    computed_at: new Date().toISOString(),

    teacher: teacherDocumentId,

    ranking_scheme: rankingSchemeDocumentId,

    rank_band: rankBand?.documentId || null,

    salary_rate_record: rateResult.salaryRate?.documentId || null,

    computed_by: computedByUserId || null,

    remarks: buildRankingRemarks({
      isDean,
      studentEvaluationResult,
      automaticSuperiorResult,
      rateStatus: rateResult.status,
    }),
  };

  /* ========================================================
     CREATE OR UPDATE RANKING
  ======================================================== */

  const existing = existingRankings?.[0];

  let facultyRanking: any;

  if (existing?.documentId) {
    facultyRanking = await strapi.documents(FACULTY_RANKING_UID).update({
      documentId: existing.documentId,

      data: rankingData,
    });
  } else {
    facultyRanking = await strapi.documents(FACULTY_RANKING_UID).create({
      data: rankingData,
    });
  }

  /* ========================================================
     RETURN COMPUTATION RESULT
  ======================================================== */

  return {
    ranking: facultyRanking,

    teacher: {
      documentId: teacher.documentId,

      employeeNo: teacher.employee_no || teacher.user?.username || null,

      name: teacherName,

      role: isDean ? "Dean" : "Faculty",

      department: teacher.department?.name || null,
    },

    portfolioEntries,

    points: {
      educationalQualifications: rankingData.educational_qualification_points,

      eligibility: rankingData.eligibility_points,

      trainingSeminars: rankingData.training_seminar_points,

      research: rankingData.research_points,

      awardsRecognition: rankingData.awards_recognition_points,

      professionalExperience: rankingData.professional_experience_points,

      educationalQualificationTotal: educationalQualificationTotalPoints,

      loyalty: rankingData.loyalty_points,

      corporateSocialResponsibility: rankingData.csr_points,

      studentEvaluation: studentEvaluationPoints,

      immediateSuperiorEvaluation: immediateSuperiorPoints,

      hrEvaluation: hrEvaluationPoints,

      evaluation: totalEvaluationPoints,

      totalPortfolioPoints,

      totalRankingPoints,
    },

    evaluationSources: {
      studentEvaluation: {
        source: "automatic",

        evaluationCode: studentEvaluationResult.evaluationCode,

        recordCount: studentEvaluationResult.recordCount,

        rawAverageScore: studentEvaluationResult.rawAverageScore,

        overallRating: studentEvaluationResult.overallRating,

        awardedPoints: studentEvaluationPoints,

        maximumPoints: studentEvaluationMaximum,
      },

      immediateSuperiorEvaluation: isDean
        ? {
            source: "manual_portfolio_entry",

            evaluationCode: null,

            recordCount: countManualEntries(
              portfolioEntries,
              "immediate superior evaluation",
            ),

            rawAverageScore: null,

            overallRating: resolveManualFourPointRating(
              immediateSuperiorPoints,
            ),

            awardedPoints: immediateSuperiorPoints,

            maximumPoints: immediateSuperiorMaximum,
          }
        : {
            source: "automatic",

            evaluationCode:
              automaticSuperiorResult?.evaluationCode || "dean-to-faculty",

            recordCount: automaticSuperiorResult?.recordCount || 0,

            rawAverageScore: automaticSuperiorResult?.rawAverageScore || 0,

            overallRating:
              automaticSuperiorResult?.overallRating || "No Rating",

            awardedPoints: immediateSuperiorPoints,

            maximumPoints: immediateSuperiorMaximum,
          },

      hrEvaluation: {
        source: "manual_portfolio_entry",

        evaluationCode: null,

        recordCount: countManualEntries(portfolioEntries, "hr evaluation"),

        rawAverageScore: null,

        overallRating: resolveManualFourPointRating(hrEvaluationPoints),

        awardedPoints: hrEvaluationPoints,

        maximumPoints: hrEvaluationMaximum,
      },
    },

    rankBand: rankBand || null,

    rateAssignment: rateResult,
  };
}

/* =========================================================
   PORTFOLIO POINT CALCULATION
========================================================= */

function calculatePortfolioPoints(entries: any[]): CategoryTotals {
  const totals: CategoryTotals = {
    educationalQualifications: 0,
    eligibility: 0,
    trainingSeminars: 0,
    research: 0,
    awardsRecognition: 0,
    professionalExperience: 0,
    loyalty: 0,
    corporateSocialResponsibility: 0,

    manualImmediateSuperiorEvaluation: 0,
    manualHrEvaluation: 0,
  };

  for (const entry of entries) {
    const points = Number(entry.points || 0);

    if (!Number.isFinite(points) || points < 0) {
      continue;
    }

    switch (entry.entry_type) {
      case "educational_qualifications":
        totals.educationalQualifications += points;
        break;

      case "eligibility":
        totals.eligibility += points;
        break;

      case "training_seminars":
        totals.trainingSeminars += points;
        break;

      case "research":
        totals.research += points;
        break;

      case "awards_recognition":
        totals.awardsRecognition += points;
        break;

      case "professional_experience":
        totals.professionalExperience += points;
        break;

      case "loyalty":
        totals.loyalty += points;
        break;

      case "corporate_social_responsibility":
        totals.corporateSocialResponsibility += points;
        break;

      case "evaluation": {
        const evaluationTitle = normalizeText(entry.title);

        if (evaluationTitle === "immediate superior evaluation") {
          totals.manualImmediateSuperiorEvaluation += points;
        }

        if (evaluationTitle === "hr evaluation") {
          totals.manualHrEvaluation += points;
        }

        /*
         * Student Evaluation portfolio
         * entries are intentionally ignored
         * because Student Evaluation is
         * generated automatically.
         */
        break;
      }

      default:
        break;
    }
  }

  return totals;
}

/* =========================================================
   RANK BAND
========================================================= */

function findRankBand(rankBands: any[], totalPoints: number) {
  return rankBands.find((band: any) => {
    const minimum = Number(band.minimum_points ?? band.min_points ?? 0);

    const rawMaximum = band.maximum_points ?? band.max_points;

    const maximum =
      rawMaximum === null || rawMaximum === undefined
        ? null
        : Number(rawMaximum);

    return (
      totalPoints >= minimum && (maximum === null || totalPoints <= maximum)
    );
  });
}

/* =========================================================
   RANKING NUMBER
========================================================= */

function createRankingNo(
  teacherIdentifier: string,
  schoolYear: string,
  semester: string,
) {
  const cleanTeacher = slugify(teacherIdentifier || "faculty");

  const cleanSchoolYear = slugify(schoolYear);

  const cleanSemester = slugify(semester || "annual");

  return ["ranking", cleanTeacher, cleanSchoolYear, cleanSemester]
    .filter(Boolean)
    .join("-");
}

/* =========================================================
   ROLE RESOLUTION
========================================================= */

function resolveTeacherRole(teacher: any) {
  const roleValue =
    teacher?.user?.role?.name ||
    teacher?.user?.role?.type ||
    teacher?.role ||
    "";

  const normalized = normalizeText(roleValue);

  return normalized.includes("dean") ? "dean" : "faculty";
}

/* =========================================================
   VALIDATION
========================================================= */

function validateRequest({
  teacherDocumentId,
  rankingSchemeDocumentId,
  schoolYear,
  semester,
}: {
  teacherDocumentId: string;
  rankingSchemeDocumentId: string;
  schoolYear: string;
  semester: string;
}) {
  if (!String(teacherDocumentId || "").trim()) {
    throw new Error("Teacher document ID is required.");
  }

  if (!String(rankingSchemeDocumentId || "").trim()) {
    throw new Error("Ranking scheme document ID is required.");
  }

  if (!String(schoolYear || "").trim()) {
    throw new Error("School year is required.");
  }

  if (!ALLOWED_SEMESTERS.includes(semester)) {
    throw new Error(
      `Invalid semester. Allowed values are: ${ALLOWED_SEMESTERS.join(", ")}.`,
    );
  }
}

function validateComponentMaximum({
  componentName,
  points,
  maximum,
}: {
  componentName: string;
  points: number;
  maximum: number;
}) {
  if (!Number.isFinite(points) || points < 0) {
    throw new Error(
      `${componentName} points must be a valid non-negative number.`,
    );
  }

  if (points > maximum + 0.0001) {
    throw new Error(
      `${componentName} points cannot exceed ${formatNumber(
        maximum,
      )}. Current value: ${formatNumber(points)}.`,
    );
  }
}

/* =========================================================
   REMARKS
========================================================= */

function buildRankingRemarks({
  isDean,
  studentEvaluationResult,
  automaticSuperiorResult,
  rateStatus,
}: {
  isDean: boolean;
  studentEvaluationResult: any;
  automaticSuperiorResult: any;
  rateStatus: string;
}) {
  const remarks: string[] = [];

  if (Number(studentEvaluationResult?.recordCount || 0) === 0) {
    remarks.push(
      "No Student-to-Faculty evaluation records were found for the selected period; Student Evaluation points were computed as 0.",
    );
  }

  if (!isDean && Number(automaticSuperiorResult?.recordCount || 0) === 0) {
    remarks.push(
      "No Dean-to-Faculty evaluation records were found for the selected period; Immediate Superior Evaluation points were computed as 0.",
    );
  }

  if (rateStatus === "not_configured") {
    remarks.push(
      "Faculty ranking was computed, but the MAX RATE was not configured for the exact total points.",
    );
  }

  return remarks.length ? remarks.join(" ") : null;
}

/* =========================================================
   UTILITIES
========================================================= */

function countManualEntries(entries: any[], expectedTitle: string) {
  return entries.filter(
    (entry: any) =>
      entry.entry_type === "evaluation" &&
      normalizeText(entry.title) === normalizeText(expectedTitle),
  ).length;
}

function normalizeText(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNonNegativeNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return fallback;
  }

  return numberValue;
}

function approximatelyEqual(first: number, second: number) {
  return Math.abs(first - second) <= 0.0001;
}

function round(value: number, decimals = 4) {
  const multiplier = 10 ** decimals;

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

function formatNumber(value: number) {
  const rounded = round(value, 4);

  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace(/\.?0+$/, "");
}

function resolveManualFourPointRating(points: number) {
  if (points >= 4) {
    return "Excellent";
  }

  if (points >= 3) {
    return "Satisfactory";
  }

  if (points >= 2) {
    return "Fair";
  }

  if (points >= 1) {
    return "Poor";
  }

  return "No Rating";
}

function normalizePointsForRankBand(points: number) {
  if (!Number.isFinite(points)) {
    return 0;
  }

  const rounded = round(points, 4);

  /*
   * Preserve official half-point values
   * starting at 91.5.
   */
  if (rounded >= 91) {
    return Math.round(rounded * 2) / 2;
  }

  /*
   * For the whole-point rank bands,
   * round to the nearest whole point.
   */
  return Math.round(rounded);
}

function formatRankName(
  rankName: unknown,
  rankLevel: unknown,
) {
  const formattedName = String(
    rankName || "",
  )
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );

  const level = Number(rankLevel);

  if (
    !formattedName ||
    !Number.isFinite(level)
  ) {
    return null;
  }

  return `${formattedName} ${level}`;
}

function createRankCode(
  rankName: unknown,
  rankLevel: unknown,
) {
  const normalizedName = String(
    rankName || "",
  )
    .trim()
    .toLowerCase();

  const level = Number(rankLevel);

  if (!Number.isFinite(level)) {
    return null;
  }

  const prefixMap: Record<string, string> = {
    instructor: "INS",
    assistant_professor: "AP",
    associate_professor: "ASP",
    professor: "PROF",
  };

  const prefix =
    prefixMap[normalizedName];

  if (!prefix) {
    return null;
  }

  return `${prefix}-${level}`;
}
