/**
 * Faculty Ranking Scheme 2025 Seeder
 * Strapi 5 / TypeScript
 *
 * Source basis:
 * - Ranking Scheme 2025, printed May 14, 2025
 *
 * Important policy adaptations:
 * 1. The source allocates 12 evaluation points through three 4-point components.
 *    This seed uses the approved system-oriented placeholders:
 *      - Dean-to-Faculty: 4
 *      - Student-to-Faculty: 4
 *      - Committee-approved Evaluation Component: 4
 * 2. Technical/Vocational or Associate (2-year and 3-year) point values are
 *    not visible in the supplied document. They are seeded as inactive,
 *    manual criteria with zero points so they cannot affect calculations
 *    until the Ranking Committee supplies official values.
 * 3. The total scheme maximum is set to 100 because the rank scale ends at 100.
 * 4. Rank rate steps are seeded exactly as listed. Instructor 1 has one listed
 *    rate only (147), so it receives only Step 1.
 *
 * The script is idempotent:
 * - Existing records are updated.
 * - Missing records are created.
 * - Running it again will not intentionally create duplicates.
 */

type StrapiInstance = any;

type CategorySeed = {
  code: string;
  name: string;
  description: string;
  sequence: number;
  maximum_points?: number;
  calculation_method:
    | "fixed"
    | "accumulated"
    | "capped"
    | "calculated"
    | "evaluation";
  requires_evidence: boolean;
};

type CriterionSeed = {
  categoryCode: string;
  code: string;
  name: string;
  description?: string;
  sequence: number;
  points: number;
  points_per_item?: number;
  maximum_points?: number;
  minimum_quantity?: number;
  maximum_quantity?: number;
  minimum_value?: number;
  maximum_value?: number;
  calculation_type:
    | "fixed"
    | "per_item"
    | "range"
    | "years_of_service"
    | "evaluation_conversion"
    | "manual";
  evidence_type?:
    | "diploma"
    | "transcript"
    | "license"
    | "certificate"
    | "publication"
    | "award"
    | "employment_record"
    | "community_service_record"
    | "evaluation_result"
    | "other";
  requires_evidence: boolean;
  is_repeatable: boolean;
  is_active?: boolean;
};

type RankBandSeed = {
  sequence: number;
  rank_name:
    | "instructor"
    | "assistant_professor"
    | "associate_professor"
    | "professor";
  rank_level: number;
  educational_requirement?: string;
  minimum_points: number;
  maximum_points: number;
  rates: number[];
};

const UID = {
  scheme: "api::ranking-scheme.ranking-scheme",
  category: "api::ranking-category.ranking-category",
  criterion: "api::ranking-criterion.ranking-criterion",
  rankBand: "api::rank-band.rank-band",
  rateStep: "api::rate-step.rate-step",
} as const;

const SCHEME = {
  name: "Faculty Ranking Scheme 2025",
  code: "faculty-ranking-scheme-2025",
  version: "2025.1",
  description:
    "Faculty ranking pointing system, range, and scale based on the Ranking Scheme document printed May 14, 2025.",
  effective_date: "2025-05-14",
  expiration_date: null,
  is_active: true,
  scheme_status: "active",
  evaluation_max_points: 12,
  total_max_points: 100,
  remarks:
    "Technical/Vocational or Associate point values and the final rate-step selection rule require formal Ranking Committee clarification.",
};

