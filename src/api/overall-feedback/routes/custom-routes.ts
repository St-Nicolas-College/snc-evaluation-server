export default {
  routes: [
    {
      method: 'GET',
      path: '/overall-feedbacks/check-my-submission',
      handler: 'custom-controller.checkMySubmission',
      config: {
        auth: {}
      }
    },
    {
      method: 'POST',
      path: '/overall-feedbacks/create',
      handler: 'custom-controller.create',
      config: {
        auth: {}
      }
    }
  ]
}