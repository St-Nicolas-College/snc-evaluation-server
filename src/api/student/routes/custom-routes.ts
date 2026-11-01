export default {
  routes: [
    {
      method: "POST",
      path: "/students/register",
      handler: "custom-controller.registerStudent",
      config: {},
    },
    {
      method: "POST",
      path: "/students/import",
      handler: "custom-controller.importStudents",
      config: {},
    },
    {
      method: "PUT",
      path: "/students/update-with-user/:id",
      handler: "custom-controller.updateStudentWithUser",
      config: {},
    },
    {
      method: "DELETE",
      path: "/students/delete-with-user/:id",
      handler: "custom-controller.deleteStudentWithUser",
      config: {},
    },
    {
      method: "PUT",
      path: "/students/me/settings",
      handler: "custom-controller.updateMySettings",
      config: {},
    },
    {
      method: "PUT",
      path: "/students/me/change-password",
      handler: "custom-controller.changeMyPassword",
      config: {},
    },
  ],
};