const CATEGORIES: CategorySeed[] = [
  {
    code: "educational-attainment",
    name: "Educational Attainment",
    description:
      "Highest verified educational attainment. Only one attainment criterion should be credited.",
    sequence: 1,
    calculation_method: "fixed",
    requires_evidence: true,
  },
  {
    code: "eligibility",
    name: "Eligibility",
    description:
      "Professional licenses, certifications, training certificates, civil service eligibility, and related credentials.",
    sequence: 2,
    maximum_points: 12,
    calculation_method: "capped",
    requires_evidence: true,
  },
  {
    code: "training-seminars",
    name: "Training and Seminars",
    description:
      "Training, seminars, and resource-speaker engagements. Category maximum is 8 points.",
    sequence: 3,
    maximum_points: 8,
    calculation_method: "capped",
    requires_evidence: true,
  },
  {
    code: "research",
    name: "Research",
    description:
      "Published journals, books, and school-based research.",
    sequence: 4,
    maximum_points: 8,
    calculation_method: "capped",
    requires_evidence: true,
  },
  {
    code: "awards-recognition",
    name: "Awards and Recognition",
    description:
      "Verified international, national, and local awards or recognitions.",
    sequence: 5,
    maximum_points: 8,
    calculation_method: "capped",
    requires_evidence: true,
  },
  {
    code: "professional-experience",
    name: "Professional / Teaching Experience",
    description:
      "Teaching or managerial experience converted into points using the approved experience brackets.",
    sequence: 6,
    maximum_points: 10,
    calculation_method: "calculated",
    requires_evidence: true,
  },
  {
    code: "loyalty",
    name: "Loyalty",
    description:
      "Completed years of service within the institution.",
    sequence: 7,
    maximum_points: 7,
    calculation_method: "calculated",
    requires_evidence: true,
  },
  {
    code: "evaluation",
    name: "Evaluation Points",
    description:
      "Approved evaluation components converted to ranking points. Category maximum is 12 points.",
    sequence: 8,
    maximum_points: 12,
    calculation_method: "evaluation",
    requires_evidence: false,
  },
  {
    code: "corporate-social-responsibility",
    name: "Corporate Social Responsibility",
    description:
      "Verified community service rendered, credited at 0.5 point per activity.",
    sequence: 9,
    maximum_points: 3,
    calculation_method: "capped",
    requires_evidence: true,
  },
];

