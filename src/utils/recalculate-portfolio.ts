const REQUIRED_SECTIONS = [
  "educational_attainment",
  "eligibility",
  "training",
  "research",
  "award",
  "professional_experience",
  "institutional_service",
  "community_service",
] as const;

type PortfolioStatus =
  | "draft"
  | "for_verification"
  | "partially_verified"
  | "verified"
  | "needs_correction"
  | "archived";

export async function recalculatePortfolio(
  strapi: any,
  portfolioDocumentId: string,
) {
  const portfolio: any = await strapi
    .documents("api::faculty-portfolio.faculty-portfolio")
    .findOne({
      documentId: portfolioDocumentId,
      populate: {
        entries: true,
      },
    });

  if (!portfolio) {
    throw new Error("Faculty portfolio was not found.");
  }

  const entries = Array.isArray(portfolio.entries)
    ? portfolio.entries.filter(
        (entry: any) => entry?.is_current !== false,
      )
    : [];

  const statuses = entries.map(
    (entry: any) => entry.verification_status || "draft",
  );

  const completedSections = new Set(
    entries
      .filter(
        (entry: any) =>
          entry.verification_status === "verified",
      )
      .map((entry: any) =>
        normalizeRequiredSection(entry.entry_type),
      )
      .filter(Boolean),
  );

  const completionPercentage = Math.round(
    (completedSections.size / REQUIRED_SECTIONS.length) * 100,
  );

  let portfolioStatus: PortfolioStatus = "draft";

  if (entries.length === 0) {
    portfolioStatus = "draft";
  } else if (statuses.includes("needs_correction")) {
    portfolioStatus = "needs_correction";
  } else if (
    statuses.includes("for_verification") ||
    statuses.includes("pending")
  ) {
    portfolioStatus = statuses.includes("verified")
      ? "partially_verified"
      : "for_verification";
  } else if (
    statuses.every(
      (status: string) => status === "verified",
    )
  ) {
    portfolioStatus = "verified";
  } else if (statuses.includes("verified")) {
    portfolioStatus = "partially_verified";
  }

  const lastVerifiedAt =
    portfolioStatus === "verified"
      ? new Date().toISOString()
      : portfolio.last_verified_at || null;

  return strapi
    .documents("api::faculty-portfolio.faculty-portfolio")
    .update({
      documentId: portfolioDocumentId,
      data: {
        portfolio_status: portfolioStatus,
        completion_percentage: completionPercentage,
        last_verified_at: lastVerifiedAt,
      } as any,
    });
}

function normalizeRequiredSection(entryType: string) {
  if (
    ["license", "certification", "eligibility"].includes(entryType)
  ) {
    return "eligibility";
  }

  if (
    ["training", "seminar", "resource_speaker"].includes(entryType)
  ) {
    return "training";
  }

  if (["research", "publication"].includes(entryType)) {
    return "research";
  }

  if (entryType === "award") {
    return "award";
  }

  if (REQUIRED_SECTIONS.includes(entryType as any)) {
    return entryType;
  }

  return null;
}
