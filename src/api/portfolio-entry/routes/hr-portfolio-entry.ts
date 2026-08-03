export default {
  routes: [
    {
      method: "GET",
      path: "/portfolio-entries/verification-queue",
      handler:
        "portfolio-entry.verificationQueue",
      config: { auth: {} },
    },
    {
      method: "GET",
      path: "/portfolio-entries/verification-queue/:documentId",
      handler:
        "portfolio-entry.verificationQueueDetail",
      config: { auth: {} },
    },
  ],
};
