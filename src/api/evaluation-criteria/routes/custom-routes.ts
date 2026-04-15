
export default {
    routes: [
        {
            method: "GET",
            path: "/test",
            handler: "custom-controller.testApi",
            config: {
                auth: false
            }
        },
        {
            method: "GET",
            path: "/evaluation-criterias/list",
            handler: "custom-controller.getEvaluationCriteria",
            config: {
                auth: false
            }
        }
    ]
}