const CRITERIA: CriterionSeed[] = [
  // -------------------------------------------------------------------------
  // Educational Attainment
  // -------------------------------------------------------------------------
  {
    categoryCode: "educational-attainment",
    code: "edu-bachelors",
    name: "Bachelor's Degree",
    sequence: 1,
    points: 15,
    calculation_type: "fixed",
    evidence_type: "diploma",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-masters-18-units",
    name: "Master's Degree – 18 Units",
    sequence: 2,
    points: 20,
    calculation_type: "fixed",
    evidence_type: "transcript",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-masters-19-27-units",
    name: "Master's Degree – 19 to 27 Units",
    sequence: 3,
    points: 22,
    calculation_type: "fixed",
    evidence_type: "transcript",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-masters-28-36-units",
    name: "Master's Degree – 28 to 36 Units",
    sequence: 4,
    points: 24,
    calculation_type: "fixed",
    evidence_type: "transcript",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-masters-comprehensive",
    name: "Master's Comprehensive Examination Passer",
    sequence: 5,
    points: 61,
    calculation_type: "fixed",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-masters-non-thesis",
    name: "Master's Degree – Non-Thesis",
    sequence: 6,
    points: 66,
    calculation_type: "fixed",
    evidence_type: "diploma",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-masters-with-thesis",
    name: "Master's Degree – With Thesis",
    sequence: 7,
    points: 71,
    calculation_type: "fixed",
    evidence_type: "diploma",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-doctorate-9-units",
    name: "Doctorate – 9 Units",
    sequence: 8,
    points: 76,
    calculation_type: "fixed",
    evidence_type: "transcript",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-doctorate-18-24-units",
    name: "Doctorate – 18 to 24 Units",
    sequence: 9,
    points: 81,
    calculation_type: "fixed",
    evidence_type: "transcript",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-doctorate-comprehensive",
    name: "Doctorate Comprehensive Examination Passer",
    sequence: 10,
    points: 86,
    calculation_type: "fixed",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-dissertation-1",
    name: "Dissertation 1",
    sequence: 11,
    points: 91.5,
    calculation_type: "fixed",
    evidence_type: "transcript",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-doctorate-dissertation",
    name: "Doctorate with Dissertation or Equivalent Rank",
    sequence: 12,
    points: 94,
    calculation_type: "fixed",
    evidence_type: "diploma",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-associate-2-years-unconfirmed",
    name: "Technical/Vocational or Associate Course – 2 Years",
    description:
      "Point value is not visible in the supplied Ranking Scheme 2025 document. Inactive until formally clarified.",
    sequence: 13,
    points: 0,
    calculation_type: "manual",
    evidence_type: "diploma",
    requires_evidence: true,
    is_repeatable: false,
    is_active: false,
  },
  {
    categoryCode: "educational-attainment",
    code: "edu-associate-3-years-unconfirmed",
    name: "Technical/Vocational or Associate Course – 3 Years",
    description:
      "Point value is not visible in the supplied Ranking Scheme 2025 document. Inactive until formally clarified.",
    sequence: 14,
    points: 0,
    calculation_type: "manual",
    evidence_type: "diploma",
    requires_evidence: true,
    is_repeatable: false,
    is_active: false,
  },

  // -------------------------------------------------------------------------
  // Eligibility – maximum 12
  // -------------------------------------------------------------------------
  {
    categoryCode: "eligibility",
    code: "elig-bar-exam",
    name: "Bar Examination",
    sequence: 1,
    points: 6,
    points_per_item: 6,
    calculation_type: "per_item",
    evidence_type: "license",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "eligibility",
    code: "elig-board-exam",
    name: "Board Examination",
    description: "4 points for each verified board examination.",
    sequence: 2,
    points: 4,
    points_per_item: 4,
    calculation_type: "per_item",
    evidence_type: "license",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "eligibility",
    code: "elig-certification",
    name: "Professional Certification",
    description: "3 points for each verified certification.",
    sequence: 3,
    points: 3,
    points_per_item: 3,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "eligibility",
    code: "elig-tvet-training-certificate",
    name: "National TVET Training Certificate",
    description: "2 points for each verified certificate.",
    sequence: 4,
    points: 2,
    points_per_item: 2,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "eligibility",
    code: "elig-assessor",
    name: "Assessor Qualification",
    sequence: 5,
    points: 1,
    points_per_item: 1,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "eligibility",
    code: "elig-civil-service-professional",
    name: "Civil Service – Professional",
    sequence: 6,
    points: 1,
    calculation_type: "fixed",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "eligibility",
    code: "elig-trainers-methodology",
    name: "Trainers Methodology 1 / 2",
    sequence: 7,
    points: 1,
    points_per_item: 1,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "eligibility",
    code: "elig-related-national-certificate",
    name: "Related National Certificate (NC)",
    description: "0.5 point for each verified related NC.",
    sequence: 8,
    points: 0.5,
    points_per_item: 0.5,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "eligibility",
    code: "elig-international-license",
    name: "International License",
    sequence: 9,
    points: 0.5,
    points_per_item: 0.5,
    calculation_type: "per_item",
    evidence_type: "license",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "eligibility",
    code: "elig-methods-of-teaching",
    name: "Methods of Teaching – 18 Units for Non-Education Graduate",
    sequence: 10,
    points: 0.5,
    calculation_type: "fixed",
    evidence_type: "transcript",
    requires_evidence: true,
    is_repeatable: false,
  },

  // -------------------------------------------------------------------------
  // Training and Seminars – maximum 8
  // -------------------------------------------------------------------------
  {
    categoryCode: "training-seminars",
    code: "training-international",
    name: "International Training",
    description: "Training subgroup maximum: 3 points.",
    sequence: 1,
    points: 1,
    points_per_item: 1,
    maximum_points: 3,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "training-seminars",
    code: "training-national",
    name: "National Training",
    description: "Training subgroup maximum: 3 points.",
    sequence: 2,
    points: 0.75,
    points_per_item: 0.75,
    maximum_points: 3,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "training-seminars",
    code: "training-local",
    name: "Local Training",
    description: "Training subgroup maximum: 3 points.",
    sequence: 3,
    points: 0.5,
    points_per_item: 0.5,
    maximum_points: 3,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "training-seminars",
    code: "seminar-international",
    name: "International Seminar",
    description: "Seminar subgroup maximum: 3 points.",
    sequence: 4,
    points: 1,
    points_per_item: 1,
    maximum_points: 3,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "training-seminars",
    code: "seminar-national",
    name: "National Seminar",
    description: "Seminar subgroup maximum: 3 points.",
    sequence: 5,
    points: 0.75,
    points_per_item: 0.75,
    maximum_points: 3,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "training-seminars",
    code: "seminar-local",
    name: "Local Seminar",
    description: "Seminar subgroup maximum: 3 points.",
    sequence: 6,
    points: 0.5,
    points_per_item: 0.5,
    maximum_points: 3,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "training-seminars",
    code: "speaker-international",
    name: "International Resource Speaker",
    description: "Resource-speaker subgroup maximum: 2 points.",
    sequence: 7,
    points: 1,
    points_per_item: 1,
    maximum_points: 2,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "training-seminars",
    code: "speaker-national",
    name: "National Resource Speaker",
    description: "Resource-speaker subgroup maximum: 2 points.",
    sequence: 8,
    points: 0.75,
    points_per_item: 0.75,
    maximum_points: 2,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "training-seminars",
    code: "speaker-local",
    name: "Local Resource Speaker",
    description: "Resource-speaker subgroup maximum: 2 points.",
    sequence: 9,
    points: 0.5,
    points_per_item: 0.5,
    maximum_points: 2,
    calculation_type: "per_item",
    evidence_type: "certificate",
    requires_evidence: true,
    is_repeatable: true,
  },

  // -------------------------------------------------------------------------
  // Research – maximum 8
  // -------------------------------------------------------------------------
  {
    categoryCode: "research",
    code: "research-journal-international",
    name: "Published Journal – International",
    sequence: 1,
    points: 3,
    points_per_item: 3,
    calculation_type: "per_item",
    evidence_type: "publication",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "research",
    code: "research-journal-local",
    name: "Published Journal – Local",
    sequence: 2,
    points: 2,
    points_per_item: 2,
    calculation_type: "per_item",
    evidence_type: "publication",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "research",
    code: "research-published-book",
    name: "Published Book",
    sequence: 3,
    points: 1,
    points_per_item: 1,
    calculation_type: "per_item",
    evidence_type: "publication",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "research",
    code: "research-school-based",
    name: "School-Based Research",
    description: "Research conducted within the institution.",
    sequence: 4,
    points: 0.5,
    points_per_item: 0.5,
    calculation_type: "per_item",
    evidence_type: "publication",
    requires_evidence: true,
    is_repeatable: true,
  },

  // -------------------------------------------------------------------------
  // Awards and Recognition – maximum 8
  // -------------------------------------------------------------------------
  {
    categoryCode: "awards-recognition",
    code: "award-international",
    name: "International Award or Recognition",
    sequence: 1,
    points: 3,
    points_per_item: 3,
    calculation_type: "per_item",
    evidence_type: "award",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "awards-recognition",
    code: "award-national",
    name: "National Award or Recognition",
    sequence: 2,
    points: 2,
    points_per_item: 2,
    calculation_type: "per_item",
    evidence_type: "award",
    requires_evidence: true,
    is_repeatable: true,
  },
  {
    categoryCode: "awards-recognition",
    code: "award-local",
    name: "Local Award or Recognition",
    sequence: 3,
    points: 1,
    points_per_item: 1,
    calculation_type: "per_item",
    evidence_type: "award",
    requires_evidence: true,
    is_repeatable: true,
  },

  // -------------------------------------------------------------------------
  // Professional / Teaching Experience – maximum 10
  // -------------------------------------------------------------------------
  {
    categoryCode: "professional-experience",
    code: "experience-3-years",
    name: "3 Years Teaching or 4 Years Managerial Experience",
    sequence: 1,
    points: 1,
    minimum_value: 3,
    maximum_value: 3.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "professional-experience",
    code: "experience-4-years",
    name: "4 Years Teaching or 5 Years Managerial Experience",
    sequence: 2,
    points: 2,
    minimum_value: 4,
    maximum_value: 4.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "professional-experience",
    code: "experience-5-years",
    name: "5 Years Teaching or 6 Years Managerial Experience",
    sequence: 3,
    points: 3,
    minimum_value: 5,
    maximum_value: 5.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "professional-experience",
    code: "experience-6-years",
    name: "6 Years Teaching or 7 Years Managerial Experience",
    sequence: 4,
    points: 4,
    minimum_value: 6,
    maximum_value: 6.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "professional-experience",
    code: "experience-7-years",
    name: "7 Years Teaching or 8 Years Managerial Experience",
    sequence: 5,
    points: 5,
    minimum_value: 7,
    maximum_value: 7.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "professional-experience",
    code: "experience-8-years",
    name: "8 Years Teaching or 9 Years Managerial Experience",
    sequence: 6,
    points: 6,
    minimum_value: 8,
    maximum_value: 8.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "professional-experience",
    code: "experience-9-years",
    name: "9 Years Teaching or 10 Years Managerial Experience",
    sequence: 7,
    points: 7,
    minimum_value: 9,
    maximum_value: 9.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "professional-experience",
    code: "experience-10-years",
    name: "10 Years Teaching or 11 Years Managerial Experience",
    sequence: 8,
    points: 8,
    minimum_value: 10,
    maximum_value: 10.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "professional-experience",
    code: "experience-more-than-10-years",
    name: "More Than 10 Years Teaching or More Than 12 Years Managerial Experience",
    sequence: 9,
    points: 9,
    minimum_value: 11,
    maximum_value: 15,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "professional-experience",
    code: "experience-more-than-15-years",
    name: "More Than 15 Years Teaching or More Than 17 Years Managerial Experience",
    sequence: 10,
    points: 10,
    minimum_value: 15.01,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },

  // -------------------------------------------------------------------------
  // Loyalty – maximum 7
  // -------------------------------------------------------------------------
  {
    categoryCode: "loyalty",
    code: "loyalty-3-4-years",
    name: "3 to 4 Years of Service",
    sequence: 1,
    points: 2,
    minimum_value: 3,
    maximum_value: 4.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "loyalty",
    code: "loyalty-5-6-years",
    name: "5 to 6 Years of Service",
    sequence: 2,
    points: 3,
    minimum_value: 5,
    maximum_value: 6.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "loyalty",
    code: "loyalty-7-8-years",
    name: "7 to 8 Years of Service",
    sequence: 3,
    points: 4,
    minimum_value: 7,
    maximum_value: 8.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "loyalty",
    code: "loyalty-9-10-years",
    name: "9 to 10 Years of Service",
    description:
      "The source overlaps this bracket with the 10-years-and-above bracket. Committee clarification is recommended.",
    sequence: 4,
    points: 5,
    minimum_value: 9,
    maximum_value: 10,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "loyalty",
    code: "loyalty-10-14-years",
    name: "10 Years and Above, Below 15 Years",
    description:
      "Normalized to 10–14.99 years to avoid collision with the 15-years-and-above bracket.",
    sequence: 5,
    points: 6,
    minimum_value: 10,
    maximum_value: 14.99,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },
  {
    categoryCode: "loyalty",
    code: "loyalty-15-years-above",
    name: "15 Years and Above",
    sequence: 6,
    points: 7,
    minimum_value: 15,
    calculation_type: "years_of_service",
    evidence_type: "employment_record",
    requires_evidence: true,
    is_repeatable: false,
  },

  // -------------------------------------------------------------------------
  // Evaluation – maximum 12
  // -------------------------------------------------------------------------
  {
    categoryCode: "evaluation",
    code: "evaluation-dean-faculty",
    name: "Dean-to-Faculty Evaluation",
    description:
      "Maximum 4 points. Convert the approved evaluation average through the committee-approved Excellent/Satisfactory/Fair/Poor mapping.",
    sequence: 1,
    points: 4,
    maximum_points: 4,
    calculation_type: "evaluation_conversion",
    evidence_type: "evaluation_result",
    requires_evidence: false,
    is_repeatable: false,
  },
  {
    categoryCode: "evaluation",
    code: "evaluation-student-faculty",
    name: "Student-to-Faculty Evaluation",
    description:
      "Maximum 4 points. Convert the approved evaluation average through the committee-approved Excellent/Satisfactory/Fair/Poor mapping.",
    sequence: 2,
    points: 4,
    maximum_points: 4,
    calculation_type: "evaluation_conversion",
    evidence_type: "evaluation_result",
    requires_evidence: false,
    is_repeatable: false,
  },
  {
    categoryCode: "evaluation",
    code: "evaluation-committee-component",
    name: "Committee-Approved Evaluation Component",
    description:
      "Maximum 4 points. Placeholder that preserves the source document's 4 + 4 + 4 evaluation structure. Requires an approved instrument before use.",
    sequence: 3,
    points: 4,
    maximum_points: 4,
    calculation_type: "manual",
    evidence_type: "evaluation_result",
    requires_evidence: true,
    is_repeatable: false,
    is_active: false,
  },

  // -------------------------------------------------------------------------
  // CSR – maximum 3
  // -------------------------------------------------------------------------
  {
    categoryCode: "corporate-social-responsibility",
    code: "csr-community-service",
    name: "Community Service Rendered",
    description: "0.5 point for each verified community-service activity.",
    sequence: 1,
    points: 0.5,
    points_per_item: 0.5,
    maximum_points: 3,
    calculation_type: "per_item",
    evidence_type: "community_service_record",
    requires_evidence: true,
    is_repeatable: true,
  },
];

