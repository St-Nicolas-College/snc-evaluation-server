const PREFIX = "FP";

export async function generatePortfolioNumber(
  strapi: any,
): Promise<string> {
  const year = new Date().getFullYear();

  const latest = await strapi.db
    .query(
      "api::faculty-portfolio.faculty-portfolio",
    )
    .findOne({
      where: {
        portfolio_no: {
          $startsWith: `${PREFIX}-${year}-`,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: ["portfolio_no"],
    });

  const lastSequence = Number(
    String(latest?.portfolio_no || "")
      .split("-")
      .at(-1),
  );

  const nextSequence = Number.isFinite(
    lastSequence,
  )
    ? lastSequence + 1
    : 1;

  return `${PREFIX}-${year}-${String(
    nextSequence,
  ).padStart(5, "0")}`;
}
