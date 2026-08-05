export default {
  routes: [
    {
      method: "POST",

      path:
        "/faculty-rankings/compute/:teacherDocumentId",

      handler:
        "faculty-ranking.compute",

      config: {
        auth: {},
      },
    },
  ],
};