const RANK_BANDS: RankBandSeed[] = [
  {
    sequence: 1,
    rank_name: "instructor",
    rank_level: 1,
    educational_requirement: "Bachelor's degree; below/through 25 points per normalized implementation.",
    minimum_points: 0,
    maximum_points: 25,
    rates: [147],
  },
  {
    sequence: 2,
    rank_name: "instructor",
    rank_level: 2,
    minimum_points: 26,
    maximum_points: 30,
    rates: [149, 151, 153, 155, 157],
  },
  {
    sequence: 3,
    rank_name: "instructor",
    rank_level: 3,
    minimum_points: 31,
    maximum_points: 35,
    rates: [159, 161, 163, 165, 167],
  },
  {
    sequence: 4,
    rank_name: "instructor",
    rank_level: 4,
    minimum_points: 36,
    maximum_points: 40,
    rates: [169, 171, 173, 175, 177],
  },
  {
    sequence: 5,
    rank_name: "assistant_professor",
    rank_level: 1,
    minimum_points: 41,
    maximum_points: 45,
    rates: [179, 181, 183, 185, 187],
  },
  {
    sequence: 6,
    rank_name: "assistant_professor",
    rank_level: 2,
    minimum_points: 46,
    maximum_points: 50,
    rates: [189, 191, 193, 195, 197],
  },
  {
    sequence: 7,
    rank_name: "assistant_professor",
    rank_level: 3,
    minimum_points: 51,
    maximum_points: 55,
    rates: [199, 201, 203, 205, 207],
  },
  {
    sequence: 8,
    rank_name: "assistant_professor",
    rank_level: 4,
    minimum_points: 56,
    maximum_points: 60,
    rates: [209, 211, 213, 215, 217],
  },
  {
    sequence: 9,
    rank_name: "associate_professor",
    rank_level: 1,
    educational_requirement: "Master's non-thesis or comprehensive examination passer.",
    minimum_points: 61,
    maximum_points: 65,
    rates: [219, 221, 223, 225, 227],
  },
  {
    sequence: 10,
    rank_name: "associate_professor",
    rank_level: 2,
    minimum_points: 66,
    maximum_points: 70,
    rates: [229, 231, 233, 235, 237],
  },
  {
    sequence: 11,
    rank_name: "associate_professor",
    rank_level: 3,
    educational_requirement: "Master's with thesis.",
    minimum_points: 71,
    maximum_points: 75,
    rates: [244, 251, 258, 265, 272],
  },
  {
    sequence: 12,
    rank_name: "professor",
    rank_level: 1,
    educational_requirement: "Doctorate track.",
    minimum_points: 76,
    maximum_points: 80,
    rates: [274, 275, 277, 279, 280],
  },
  {
    sequence: 13,
    rank_name: "professor",
    rank_level: 2,
    educational_requirement: "Doctorate track.",
    minimum_points: 81,
    maximum_points: 85,
    rates: [282, 284, 285, 287, 289],
  },
  {
    sequence: 14,
    rank_name: "professor",
    rank_level: 3,
    educational_requirement: "Doctorate track.",
    minimum_points: 86,
    maximum_points: 90,
    rates: [290, 292, 294, 295, 297],
  },
  {
    sequence: 15,
    rank_name: "professor",
    rank_level: 4,
    educational_requirement: "Doctorate comprehensive examination passer.",
    minimum_points: 91.5,
    maximum_points: 93,
    rates: [299, 300, 302, 304, 305],
  },
  {
    sequence: 16,
    rank_name: "professor",
    rank_level: 5,
    educational_requirement: "Dissertation stage.",
    minimum_points: 93.5,
    maximum_points: 95.5,
    rates: [307, 309, 310, 312, 314],
  },
  {
    sequence: 17,
    rank_name: "professor",
    rank_level: 6,
    educational_requirement: "Doctorate completed.",
    minimum_points: 96,
    maximum_points: 100,
    rates: [315, 317, 319, 320, 322],
  },
];

