export default {
  /**
   * ============================================================
   * UPDATE MY ACCOUNT SETTINGS
   * ============================================================
   *
   * Updates the currently authenticated user's email address.
   *
   * This endpoint does NOT depend on:
   * - Teacher
   * - Faculty
   * - Dean
   * - HR
   *
   * It works directly with Strapi Users & Permissions.
   */
  async updateMySettings(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("You must be logged in.");
      }

      const { email } = ctx.request.body as {
        email?: string;
      };

      // --------------------------------------------------------
      // VALIDATE EMAIL
      // --------------------------------------------------------

      if (!email || !email.trim()) {
        return ctx.badRequest("Email address is required.");
      }

      const normalizedEmail = email.trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return ctx.badRequest("Please enter a valid email address.");
      }

      // --------------------------------------------------------
      // GET CURRENT USER
      // --------------------------------------------------------

      const currentUser: any = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: userId,
          },
          populate: {
            role: true,
          },
        });

      if (!currentUser) {
        return ctx.notFound("User account not found.");
      }

      // --------------------------------------------------------
      // CHECK DUPLICATE EMAIL
      // --------------------------------------------------------

      const duplicateUser: any = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            email: normalizedEmail,
          },
        });

      if (duplicateUser && duplicateUser.id !== currentUser.id) {
        return ctx.badRequest("Email address is already in use.");
      }

      // --------------------------------------------------------
      // UPDATE USER
      // --------------------------------------------------------

      await strapi.db
        .query("plugin::users-permissions.user")
        .update({
          where: {
            id: currentUser.id,
          },
          data: {
            email: normalizedEmail,
          },
        });

      // --------------------------------------------------------
      // GET UPDATED USER
      // --------------------------------------------------------

      const updatedUser: any = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: currentUser.id,
          },
          populate: {
            role: true,
          },
        });

      if (!updatedUser) {
        return ctx.notFound("Updated user account could not be found.");
      }

      // Never expose the password hash.
      const {
        password,
        resetPasswordToken,
        confirmationToken,
        ...safeUser
      } = updatedUser;

      return ctx.send({
        message: "Account information updated successfully.",
        data: safeUser,
      });
    } catch (error: any) {
      console.error("UPDATE ACCOUNT SETTINGS ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to update your account settings.",
      );
    }
  },

  /**
   * ============================================================
   * CHANGE MY PASSWORD
   * ============================================================
   */
  async changeMyPassword(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("You must be logged in.");
      }

      const { current_password, new_password } = ctx.request.body as {
        current_password?: string;
        new_password?: string;
      };

      // --------------------------------------------------------
      // VALIDATE INPUT
      // --------------------------------------------------------

      if (!current_password || !new_password) {
        return ctx.badRequest(
          "Current password and new password are required.",
        );
      }

      if (new_password.length < 8) {
        return ctx.badRequest(
          "New password must contain at least 8 characters.",
        );
      }

      // --------------------------------------------------------
      // GET CURRENT USER
      // --------------------------------------------------------

      const currentUser: any = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: userId,
          },
          populate: {
            role: true,
          },
        });

      if (!currentUser) {
        return ctx.notFound("User account not found.");
      }

      // --------------------------------------------------------
      // VERIFY CURRENT PASSWORD
      // --------------------------------------------------------

      const validPassword = await strapi
        .plugin("users-permissions")
        .service("user")
        .validatePassword(
          current_password,
          currentUser.password,
        );

      if (!validPassword) {
        return ctx.badRequest("Current password is incorrect.");
      }

      // --------------------------------------------------------
      // PREVENT REUSING CURRENT PASSWORD
      // --------------------------------------------------------

      const samePassword = await strapi
        .plugin("users-permissions")
        .service("user")
        .validatePassword(
          new_password,
          currentUser.password,
        );

      if (samePassword) {
        return ctx.badRequest(
          "New password must be different from your current password.",
        );
      }

      // --------------------------------------------------------
      // UPDATE PASSWORD
      // --------------------------------------------------------

      await strapi
        .plugin("users-permissions")
        .service("user")
        .edit(userId, {
          username: currentUser.username,
          email: currentUser.email,
          password: new_password,
        });

      return ctx.send({
        message: "Password changed successfully.",
      });
    } catch (error: any) {
      console.error("CHANGE ACCOUNT PASSWORD ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to change your password.",
      );
    }
  },
};