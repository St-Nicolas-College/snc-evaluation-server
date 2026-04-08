export default {
  routes: [
    {
      method: "POST",
      path: "/submit-evaluation",
      handler: "custom-controller.submitEvaluation",
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/submit-multiple-evaluations',
      handler: 'custom-controller.submitMultipleEvaluations',
      config: {
        auth: false
      }
    }
  ],
};
