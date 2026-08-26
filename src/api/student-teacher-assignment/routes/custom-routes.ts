export default {
  routes: [
    {
      method: "GET",
      path: "/student-teacher-assignments/me",
      handler: "custom-controller.getMyAssignments",
      config: {},
    },

    {
      method: "GET",
      path: "/student-teacher-assignments/available-teachers",
      handler: "custom-controller.getAvailableTeachers",
      config: {},
    },

    {
      method: "POST",
      path: "/student-teacher-assignments/me",
      handler: "custom-controller.addMyTeachers",
      config: {},
    },

    {
      method: "DELETE",
      path: "/student-teacher-assignments/me/:id",
      handler: "custom-controller.removeMyTeacher",
      config: {},
    },
    {
      method: "GET",
      path: "/student-teacher-assignments/history",
      handler: "custom-controller.getMyAssignmentHistory",
      config: {},
    },
  ],
};
