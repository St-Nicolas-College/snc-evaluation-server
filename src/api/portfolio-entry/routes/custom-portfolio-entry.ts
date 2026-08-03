export default {
  routes: [
    {
      method: "POST",
      path: "/portfolio-entries/:documentId/submit",
      handler: "portfolio-entry.submit",
      config: { auth: {} },
    },
    {
      method: "POST",
      path: "/portfolio-entries/:documentId/return",
      handler:
        "portfolio-entry.returnForCorrection",
      config: { auth: {} },
    },
    {
      method: "POST",
      path: "/portfolio-entries/:documentId/verify",
      handler: "portfolio-entry.verify",
      config: { auth: {} },
    },
    {
      method: "POST",
      path: "/portfolio-entries/:documentId/reject",
      handler: "portfolio-entry.reject",
      config: { auth: {} },
    },
    {
      method: "POST",
      path: "/portfolio-entries/:documentId/reopen",
      handler: "portfolio-entry.reopen",
      config: { auth: {} },
    },
  ],
};
