export default {
  routes: [
    {
      method: "PUT",
      path: "/account/me/settings",
      handler: "account.updateMySettings",
      config: {},
    },
    {
      method: "PUT",
      path: "/account/me/change-password",
      handler: "account.changeMyPassword",
      config: {},
    },
  ],
};