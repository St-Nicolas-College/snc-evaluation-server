export default {
  routes: [
    {
      method: "POST",
      path: "/faculty-rankings/compute/:teacherDocumentId",
      handler: "faculty-ranking.compute",
      config: {
        auth: {},
      },
    },
    {
      method: "POST",
      path: "/faculty-rankings/batch-compute",
      handler: "faculty-ranking.batchCompute",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
