type EvaluationItem = {
  teacher: number
  subject: number
  comment?: string
  responses: Record<string, number>
}

export default {
  async submitEvaluation(ctx) {
    try {
      const {
        semester,
        school_year,
        date,
        teacher_name,
        subject,
        course,
        days_time,
        comment,
        responses,
      } = ctx.request.body;

      if (
        !semester ||
        !school_year ||
        !date ||
        !teacher_name ||
        !subject ||
        !course ||
        !days_time ||
        !responses ||
        !Array.isArray(responses)
      ) {
        return ctx.badRequest("Missing required fields.");
      }

      const total_score = responses.reduce(
        (sum, item) => sum + Number(item.score || 0),
        0,
      );
      const average_score = responses.length
        ? Number((total_score / responses.length).toFixed(2))
        : 0;

      const evaluation = await strapi.entityService.create(
        "api::evaluation.evaluation",
        {
          data: {
            semester,
            school_year,
            date,
            teacher_name,
            subject,
            course,
            days_time,
            comment,
            total_score,
            average_score,
          },
        },
      );

      for (const item of responses) {
        if (!item.criterion || !item.score) continue;

        await strapi.entityService.create(
          "api::evaluation-response.evaluation-response",
          {
            data: {
              score: item.score,
              evaluation: evaluation.id,
              criterion: item.criterion,
            },
          },
        );
      }

      return ctx.send({
        message: "Evaluation submitted successfully.",
        data: evaluation,
      });
    } catch (error) {
      console.error(error);
      return ctx.internalServerError(
        "Something went wrong while submitting evaluation.",
      );
    }
  },

  async submitMultipleEvaluations(ctx) {
    try {
      const { semester, school_year, date, course, days_time, evaluations } =
        ctx.request.body;

      if (
        !semester ||
        !school_year ||
        !date ||
        !course ||
        !days_time ||
        !evaluations ||
        !Array.isArray(evaluations)
      ) {
        return ctx.badRequest("Missing required fields.");
      }

      const batch = await strapi.entityService.create(
        "api::evaluation-batch.evaluation-batch",
        {
          data: {
            semester,
            school_year,
            date,
            course,
            days_time,
          },
        },
      );

      const createdEvaluations = [];

      for (const item of evaluations as EvaluationItem[]) {
        if (!item.teacher || !item.responses) {
          return ctx.badRequest(
            "Each evaluation must include teacher, subject, and responses.",
          );
        }

        const crierionIds = Object.keys(item.responses).map((id) => Number(id));

        const criteria = await strapi.entityService.findMany("api::evaluation-criteria.evaluation-criteria", 
          {
            filters: {
              id: {
                $in: crierionIds,
              }
            },
            populate: {
              section: true
            },
            fields: ["id", "statement", "order"],
            sort: ["order:asc"],
            pagination: {
              pageSize: 100
            }
          }
        )

        const enrichedResponses = criteria.map((criterion: any) => ({
          section: criterion.section?.title || "",
          sectionOrder: criterion.section?.order || 0,
          criterion_id: criterion.id,
          order: criterion.order,
          statement: criterion.statement,
          score: Number(item.responses[criterion.id] || 0)
        }))

        // Sort by section
        enrichedResponses.sort((a, b) => {
          if (a.sectionOrder === b.sectionOrder) {
            return a.order - b.order;
          }
          //return a.section.localeCompare(b.section)
          return a.sectionOrder - b.sectionOrder
        })

        // const responseValues = Object.values(item.responses).map((score) =>
        //   Number(score || 0),
        // );

        const total_score = enrichedResponses.reduce(
          (sum, response) => sum + response.score,
          0,
        );
        const average_score = enrichedResponses.length
          ? Number((total_score / enrichedResponses.length).toFixed(2))
          : 0;

        const evaluation = await strapi.entityService.create(
          "api::evaluation.evaluation",
          {
            data: {
              batch: batch.id,
              teacher: item.teacher,
              //subject: item.subject,
              responses: enrichedResponses,
              total_score,
              average_score,
              comment: item.comment || "",
            },
            populate: {
              teacher: true,
              //subject: true,
              batch: true,
            },
          },
        );

        createdEvaluations.push(evaluation);
      }

      return ctx.send({
        message: "Evaluations submitted successfully.",
        batchId: batch.id,
        count: createdEvaluations.length,
        data: createdEvaluations,
      });
    } catch (error) {
      console.error(error);
      return ctx.internalServerError(
        "Something went wrong while submitting evaluations.",
      );
    }
  },
};