const documents = (strapi: StrapiInstance, uid: string) =>
  (strapi.documents as any)(uid);

const connectOne = (documentId: string) => ({
  connect: [{ documentId }],
});

async function upsertPublishedByCode(
  strapi: StrapiInstance,
  uid: string,
  code: string,
  data: Record<string, any>,
) {
  const service = documents(strapi, uid);

  const existing = await service.findFirst({
    filters: { code: { $eq: code } },
    status: "draft",
  });

  if (existing?.documentId) {
    return service.update({
      documentId: existing.documentId,
      status: "published",
      data,
    });
  }

  return service.create({
    status: "published",
    data,
  });
}

async function upsertCategory(
  strapi: StrapiInstance,
  schemeDocumentId: string,
  category: CategorySeed,
) {
  const service = documents(strapi, UID.category);

  const existing = await service.findFirst({
    filters: {
      code: { $eq: category.code },
      ranking_scheme: {
        documentId: { $eq: schemeDocumentId },
      },
    },
    status: "draft",
  });

  const data = {
    ...category,
    is_active: true,
    ranking_scheme: connectOne(schemeDocumentId),
  };

  if (existing?.documentId) {
    return service.update({
      documentId: existing.documentId,
      status: "published",
      data,
    });
  }

  return service.create({
    status: "published",
    data,
  });
}

