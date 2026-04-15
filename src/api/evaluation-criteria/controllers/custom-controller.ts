"use strict";

export default {
  async testApi(ctx) {
    ctx.body = "Test Api for Evaluation Criteria";
    ctx.status = 200;
  },

  async getEvaluationCriteria(ctx) {
    try {
      const criteria = await strapi
        .documents("api::evaluation-criteria.evaluation-criteria")
        .findMany({
          populate: {
            section: true,
          },
          sort: ["order:asc"],
        });

      return ctx.send({
        data: criteria,
      });
    } catch (error) {
      console.error(error);
      return ctx.internalServerError(
        "Something went wrong while populating criteria.",
      );
    }
  },
};
