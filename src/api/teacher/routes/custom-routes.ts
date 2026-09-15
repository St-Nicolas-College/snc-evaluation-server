export default {
  routes: [
    {
      method: "POST",
      path: "/teachers/register",
      handler: "custom-controller.registerTeacher",
      config: {},
    },
    {
      method: "PUT",
      path: "/teachers/update-with-user/:id",
      handler: "custom-controller.updateTeacherWithUser",
      config: {},
    },
    {
      method: "DELETE",
      path: "/teachers/delete-with-user/:id",
      handler: "custom-controller.deleteTeacherWithUser",
      config: {},
    },
    {
      method: "PUT",
      path: "/teachers/me/settings",
      handler: "custom-controller.updateMySettings",
      config: {},
    },
    {
      method: "PUT",
      path: "/teachers/me/change-password",
      handler: "custom-controller.changeMyPassword",
      config: {},
    },
  ],
};
