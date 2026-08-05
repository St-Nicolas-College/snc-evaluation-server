import { resolveMaxRate } from "./max-rate-resolver";

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
  evaluation: number;
  corporateSocialResponsibility: number;
};

export async function computeFacultyRanking({
  strapi,
  teacherDocumentId,
  rankingSchemeDocumentId,
  schoolYear,
  semester,
  computedByUserId,
}: {
  strapi: any;
  teacherDocumentId: string;
  rankingSchemeDocumentId: string;
  schoolYear: string;
  semester: "first_semester" | "second_semester" | "summer" | "annual";
  computedByUserId?: number;
}) {
  const teacher: any = await strapi.documents(TEACHER_UID).findOne({
    documentId: teacherDocumentId,

    populate: {
      department: true,
      user: true,
    },
  });

  if (!teacher) {
    throw new Error("Faculty record was not found.");
  }

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

  const portfolioEntries: any[] = await strapi
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

      sort: ["entry_type:asc", "date_earned:desc"],

      pagination: {
        page: 1,
        pageSize: 1000,
      },
    });

  const totals = calculatePortfolioPoints(portfolioEntries);

  /*
   * Evaluation points will later come
   * from the actual evaluation-result
   * integration.
   */
  totals.evaluation = 0;

  const totalPortfolioPoints =
    totals.educationalQualifications +
    totals.eligibility +
    totals.trainingSeminars +
    totals.research +
    totals.awardsRecognition +
    totals.professionalExperience +
    totals.loyalty +
    totals.corporateSocialResponsibility;

  const totalRankingPoints = totalPortfolioPoints + totals.evaluation;

  const maximumPoints = Number(rankingScheme.total_max_points || 0);

  if (maximumPoints > 0 && totalRankingPoints > maximumPoints) {
    throw new Error(
      `Computed points exceed the scheme maximum of ${maximumPoints}.`,
    );
  }

  const rankBand = findRankBand(
    rankingScheme.rank_bands || [],
    totalRankingPoints,
  );

  const rateResult = await resolveMaxRate(
    strapi,
    rankingSchemeDocumentId,
    totalRankingPoints,
  );

  const rankingLabel = `${teacher.name || teacher.user?.username || "Faculty"} - ${schoolYear} - ${semester}`;

  const teacherIdentifier =
    teacher.employee_no || teacher.user?.username || teacher.documentId;

  const rankingNo = createRankingNo(teacherIdentifier, schoolYear, semester);

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

  const rankingData: any = {
    ranking_no: rankingNo,
    ranking_label: rankingLabel,
    school_year: schoolYear,
    semester,
    educational_qualification_points: totals.educationalQualifications,
    eligibility_points: totals.eligibility,
    training_seminar_points: totals.trainingSeminars,
    research_points: totals.research,
    awards_recognition_points: totals.awardsRecognition,
    professional_experience_points: totals.professionalExperience,
    loyalty_points: totals.loyalty,
    evaluation_points: totals.evaluation,
    csr_points: totals.corporateSocialResponsibility,
    total_portfolio_points: totalPortfolioPoints,
    total_ranking_points: totalRankingPoints,
    rank_name: rankBand?.rank_name || rankBand?.name || null,
    rank_code: rankBand?.rank_code || rankBand?.code || null,
    max_rate: rateResult.maxRate,
    rate_assignment_status: rateResult.status,
    rate_assignment_message: rateResult.message,
    computation_status: "computed",
    computed_at: new Date().toISOString(),
    teacher: teacherDocumentId,
    ranking_scheme: rankingSchemeDocumentId,
    rank_band: rankBand?.documentId || null,
    salary_rate_record: rateResult.salaryRate?.documentId || null,
    computed_by: computedByUserId || null,
    remarks:
      rateResult.status === "not_configured"
        ? "Faculty ranking was computed, but the MAX RATE was not configured for the exact total points."
        : null,
  };

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

  return {
    ranking: facultyRanking,

    teacher,

    portfolioEntries,

    points: {
      ...totals,
      totalPortfolioPoints,
      totalRankingPoints,
    },

    rankBand: rankBand || null,

    rateAssignment: rateResult,
  };
}

function calculatePortfolioPoints(entries: any[]): CategoryTotals {
  const totals: CategoryTotals = {
    educationalQualifications: 0,
    eligibility: 0,
    trainingSeminars: 0,
    research: 0,
    awardsRecognition: 0,
    professionalExperience: 0,
    loyalty: 0,
    evaluation: 0,
    corporateSocialResponsibility: 0,
  };

  for (const entry of entries) {
    /*
     * Temporary foundation:
     * quantity is treated as the raw point
     * contribution until ranking criteria
     * matching is connected.
     */
    const points = Number(entry.points || 0);

    if (!Number.isFinite(points) || points < 0) {
      continue;
    }

    switch (entry.entry_type) {
      case "educational_attainment":
        totals.educationalQualifications += points;
        break;

      case "eligibility":
      case "license":
      case "certification":
        totals.eligibility += points;
        break;

      case "training":
      case "seminar":
      case "resource_speaker":
        totals.trainingSeminars += points;
        break;

      case "research":
      case "publication":
        totals.research += points;
        break;

      case "award":
        totals.awardsRecognition += points;
        break;

      case "professional_experience":
        totals.professionalExperience += points;
        break;

      case "institutional_service":
        totals.loyalty += points;
        break;

      case "community_service":
        totals.corporateSocialResponsibility += points;
        break;

      default:
        break;
    }
  }

  return totals;
}

function findRankBand(rankBands: any[], totalPoints: number) {
  return rankBands.find((band: any) => {
    const minimum = Number(band.minimum_points || band.min_points || 0);

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

function createRankingNo(
  teacherIdentifier: string,
  schoolYear: string,
  semester: string,
) {
  const cleanTeacher = String(teacherIdentifier || "faculty")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const cleanSchoolYear = String(schoolYear || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const cleanSemester = String(semester || "annual")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return ["ranking", cleanTeacher, cleanSchoolYear, cleanSemester]
    .filter(Boolean)
    .join("-");
}
