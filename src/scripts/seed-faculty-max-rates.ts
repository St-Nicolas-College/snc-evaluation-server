const SALARY_RATE_UID =
  "api::salary-rate.salary-rate";

const RANKING_SCHEME_UID =
  "api::ranking-scheme.ranking-scheme";

interface FacultyMaxRateSeed {
  pointValue: number | null;
  isMinimumRate: boolean;
  belowPoints: number | null;
  maxRate: number;
}

const facultyMaxRates: FacultyMaxRateSeed[] = [
  {
    pointValue: null,
    isMinimumRate: true,
    belowPoints: 25,
    maxRate: 147,
  },

  { pointValue: 26, isMinimumRate: false, belowPoints: null, maxRate: 149 },
  { pointValue: 27, isMinimumRate: false, belowPoints: null, maxRate: 151 },
  { pointValue: 28, isMinimumRate: false, belowPoints: null, maxRate: 153 },
  { pointValue: 29, isMinimumRate: false, belowPoints: null, maxRate: 155 },
  { pointValue: 30, isMinimumRate: false, belowPoints: null, maxRate: 157 },
  { pointValue: 31, isMinimumRate: false, belowPoints: null, maxRate: 159 },
  { pointValue: 32, isMinimumRate: false, belowPoints: null, maxRate: 161 },
  { pointValue: 33, isMinimumRate: false, belowPoints: null, maxRate: 163 },
  { pointValue: 34, isMinimumRate: false, belowPoints: null, maxRate: 165 },
  { pointValue: 35, isMinimumRate: false, belowPoints: null, maxRate: 167 },
  { pointValue: 36, isMinimumRate: false, belowPoints: null, maxRate: 169 },
  { pointValue: 37, isMinimumRate: false, belowPoints: null, maxRate: 171 },
  { pointValue: 38, isMinimumRate: false, belowPoints: null, maxRate: 173 },
  { pointValue: 39, isMinimumRate: false, belowPoints: null, maxRate: 175 },
  { pointValue: 40, isMinimumRate: false, belowPoints: null, maxRate: 177 },
  { pointValue: 41, isMinimumRate: false, belowPoints: null, maxRate: 179 },
  { pointValue: 42, isMinimumRate: false, belowPoints: null, maxRate: 181 },
  { pointValue: 43, isMinimumRate: false, belowPoints: null, maxRate: 183 },
  { pointValue: 44, isMinimumRate: false, belowPoints: null, maxRate: 185 },
  { pointValue: 45, isMinimumRate: false, belowPoints: null, maxRate: 187 },
  { pointValue: 46, isMinimumRate: false, belowPoints: null, maxRate: 189 },
  { pointValue: 47, isMinimumRate: false, belowPoints: null, maxRate: 191 },
  { pointValue: 48, isMinimumRate: false, belowPoints: null, maxRate: 193 },
  { pointValue: 49, isMinimumRate: false, belowPoints: null, maxRate: 195 },
  { pointValue: 50, isMinimumRate: false, belowPoints: null, maxRate: 197 },
  { pointValue: 51, isMinimumRate: false, belowPoints: null, maxRate: 199 },
  { pointValue: 52, isMinimumRate: false, belowPoints: null, maxRate: 201 },
  { pointValue: 53, isMinimumRate: false, belowPoints: null, maxRate: 203 },
  { pointValue: 54, isMinimumRate: false, belowPoints: null, maxRate: 205 },
  { pointValue: 55, isMinimumRate: false, belowPoints: null, maxRate: 207 },
  { pointValue: 56, isMinimumRate: false, belowPoints: null, maxRate: 209 },
  { pointValue: 57, isMinimumRate: false, belowPoints: null, maxRate: 211 },
  { pointValue: 58, isMinimumRate: false, belowPoints: null, maxRate: 213 },
  { pointValue: 59, isMinimumRate: false, belowPoints: null, maxRate: 215 },
  { pointValue: 60, isMinimumRate: false, belowPoints: null, maxRate: 217 },
  { pointValue: 61, isMinimumRate: false, belowPoints: null, maxRate: 219 },
  { pointValue: 62, isMinimumRate: false, belowPoints: null, maxRate: 221 },
  { pointValue: 63, isMinimumRate: false, belowPoints: null, maxRate: 223 },
  { pointValue: 64, isMinimumRate: false, belowPoints: null, maxRate: 225 },
  { pointValue: 65, isMinimumRate: false, belowPoints: null, maxRate: 227 },
  { pointValue: 66, isMinimumRate: false, belowPoints: null, maxRate: 229 },
  { pointValue: 67, isMinimumRate: false, belowPoints: null, maxRate: 231 },
  { pointValue: 68, isMinimumRate: false, belowPoints: null, maxRate: 233 },
  { pointValue: 69, isMinimumRate: false, belowPoints: null, maxRate: 235 },
  { pointValue: 70, isMinimumRate: false, belowPoints: null, maxRate: 237 },

  { pointValue: 71, isMinimumRate: false, belowPoints: null, maxRate: 244 },
  { pointValue: 72, isMinimumRate: false, belowPoints: null, maxRate: 251 },
  { pointValue: 73, isMinimumRate: false, belowPoints: null, maxRate: 258 },
  { pointValue: 74, isMinimumRate: false, belowPoints: null, maxRate: 265 },
  { pointValue: 75, isMinimumRate: false, belowPoints: null, maxRate: 272 },

  { pointValue: 76, isMinimumRate: false, belowPoints: null, maxRate: 274 },
  { pointValue: 77, isMinimumRate: false, belowPoints: null, maxRate: 275 },
  { pointValue: 78, isMinimumRate: false, belowPoints: null, maxRate: 277 },
  { pointValue: 79, isMinimumRate: false, belowPoints: null, maxRate: 279 },
  { pointValue: 80, isMinimumRate: false, belowPoints: null, maxRate: 280 },
  { pointValue: 81, isMinimumRate: false, belowPoints: null, maxRate: 282 },
  { pointValue: 82, isMinimumRate: false, belowPoints: null, maxRate: 284 },
  { pointValue: 83, isMinimumRate: false, belowPoints: null, maxRate: 285 },
  { pointValue: 84, isMinimumRate: false, belowPoints: null, maxRate: 287 },
  { pointValue: 85, isMinimumRate: false, belowPoints: null, maxRate: 289 },
  { pointValue: 86, isMinimumRate: false, belowPoints: null, maxRate: 290 },
  { pointValue: 87, isMinimumRate: false, belowPoints: null, maxRate: 292 },
  { pointValue: 88, isMinimumRate: false, belowPoints: null, maxRate: 294 },
  { pointValue: 89, isMinimumRate: false, belowPoints: null, maxRate: 295 },
  { pointValue: 90, isMinimumRate: false, belowPoints: null, maxRate: 297 },
  { pointValue: 91, isMinimumRate: false, belowPoints: null, maxRate: 299 },
  { pointValue: 91.5, isMinimumRate: false, belowPoints: null, maxRate: 300 },
  { pointValue: 92, isMinimumRate: false, belowPoints: null, maxRate: 302 },
  { pointValue: 92.5, isMinimumRate: false, belowPoints: null, maxRate: 304 },
  { pointValue: 93, isMinimumRate: false, belowPoints: null, maxRate: 305 },
  { pointValue: 93.5, isMinimumRate: false, belowPoints: null, maxRate: 307 },
  { pointValue: 94, isMinimumRate: false, belowPoints: null, maxRate: 309 },
  { pointValue: 94.5, isMinimumRate: false, belowPoints: null, maxRate: 310 },
  { pointValue: 95, isMinimumRate: false, belowPoints: null, maxRate: 312 },
  { pointValue: 95.5, isMinimumRate: false, belowPoints: null, maxRate: 314 },
  { pointValue: 96, isMinimumRate: false, belowPoints: null, maxRate: 315 },
  { pointValue: 97, isMinimumRate: false, belowPoints: null, maxRate: 317 },
  { pointValue: 98, isMinimumRate: false, belowPoints: null, maxRate: 319 },
  { pointValue: 99, isMinimumRate: false, belowPoints: null, maxRate: 320 },
  { pointValue: 100, isMinimumRate: false, belowPoints: null, maxRate: 322 },
];

