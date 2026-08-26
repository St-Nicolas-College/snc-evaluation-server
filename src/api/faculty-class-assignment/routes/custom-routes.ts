export default {
  routes: [
    {
      method: "GET",
      path: "/faculty-class-assignments/class",
      handler: "custom-controller.getClassAssignments",
      config: {},
    },

    {
      method: "POST",
      path: "/faculty-class-assignments/class",
      handler: "custom-controller.saveClassAssignments",
      config: {},
    },
  ],
};