async function upsertCriterion(
  strapi: StrapiInstance,
  categoryDocumentId: string,
  criterion: CriterionSeed,
) {
  const service = documents(strapi, UID.criterion);

  const existing = await service.findFirst({
    filters: {
      code: { $eq: criterion.code },
      category: {
        documentId: { $eq: categoryDocumentId },
      },
    },
    status: "draft",
  });

  const {
    categoryCode: _categoryCode,
    ...criterionData
  } = criterion;

  const data = {
    ...criterionData,
    is_active: criterion.is_active ?? true,
    category: connectOne(categoryDocumentId),
  };

  if (existing?.documentId) {
    return service.update({
      documentId: existing.documentId,
      status: "published",
      data,
    });
  }

  return service.create({
    status: "published",
    data,
  });
}

async function upsertRankBand(
  strapi: StrapiInstance,
  schemeDocumentId: string,
  band: RankBandSeed,
) {
  const service = documents(strapi, UID.rankBand);

  const existing = await service.findFirst({
    filters: {
      sequence: { $eq: band.sequence },
      ranking_scheme: {
        documentId: { $eq: schemeDocumentId },
      },
    },
    status: "draft",
  });

  const data = {
    rank_name: band.rank_name,
    rank_level: band.rank_level,
    educational_requirement: band.educational_requirement ?? null,
    minimum_points: band.minimum_points,
    maximum_points: band.maximum_points,
    minimum_rate: Math.min(...band.rates),
    maximum_rate: Math.max(...band.rates),
    sequence: band.sequence,
    is_active: true,
    ranking_scheme: connectOne(schemeDocumentId),
  };

  const saved = existing?.documentId
    ? await service.update({
        documentId: existing.documentId,
        status: "published",
        data,
      })
    : await service.create({
        status: "published",
        data,
      });

  return saved;
}

