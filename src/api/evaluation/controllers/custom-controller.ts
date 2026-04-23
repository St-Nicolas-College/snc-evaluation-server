type EvaluationItem = {
  teacher?: number;
  dean_coordinator?: number;
  subject: number;
  comment?: string;
  strengths?: string;
  areas_for_improvement?: string;
  responses: Record<string, number>;
};

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
      const {
        evaluation_type,
        semester,
        school_year,
        date,
        course,
        days_time,
        department,
        evaluations,
      } = ctx.request.body;

      if (
        !evaluation_type ||
        !semester ||
        !school_year ||
        // !date ||
        //!course ||
        // !days_time ||
        !evaluations ||
        !Array.isArray(evaluations)
      ) {
        return ctx.badRequest("Missing required fields.");
      }

      // ✅ Get evaluation type (to know behavior)
      const evalType = await strapi.entityService.findOne(
        "api::evaluation-type.evaluation-type",
        evaluation_type,
      );

      if (!evalType) {
        return ctx.badRequest("Invalid evaluation type.");
      }

      const isStudentFaculty = evalType.code === "student-faculty";
      const isFacultyDean = evalType.code === "faculty-dean-coordinator";

      const batch = await strapi.entityService.create(
        "api::evaluation-batch.evaluation-batch",
        {
          data: {
            evaluation_type,
            semester,
            school_year,
            date,
            course,
            days_time,
            department,
          },
        },
      );

      const createdEvaluations = [];

      for (const item of evaluations as EvaluationItem[]) {
        // if (!item.teacher || !item.responses) {
        //   return ctx.badRequest("Each evaluation must include responses.");
        // }

        // ✅ Validate target
        if (isStudentFaculty && !item.teacher) {
          return ctx.badRequest("Teacher is required for student evaluation.");
        }

        if (isFacultyDean && !item.dean_coordinator) {
          return ctx.badRequest("Dean/Coordinator is required.");
        }

        if (!item.responses) {
          return ctx.badRequest("Responses are required.");
        }

        // ✅ Get criteria with section
        const crierionIds = Object.keys(item.responses).map((id) => Number(id));

        const criteria = await strapi.entityService.findMany(
          "api::evaluation-criteria.evaluation-criteria",
          {
            filters: {
              id: {
                $in: crierionIds,
              },
            },
            populate: {
              //section: true
              section: {
                fields: ["title", "order"],
              },
            },
            fields: ["id", "statement", "order"],
            sort: ["order:asc"],
            pagination: {
              pageSize: 100,
            },
          },
        );

        // ✅ Build enriched responses
        const enrichedResponses = criteria.map((criterion: any) => ({
          section: criterion.section?.title || "",
          sectionOrder: Number(criterion.section?.order || 0),
          criterion_id: criterion.id,
          order: criterion.order,
          statement: criterion.statement,
          score: Number(item.responses[criterion.id] || 0),
        }));

        // Sort by section
        enrichedResponses.sort((a, b) => {
          if (a.sectionOrder === b.sectionOrder) {
            return a.order - b.order;
          }
          //return a.section.localeCompare(b.section)
          return a.sectionOrder - b.sectionOrder;
        });

        // const responseValues = Object.values(item.responses).map((score) =>
        //   Number(score || 0),
        // );

        const total_score = enrichedResponses.reduce(
          (sum, response) => sum + response.score || 0,
          0,
        );
        const average_score = enrichedResponses.length
          ? Number((total_score / enrichedResponses.length).toFixed(2))
          : 0;

        // ✅ Build evaluation payload dynamically
        const evaluationData: any = {
          batch: batch.id,
          responses: enrichedResponses,
          total_score,
          average_score,
          comment: item.comment || "",
          strengths: item.strengths || "",
          areas_for_improvement: item.areas_for_improvement || "",
        };

        // ✅ Assign correct target
        if (isStudentFaculty) {
          evaluationData.teacher = item.teacher;
        }

        if (isFacultyDean) {
          evaluationData.dean_coordinator = item.dean_coordinator;
        }

        // ✅ Save evaluation
          const evaluation = await strapi.entityService.create(
            'api::evaluation.evaluation',
            {
              data: evaluationData
            }
          )


        // const evaluation = await strapi.entityService.create(
        //   "api::evaluation.evaluation",
        //   {
        //     data: {
        //       batch: batch.id,
        //       teacher: item.teacher || null,
        //       dean_coordinator: item.dean_coordinator || null,
        //       //subject: item.subject,
        //       responses: enrichedResponses,
        //       total_score,
        //       average_score,
        //       comment: item.comment || "",
        //       strengths: item.strengths || "",
        //       areas_for_improvement: item.areas_for_improvement || "",
        //     },
        //     populate: {
        //       teacher: true,
        //       //subject: true,
        //       batch: true,
        //     },
        //   },
        // );

        createdEvaluations.push(evaluation);
      }

      return ctx.send({
        message: "Evaluations submitted successfully.",
        batchId: batch.id,
        type: evalType.code,
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
