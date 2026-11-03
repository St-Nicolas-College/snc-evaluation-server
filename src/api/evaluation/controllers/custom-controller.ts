import { analyzeFeedbackSentiment } from "../utils/openai-sentiment";
import { moderateFacultyFeedback } from "../utils/openai-moderation";

type EvaluationItem = {
  teacher?: number;
  dean_coordinator?: number;
  subject: number;
  comment?: string;
  strengths?: string;
  areas_for_improvement?: string;
  effectiveness?: string;
  suggested_activities?: string;
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

  // async submitMultipleEvaluations(ctx) {
  //   try {
  //     const userId = ctx.state.user?.id;

  //     // if (!userId) {
  //     //   return ctx.unauthorized("User not authenticated.");
  //     // }

  //     const {
  //       evaluation_type,
  //       semester,
  //       school_year,
  //       date,
  //       course,
  //       days_time,
  //       department,
  //       evaluations,
  //     } = ctx.request.body;

  //     if (
  //       !evaluation_type ||
  //       !semester ||
  //       !school_year ||
  //       // !date ||
  //       //!course ||
  //       // !days_time ||
  //       !evaluations ||
  //       !Array.isArray(evaluations)
  //     ) {
  //       return ctx.badRequest("Missing required fields.");
  //     }

  //     // ✅ Get evaluation type (to know behavior)
  //     const evalType = await strapi.entityService.findOne(
  //       "api::evaluation-type.evaluation-type",
  //       evaluation_type,
  //     );

  //     if (!evalType) {
  //       return ctx.badRequest("Invalid evaluation type.");
  //     }

  //     const isStudentFaculty = evalType.code === "student-faculty";
  //     const isFacultyDean = evalType.code === "faculty-dean-coordinator";

  //     const batch = await strapi.entityService.create(
  //       "api::evaluation-batch.evaluation-batch",
  //       {
  //         data: {
  //           evaluation_type,
  //           semester,
  //           school_year,
  //           date,
  //           course,
  //           days_time,
  //           department,
  //         },
  //       },
  //     );

  //     const createdEvaluations = [];

  //     for (const item of evaluations as EvaluationItem[]) {
  //       if (!item.responses) {
  //         return ctx.badRequest("Responses are required.");
  //       }
  //       // ✅ Validate target
  //       if (isStudentFaculty && !item.subject) {
  //         return ctx.badRequest("Subject is required for student evaluation.");
  //       }

  //       if (isFacultyDean && !item.dean_coordinator) {
  //         return ctx.badRequest("Dean/Coordinator is required.");
  //       }

  //       if (isStudentFaculty) {
  //         const existing = await strapi.db
  //           .query("api::evaluation.evaluation")
  //           .findOne({
  //             where: {
  //               evaluator_user: userId,
  //               teacher: item.teacher,
  //               subject: item.subject,
  //               batch: {
  //                 semester,
  //                 school_year,
  //                 evaluation_type,
  //               },
  //             },
  //           });

  //         if (existing) {
  //           return ctx.badRequest(
  //             "You already evaluated this teacher for this subject in this semester and school year.",
  //           );
  //         }
  //       }

  //       // ✅ Get criteria with section
  //       const crierionIds = Object.keys(item.responses).map((id) => Number(id));

  //       const criteria = await strapi.entityService.findMany(
  //         "api::evaluation-criteria.evaluation-criteria",
  //         {
  //           filters: {
  //             id: {
  //               $in: crierionIds,
  //             },
  //           },
  //           populate: {
  //             //section: true
  //             section: {
  //               fields: ["title", "order"],
  //             },
  //           },
  //           fields: ["id", "statement", "order"],
  //           sort: ["order:asc"],
  //           pagination: {
  //             pageSize: 100,
  //           },
  //         },
  //       );

  //       // ✅ Build enriched responses
  //       const enrichedResponses = criteria.map((criterion: any) => ({
  //         section: criterion.section?.title || "",
  //         sectionOrder: Number(criterion.section?.order || 0),
  //         criterion_id: criterion.id,
  //         order: criterion.order,
  //         statement: criterion.statement,
  //         score: Number(item.responses[criterion.id] || 0),
  //       }));

  //       // Sort by section
  //       enrichedResponses.sort((a, b) => {
  //         if (a.sectionOrder === b.sectionOrder) {
  //           return a.order - b.order;
  //         }
  //         //return a.section.localeCompare(b.section)
  //         return a.sectionOrder - b.sectionOrder;
  //       });

  //       // const responseValues = Object.values(item.responses).map((score) =>
  //       //   Number(score || 0),
  //       // );

  //       const total_score = enrichedResponses.reduce(
  //         (sum, response) => sum + response.score || 0,
  //         0,
  //       );
  //       const average_score = enrichedResponses.length
  //         ? Number((total_score / enrichedResponses.length).toFixed(2))
  //         : 0;

  //       // ✅ Build evaluation payload dynamically
  //       const evaluationData: any = {
  //         batch: batch.id,
  //         evaluator_user: ctx.state.user.id,
  //         responses: enrichedResponses,
  //         total_score,
  //         average_score,
  //         comment: item.comment || "",
  //         strengths: item.strengths || "",
  //         areas_for_improvement: item.areas_for_improvement || "",
  //       };

  //       // ✅ Assign correct target
  //       if (isStudentFaculty) {
  //         evaluationData.teacher = item.teacher;
  //         evaluationData.subject = item.subject;
  //       }

  //       if (isFacultyDean) {
  //         evaluationData.dean_coordinator = item.dean_coordinator;
  //       }

  //       // ✅ Save evaluation
  //       const evaluation = await strapi.entityService.create(
  //         "api::evaluation.evaluation",
  //         {
  //           data: evaluationData,
  //         },
  //       );

  //       createdEvaluations.push(evaluation);
  //     }

  //     return ctx.send({
  //       message: "Evaluations submitted successfully.",
  //       batchId: batch.id,
  //       type: evalType.code,
  //       count: createdEvaluations.length,
  //       data: createdEvaluations,
  //     });
  //   } catch (error) {
  //     console.error("SUBMIT EVALUATION ERROR:", error);
  //     return ctx.internalServerError(
  //       error.message || "Something went wrong while submitting evaluations.",
  //     );
  //   }
  // },

  async submitMultipleEvaluations(ctx) {
    type EvaluationItem = {
      teacher?: number;
      subject?: number;
      dean_coordinator?: number;
      responses: Record<string, number>;
      comment?: string;
      strengths?: string;
      areas_for_improvement?: string;
      effectiveness?: string;
      suggested_activities?: string;
    };

    class SubmissionValidationError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "SubmissionValidationError";
      }
    }

    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("User not authenticated.");
      }

      const {
        evaluation_type,
        semester,
        school_year,
        date,
        course,
        days_time,
        department,
        evaluations,
      } = (ctx.request.body ?? {}) as {
        evaluation_type: number;
        semester: string;
        school_year: string;
        date?: string;
        course?: string;
        days_time?: string;
        department?: string;
        evaluations: EvaluationItem[];
      };

      if (
        !evaluation_type ||
        !semester ||
        !school_year ||
        !Array.isArray(evaluations) ||
        evaluations.length === 0
      ) {
        return ctx.badRequest("Missing required fields or evaluations.");
      }

      const evalType = await strapi.entityService.findOne(
        "api::evaluation-type.evaluation-type",
        evaluation_type,
      );

      if (!evalType) {
        return ctx.badRequest("Invalid evaluation type.");
      }

      const isStudentFaculty = evalType.code === "student-faculty";

      const isFacultyDean = evalType.code === "faculty-dean-coordinator";

      const isDeanFaculty = evalType.code === "dean-faculty";

      if (!isStudentFaculty && !isFacultyDean && !isDeanFaculty) {
        return ctx.badRequest("Unsupported evaluation type.");
      }

      /*
       * STEP 1: VALIDATE ALL EVALUATIONS
       *
       * No database records are created here.
       */

      const submittedTargets = new Set<string>();

      for (const item of evaluations) {
        if (
          !item.responses ||
          typeof item.responses !== "object" ||
          Array.isArray(item.responses) ||
          Object.keys(item.responses).length === 0
        ) {
          return ctx.badRequest("Evaluation responses are required.");
        }

        if (isStudentFaculty && !item.teacher) {
          return ctx.badRequest("Teacher is required for student evaluation.");
        }

        if (isFacultyDean && !item.dean_coordinator) {
          return ctx.badRequest("Dean/Coordinator is required.");
        }

        if (isDeanFaculty && !item.teacher) {
          return ctx.badRequest(
            "Faculty member is required for dean evaluation.",
          );
        }

        const targetKey = isFacultyDean
          ? `dean:${item.dean_coordinator}`
          : `teacher:${item.teacher}`;

        if (submittedTargets.has(targetKey)) {
          return ctx.badRequest(
            "The same evaluation target was submitted more than once.",
          );
        }

        submittedTargets.add(targetKey);

        const criterionIds = Object.keys(item.responses);

        if (
          criterionIds.some(
            (id) =>
              !Number.isInteger(Number(id)) ||
              Number(id) <= 0 ||
              !Number.isFinite(Number(item.responses[id])),
          )
        ) {
          return ctx.badRequest("Invalid evaluation criterion or score.");
        }
      }

      /*
       * STEP 2: AI FEEDBACK MODERATION
       *
       * Only student-faculty comments are moderated.
       * Written feedback remains optional.
       */

      if (isStudentFaculty) {
        for (let index = 0; index < evaluations.length; index++) {
          const item = evaluations[index];

          const comment = String(item.comment ?? "").trim();

          if (!comment) {
            continue;
          }

          let moderation;

          try {
            moderation = await moderateFacultyFeedback(comment);
          } catch (moderationError) {
            strapi.log.error(
              `Faculty feedback moderation failed: ${
                moderationError instanceof Error
                  ? moderationError.message
                  : String(moderationError)
              }`,
            );

            ctx.status = 503;
            ctx.body = {
              data: null,
              error: {
                status: 503,
                name: "ServiceUnavailableError",
                message:
                  "Feedback verification is temporarily unavailable. " +
                  "Please try submitting your evaluation again.",
              },
            };

            return;
          }

          if (!moderation.approved) {
            ctx.status = 400;
            ctx.body = {
              data: null,
              error: {
                status: 400,
                name: "FeedbackModerationError",
                message:
                  `Feedback for faculty evaluation ${index + 1} ` +
                  "needs revision.",
                details: {
                  code: "FEEDBACK_MODERATION_REJECTED",
                  evaluationIndex: index,
                  teacherId: item.teacher,
                  category: moderation.category,
                  reason: moderation.reason,
                  suggestion: moderation.suggestion,
                },
              },
            };

            return;
          }
        }
      }

      /*
       * STEP 3: PREPARE EVALUATION DATA
       *
       * Resolve criteria, calculate scores, and
       * perform sentiment analysis before opening
       * the database transaction.
       */

      const preparedEvaluations: any[] = [];

      for (const item of evaluations) {
        const criterionIds = Object.keys(item.responses).map(Number);

        const criteria: any = await strapi.entityService.findMany(
          "api::evaluation-criteria.evaluation-criteria",
          {
            filters: {
              id: {
                $in: criterionIds,
              },
            },
            populate: {
              section: {
                fields: ["title", "order"],
              },
            },
            fields: ["id", "statement", "order"],
            pagination: {
              pageSize: 300,
            },
          },
        );

        if (criteria.length !== criterionIds.length) {
          return ctx.badRequest("One or more evaluation criteria are invalid.");
        }

        const enrichedResponses = criteria.map((criterion: any) => ({
          section: criterion.section?.title || "",
          sectionOrder: Number(criterion.section?.order || 0),
          criterionId: criterion.id,
          order: Number(criterion.order || 0),
          statement: criterion.statement,
          score: Number(item.responses[criterion.id] || 0),
        }));

        enrichedResponses.sort((a, b) => {
          if (a.sectionOrder === b.sectionOrder) {
            return a.order - b.order;
          }

          return a.sectionOrder - b.sectionOrder;
        });

        const total_score = enrichedResponses.reduce(
          (sum, response) => sum + Number(response.score || 0),
          0,
        );

        const average_score = enrichedResponses.length
          ? Number((total_score / enrichedResponses.length).toFixed(2))
          : 0;

        const comment = String(item.comment ?? "");

        let sentimentResult = {
          sentiment: "Neutral",
          score: 0,
          summary: "",
          suggestion: "",
          keywords: [] as string[],
        };

        if (isStudentFaculty && comment.trim()) {
          sentimentResult = await analyzeFeedbackSentiment(comment);
        }

        const evaluationData: any = {
          evaluator_user: userId,
          responses: enrichedResponses,
          total_score,
          average_score,
          comment,
          strengths: item.strengths || "",
          areas_for_improvement: item.areas_for_improvement || "",
          effectiveness: item.effectiveness || "",
          suggested_activities: item.suggested_activities || "",
          feedback_sentiment: sentimentResult.sentiment,
          feedback_sentiment_score: sentimentResult.score,
          feedback_sentiment_summary: sentimentResult.summary,
          feedback_sentiment_suggestion: sentimentResult.suggestion,
          feedback_keywords: sentimentResult.keywords,
        };

        if (isStudentFaculty) {
          evaluationData.teacher = item.teacher;
          evaluationData.subject = item.subject;
        }

        if (isFacultyDean) {
          evaluationData.dean_coordinator = item.dean_coordinator;
        }

        if (isDeanFaculty) {
          evaluationData.teacher = item.teacher;
        }

        preparedEvaluations.push(evaluationData);
      }

      /*
       * STEP 4: DATABASE TRANSACTION
       *
       * All database writes must succeed together.
       * Throwing an error causes rollback.
       */

      const result = await strapi.db.transaction(async () => {
        /*
         * Check duplicates inside the transaction
         * before creating the batch.
         */

        for (const item of evaluations) {
          let existing = null;

          if (isStudentFaculty || isDeanFaculty) {
            existing = await strapi.db
              .query("api::evaluation.evaluation")
              .findOne({
                where: {
                  evaluator_user: {
                    id: userId,
                  },
                  teacher: {
                    id: item.teacher,
                  },
                  batch: {
                    semester,
                    school_year,
                    evaluation_type: {
                      id: evaluation_type,
                    },
                  },
                },
              });
          }

          if (isFacultyDean) {
            existing = await strapi.db
              .query("api::evaluation.evaluation")
              .findOne({
                where: {
                  evaluator_user: {
                    id: userId,
                  },
                  dean_coordinator: {
                    id: item.dean_coordinator,
                  },
                  batch: {
                    semester,
                    school_year,
                    evaluation_type: {
                      id: evaluation_type,
                    },
                  },
                },
              });
          }

          if (existing) {
            if (isStudentFaculty) {
              throw new SubmissionValidationError(
                "You already evaluated this teacher " +
                  "for this semester and school year.",
              );
            }

            if (isFacultyDean) {
              throw new SubmissionValidationError(
                "You already evaluated this dean/coordinator " +
                  "for this semester and school year.",
              );
            }

            throw new SubmissionValidationError(
              "You already evaluated this faculty member " +
                "for this semester and school year.",
            );
          }
        }

        /*
         * Create the evaluation batch.
         */

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

        /*
         * Create all evaluations.
         *
         * If any creation fails, the transaction
         * rolls back all earlier writes.
         */

        for (const prepared of preparedEvaluations) {
          const evaluation = await strapi.entityService.create(
            "api::evaluation.evaluation",
            {
              data: {
                ...prepared,
                batch: batch.id,
              },
            },
          );

          createdEvaluations.push(evaluation);
        }

        return {
          batchId: batch.id,
          evaluations: createdEvaluations,
        };
      });

      /*
       * STEP 5: SUCCESS RESPONSE
       *
       * Sent only after the transaction commits.
       */

      return ctx.send({
        message: "Evaluations submitted successfully.",
        batchId: result.batchId,
        type: evalType.code,
        count: result.evaluations.length,
        data: result.evaluations,
      });
    } catch (error) {
      if (error instanceof SubmissionValidationError) {
        return ctx.badRequest(error.message);
      }

      strapi.log.error(
        `SUBMIT EVALUATION ERROR: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return ctx.internalServerError(
        "Something went wrong while submitting evaluations.",
      );
    }
  },
};
