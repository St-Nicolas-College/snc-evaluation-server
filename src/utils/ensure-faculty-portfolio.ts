import { generatePortfolioNumber } from "./generate-portfolio-number";

export async function ensureFacultyPortfolio(
  strapi: any,
  teacherIdOrDocumentId: string | number,
) {
  const teacher = await findTeacher(
    strapi,
    teacherIdOrDocumentId,
  );

  if (!teacher) {
    throw new Error(
      "Teacher record was not found.",
    );
  }

  const roleName =
    teacher?.user?.role?.name ||
    teacher?.user?.role?.type ||
    "";

  if (
    String(roleName).toLowerCase() !==
    "faculty"
  ) {
    return null;
  }

  const existing = await strapi
    .documents(
      "api::faculty-portfolio.faculty-portfolio",
    )
    .findFirst({
      filters: {
        faculty: {
          documentId: {
            $eq: teacher.documentId,
          },
        },
      },
    });

  if (existing) {
    return existing;
  }

  const portfolioNo =
    await generatePortfolioNumber(strapi);

  return strapi
    .documents(
      "api::faculty-portfolio.faculty-portfolio",
    )
    .create({
      data: {
        portfolio_no: portfolioNo,
        portfolio_status: "draft",
        completion_percentage: 0,
        faculty: {
          connect: [
            {
              documentId:
                teacher.documentId,
            },
          ],
        },
      },
      status: "published",
    });
}

async function findTeacher(
  strapi: any,
  id: string | number,
) {
  if (
    typeof id === "string" &&
    !/^\d+$/.test(id)
  ) {
    return strapi
      .documents("api::teacher.teacher")
      .findOne({
        documentId: id,
        populate: {
          user: {
            populate: {
              role: true,
            },
          },
        },
      });
  }

  return strapi.db
    .query("api::teacher.teacher")
    .findOne({
      where: {
        id: Number(id),
      },
      populate: {
        user: {
          populate: {
            role: true,
          },
        },
      },
    });
}