async function upsertRateStep(
  strapi: StrapiInstance,
  rankBandDocumentId: string,
  stepNumber: number,
  rate: number,
) {
  const service = documents(strapi, UID.rateStep);

  const existing = await service.findFirst({
    filters: {
      step_number: { $eq: stepNumber },
      rank_band: {
        documentId: { $eq: rankBandDocumentId },
      },
    },
    status: "draft",
  });

  const data = {
    step_number: stepNumber,
    rate,
    description: `Step ${stepNumber}`,
    is_active: true,
    rank_band: connectOne(rankBandDocumentId),
  };

  if (existing?.documentId) {
    return service.update({
      documentId: existing.documentId,
      status: "published",
      data,
    });
  }

  return service.create({
    status: "published",
    data,
  });
}

export async function seedRankingScheme2025(
  strapi: StrapiInstance,
): Promise<void> {
  strapi.log.info(
    "[Ranking Seed] Starting Faculty Ranking Scheme 2025 seed...",
  );

  const scheme = await upsertPublishedByCode(
    strapi,
    UID.scheme,
    SCHEME.code,
    SCHEME,
  );

  if (!scheme?.documentId) {
    throw new Error(
      "Ranking scheme could not be created or resolved.",
    );
  }

  const categoryMap = new Map<string, any>();

  for (const category of CATEGORIES) {
    const savedCategory = await upsertCategory(
      strapi,
      scheme.documentId,
      category,
    );

    categoryMap.set(category.code, savedCategory);

    strapi.log.info(
      `[Ranking Seed] Category ready: ${category.name}`,
    );
  }

  for (const criterion of CRITERIA) {
    const category = categoryMap.get(
      criterion.categoryCode,
    );

    if (!category?.documentId) {
      throw new Error(
        `Missing category for criterion ${criterion.code}: ${criterion.categoryCode}`,
      );
    }

    await upsertCriterion(
      strapi,
      category.documentId,
      criterion,
    );

    strapi.log.info(
      `[Ranking Seed] Criterion ready: ${criterion.name}`,
    );
  }

  for (const band of RANK_BANDS) {
    const savedBand = await upsertRankBand(
      strapi,
      scheme.documentId,
      band,
    );

    if (!savedBand?.documentId) {
      throw new Error(
        `Rank band could not be created: ${band.rank_name} ${band.rank_level}`,
      );
    }

    for (
      let index = 0;
      index < band.rates.length;
      index += 1
    ) {
      await upsertRateStep(
        strapi,
        savedBand.documentId,
        index + 1,
        band.rates[index],
      );
    }

    strapi.log.info(
      `[Ranking Seed] Rank band ready: ${band.rank_name} ${band.rank_level}`,
    );
  }

  strapi.log.info(
    "[Ranking Seed] Faculty Ranking Scheme 2025 seeded successfully.",
  );

  strapi.log.warn(
    "[Ranking Seed] Review inactive/unconfirmed criteria and committee-policy remarks before production use.",
  );
}
