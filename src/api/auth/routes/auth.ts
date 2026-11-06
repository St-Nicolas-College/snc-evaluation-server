export default {
  routes: [
    {
      method: "POST",
      path: "/auth/login",
      handler: "auth.login",
      config: { auth: false },
    },
    {
      method: "POST",
      path: "/auth/refresh",
      handler: "auth.refresh",
      config: { auth: false },
    },
    {
      method: "POST",
      path: "/auth/logout",
      handler: "auth.logout",
      config: { auth: false },
    },
    {
      method: "PUT",
      path: "/auth/change-password",
      handler: "auth.changePassword", // Adjust 'auth' to your existing controller's registered name.
      config: {}, // Requires an authenticated users-permissions JWT and enabled permission.
    },
  ],
};