export async function seedFacultyMaxRates(
  strapi: any,
  rankingSchemeDocumentId: string,
) {
  const schemeDocumentId = String(
    rankingSchemeDocumentId || "",
  ).trim();

  if (!schemeDocumentId) {
    throw new Error(
      "Ranking scheme document ID is required.",
    );
  }

  const rankingScheme = await strapi
    .documents(RANKING_SCHEME_UID)
    .findOne({
      documentId: schemeDocumentId,
    });

  if (!rankingScheme) {
    throw new Error(
      "The selected ranking scheme was not found.",
    );
  }

  let created = 0;
  let updated = 0;

  for (
    let index = 0;
    index < facultyMaxRates.length;
    index += 1
  ) {
    const item =
      facultyMaxRates[index];

    const rateCode =
      item.isMinimumRate
        ? "max-rate-25-and-below"
        : `max-rate-${String(
            item.pointValue,
          ).replace(".", "-")}`;

    const rateName =
      item.isMinimumRate
        ? "25 Points and Below"
        : `${item.pointValue} Points`;

    const existing: any[] =
      await strapi
        .documents(
          SALARY_RATE_UID,
        )
        .findMany({
          filters: {
            rate_code: {
              $eq: rateCode,
            },

            ranking_scheme: {
              documentId: {
                $eq:
                  schemeDocumentId,
              },
            },
          },

          pagination: {
            page: 1,
            pageSize: 1,
          },
        });

    const data: any = {
      rate_code: rateCode,
      rate_name: rateName,

      point_value:
        item.pointValue,

      is_below_minimum:
        item.isMinimumRate,

      below_points:
        item.belowPoints,

      max_rate:
        item.maxRate,

      is_active: true,

      sort_order:
        index + 1,

      ranking_scheme:
        schemeDocumentId,

      remarks:
        item.isMinimumRate
          ? "Applies when total faculty points are equal to or below 25."
          : `Exact match required for ${item.pointValue} total faculty points.`,
    };

    const current =
      existing?.[0];

    if (current?.documentId) {
      await strapi
        .documents(
          SALARY_RATE_UID,
        )
        .update({
          documentId:
            current.documentId,
          data,
        });

      updated += 1;
    } else {
      await strapi
        .documents(
          SALARY_RATE_UID,
        )
        .create({
          data,
        });

      created += 1;
    }
  }

  strapi.log.info(
    `[Faculty MAX Rate Seed] Created: ${created}; Updated: ${updated}; Total: ${facultyMaxRates.length}`,
  );

  return {
    created,
    updated,
    total:
      facultyMaxRates.length,
  };
}