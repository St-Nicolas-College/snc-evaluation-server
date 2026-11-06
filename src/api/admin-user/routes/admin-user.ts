/** Requires Users & Permissions authentication, route permission and controller Admin checks. */
export default {
  routes: [
    {
      method: "GET",
      path: "/admin/users/summary",
      handler: "admin-user.summary",
      config: {},
    },
    {
      method: "GET",
      path: "/admin/users/roles",
      handler: "admin-user.roles",
      config: {},
    },
    {
      method: "GET",
      path: "/admin/users",
      handler: "admin-user.list",
      config: {},
    },
    {
      method: "GET",
      path: "/admin/users/:id",
      handler: "admin-user.detail",
      config: {},
    },
    {
      method: "POST",
      path: "/admin/users",
      handler: "admin-user.create",
      config: {},
    },
    {
      method: "PUT",
      path: "/admin/users/:id",
      handler: "admin-user.update",
      config: {},
    },
    {
      method: "PUT",
      path: "/admin/users/:id/role",
      handler: "admin-user.changeRole",
      config: {},
    },
    {
      method: "PUT",
      path: "/admin/users/:id/status",
      handler: "admin-user.setBlocked",
      config: {},
    },
    {
      method: "POST",
      path: "/admin/users/:id/reset-password",
      handler: "admin-user.resetPassword",
      config: {},
    },
  ],
};
