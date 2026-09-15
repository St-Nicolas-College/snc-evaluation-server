export default {
  // REGISTER TEACHER
  async registerTeacher(ctx) {
    try {
      const {
        employee_no,
        name,
        department,
        roleName,
        username,
        email,
        password,
      } = ctx.request.body;

      if (
        !employee_no ||
        !name ||
        !roleName ||
        !username ||
        !email ||
        !password
      ) {
        return ctx.badRequest("Missing required fields.");
      }

      if (password.length < 8) {
        return ctx.badRequest("Password must contain at least 8 characters.");
      }

      const existingTeacher = await strapi.db
        .query("api::teacher.teacher")
        .findOne({
          where: {
            employee_no,
          },
        });

      if (existingTeacher) {
        return ctx.badRequest("Employee number already exists.");
      }

      const existingUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            $or: [{ username }, { email }],
          },
        });

      if (existingUser) {
        return ctx.badRequest("Username or email already exists.");
      }

      const role = await strapi.db
        .query("plugin::users-permissions.role")
        .findOne({
          where: {
            name: roleName,
          },
        });

      if (!role) {
        return ctx.badRequest(`Role "${roleName}" not found.`);
      }

      const user = await strapi.plugins["users-permissions"].services.user.add({
        username,
        email,
        password,
        confirmed: true,
        blocked: false,
        role: role.id,
      });

      const teacher = await strapi.entityService.create(
        "api::teacher.teacher",
        {
          data: {
            employee_no,
            name,
            department,
            user: user.id,
          },
          populate: {
            user: {
              populate: ["role"],
            },
          },
        },
      );

      return ctx.send({
        message: "Teacher account created successfully.",
        data: teacher,
      });
    } catch (error) {
      console.error(error);
      return ctx.internalServerError(
        "Something went wrong while registering teacher.",
      );
    }
  },

  // UPDATE TEACHER WITH LINKED USER
  async updateTeacherWithUser(ctx) {
    try {
      const { id } = ctx.params;

      const {
        employee_no,
        name,
        department,
        email,
        roleName,
        assigned_subjects,
      } = ctx.request.body;

      if (!id) {
        return ctx.badRequest("Teacher ID is required.");
      }

      /*
       * -----------------------------------------------------
       * 1. FIND TEACHER + LINKED USER
       * -----------------------------------------------------
       */

      const teacher: any = await strapi.entityService.findOne(
        "api::teacher.teacher",
        id,
        {
          populate: {
            user: {
              populate: ["role"],
            },
            assigned_subjects: true,
          },
        },
      );

      if (!teacher) {
        return ctx.notFound("Teacher not found.");
      }

      const teacherUser: any = teacher.user;

      if (!teacherUser?.id) {
        return ctx.badRequest("Linked user account not found.");
      }

      /*
       * -----------------------------------------------------
       * 2. VALIDATE EMPLOYEE NUMBER
       * -----------------------------------------------------
       */

      if (employee_no !== undefined) {
        const normalizedEmployeeNo = String(employee_no).trim();

        if (!normalizedEmployeeNo) {
          return ctx.badRequest("Employee number is required.");
        }

        const duplicateTeacher = await strapi.db
          .query("api::teacher.teacher")
          .findOne({
            where: {
              employee_no: normalizedEmployeeNo,
            },
          });

        if (duplicateTeacher && duplicateTeacher.id !== teacher.id) {
          return ctx.badRequest("Employee number already exists.");
        }

        /*
         * Employee No. is also the username.
         * Check whether another user already owns it.
         */
        const duplicateUsername = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: {
              username: normalizedEmployeeNo,
            },
          });

        if (duplicateUsername && duplicateUsername.id !== teacherUser.id) {
          return ctx.badRequest(
            "Employee number is already used as another account username.",
          );
        }
      }

      /*
       * -----------------------------------------------------
       * 3. VALIDATE EMAIL
       * -----------------------------------------------------
       */

      if (email !== undefined) {
        const normalizedEmail = String(email).trim().toLowerCase();

        if (!normalizedEmail) {
          return ctx.badRequest("Email is required.");
        }

        const duplicateEmail = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: {
              email: normalizedEmail,
            },
          });

        if (duplicateEmail && duplicateEmail.id !== teacherUser.id) {
          return ctx.badRequest("Email already exists.");
        }
      }

      /*
       * -----------------------------------------------------
       * 4. VALIDATE ROLE
       * -----------------------------------------------------
       */

      let role: any = null;

      if (roleName !== undefined) {
        role = await strapi.db.query("plugin::users-permissions.role").findOne({
          where: {
            name: roleName,
          },
        });

        if (!role) {
          return ctx.badRequest(`Role "${roleName}" not found.`);
        }
      }

      /*
       * -----------------------------------------------------
       * 5. PREPARE TEACHER UPDATE
       * -----------------------------------------------------
       */

      const teacherUpdateData: any = {};

      if (employee_no !== undefined) {
        teacherUpdateData.employee_no = String(employee_no).trim();
      }

      if (name !== undefined) {
        teacherUpdateData.name = String(name).trim();
      }

      if (department !== undefined) {
        teacherUpdateData.department = department;
      }

      if (assigned_subjects !== undefined) {
        teacherUpdateData.assigned_subjects = {
          set: assigned_subjects,
        };
      }

      /*
       * -----------------------------------------------------
       * 6. PREPARE LINKED USER UPDATE
       * -----------------------------------------------------
       */

      const userUpdateData: any = {};

      /*
       * Keep:
       *
       * Teacher.employee_no
       *       =
       * User.username
       */
      if (employee_no !== undefined) {
        userUpdateData.username = String(employee_no).trim();
      }

      if (email !== undefined) {
        userUpdateData.email = String(email).trim().toLowerCase();
      }

      if (role) {
        userUpdateData.role = role.id;
      }

      /*
       * -----------------------------------------------------
       * 7. UPDATE TEACHER
       * -----------------------------------------------------
       */

      if (Object.keys(teacherUpdateData).length > 0) {
        await strapi.entityService.update("api::teacher.teacher", id, {
          data: teacherUpdateData,
        });
      }

      /*
       * -----------------------------------------------------
       * 8. UPDATE LINKED USER
       * -----------------------------------------------------
       */

      if (Object.keys(userUpdateData).length > 0) {
        await strapi.db.query("plugin::users-permissions.user").update({
          where: {
            id: teacherUser.id,
          },
          data: userUpdateData,
        });
      }

      /*
       * -----------------------------------------------------
       * 9. RETURN UPDATED TEACHER
       * -----------------------------------------------------
       */

      const updatedTeacher = await strapi.entityService.findOne(
        "api::teacher.teacher",
        id,
        {
          populate: {
            user: {
              populate: ["role"],
            },
            department: true,
            assigned_subjects: true,
          },
        },
      );

      return ctx.send({
        message: "Teacher and linked user account updated successfully.",
        data: updatedTeacher,
      });
    } catch (error: any) {
      console.error("UPDATE TEACHER WITH USER ERROR:", error);

      return ctx.internalServerError(
        error?.message ||
          "Something went wrong while updating the teacher account.",
      );
    }
  },

  // DELETE TEACHER WITH USER
  // DELETE TEACHER WITH LINKED USER ACCOUNT
  async deleteTeacherWithUser(ctx) {
    try {
      const { id } = ctx.params;

      if (!id) {
        return ctx.badRequest("Teacher ID is required.");
      }

      /*
       * -----------------------------------------------------
       * 1. FIND TEACHER
       * -----------------------------------------------------
       */

      const teacher: any = await strapi.entityService.findOne(
        "api::teacher.teacher",
        id,
        {
          populate: {
            user: true,
          },
        },
      );

      if (!teacher) {
        return ctx.notFound("Teacher not found.");
      }

      /*
       * -----------------------------------------------------
       * 2. FIND LINKED USER
       * -----------------------------------------------------
       *
       * teacher.user is the inverse side because your schema
       * uses mappedBy: "teacher".
       *
       * First try the populated relation.
       * If it is missing, look for the User whose teacher
       * relation points to this teacher.
       */

      let linkedUser: any = teacher.user || null;

      if (!linkedUser?.id) {
        linkedUser = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: {
              teacher: {
                id: teacher.id,
              },
            },
          });
      }

      const linkedUserId = linkedUser?.id || null;

      console.log("DELETE TEACHER:", {
        teacherId: teacher.id,
        teacherName: teacher.name,
        linkedUserId,
        linkedUsername: linkedUser?.username,
        linkedEmail: linkedUser?.email,
      });

      /*
       * -----------------------------------------------------
       * 3. DELETE TEACHER RECORD
       * -----------------------------------------------------
       */

      await strapi.entityService.delete("api::teacher.teacher", teacher.id);

      /*
       * -----------------------------------------------------
       * 4. DELETE LINKED USER ACCOUNT
       * -----------------------------------------------------
       */

      if (linkedUserId) {
        await strapi.db.query("plugin::users-permissions.user").delete({
          where: {
            id: linkedUserId,
          },
        });
      }

      /*
       * -----------------------------------------------------
       * 5. RESPONSE
       * -----------------------------------------------------
       */

      return ctx.send({
        message: linkedUserId
          ? "Teacher and linked user account deleted successfully."
          : "Teacher deleted successfully. No linked user account was found.",
        data: {
          teacherId: teacher.id,
          userId: linkedUserId,
        },
      });
    } catch (error: any) {
      console.error("DELETE TEACHER WITH USER ERROR:", error);

      return ctx.internalServerError(
        error?.message ||
          "Something went wrong while deleting the teacher account.",
      );
    }
  },

  async updateMySettings(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("You must be logged in.");
      }

      const { email } = ctx.request.body as {
        email?: string;
      };

      if (!email || !email.trim()) {
        return ctx.badRequest("Email address is required.");
      }

      const normalizedEmail = email.trim().toLowerCase();

      /*
       * =====================================================
       * GET TEACHER LINKED TO LOGGED-IN USER
       * =====================================================
       */

      const teacher = await strapi.db.query("api::teacher.teacher").findOne({
        where: {
          user: {
            id: userId,
          },
        },

        populate: {
          user: true,
          department: true,
        },
      });

      if (!teacher) {
        return ctx.notFound("Teacher profile not found.");
      }

      const linkedUser: any = teacher.user;

      if (!linkedUser?.id) {
        return ctx.badRequest("Linked user account not found.");
      }

      /*
       * =====================================================
       * CHECK WHETHER EMAIL IS ALREADY USED
       * =====================================================
       */

      const duplicateUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            email: normalizedEmail,
          },
        });

      if (duplicateUser && duplicateUser.id !== linkedUser.id) {
        return ctx.badRequest("Email address is already in use.");
      }

      
      /*
       * =====================================================
       * UPDATE USERS & PERMISSIONS ACCOUNT
       * =====================================================
       */

      await strapi.db.query("plugin::users-permissions.user").update({
        where: {
          id: linkedUser.id,
        },

        data: {
          email: normalizedEmail,
        },
      });

      /*
       * =====================================================
       * RETURN REFRESHED TEACHER PROFILE
       * =====================================================
       */

      const updatedTeacher = await strapi
        .documents("api::teacher.teacher")
        .findOne({
          documentId: teacher.documentId,

          populate: {
            user: true,
            department: true,
          },
        });

      return ctx.send({
        message: "Account information updated successfully.",

        data: updatedTeacher,
      });
    } catch (error: any) {
      console.error("UPDATE TEACHER SETTINGS ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to update your account settings.",
      );
    }
  },

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

      /*
       * =====================================================
       * GET CURRENT USER
       * =====================================================
       */

      const currentUser = await strapi.db
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

      /*
       * =====================================================
       * VERIFY CURRENT PASSWORD
       * =====================================================
       */

      const validPassword = await strapi
        .plugin("users-permissions")
        .service("user")
        .validatePassword(current_password, currentUser.password);

      if (!validPassword) {
        return ctx.badRequest("Current password is incorrect.");
      }

      /*
       * =====================================================
       * PREVENT REUSING CURRENT PASSWORD
       * =====================================================
       */

      const samePassword = await strapi
        .plugin("users-permissions")
        .service("user")
        .validatePassword(new_password, currentUser.password);

      if (samePassword) {
        return ctx.badRequest(
          "New password must be different from your current password.",
        );
      }

      /*
       * =====================================================
       * UPDATE PASSWORD
       * =====================================================
       */

      await strapi.plugin("users-permissions").service("user").edit(userId, {
        password: new_password,
      });

      return ctx.send({
        message: "Password changed successfully.",
      });
    } catch (error: any) {
      console.error("CHANGE TEACHER PASSWORD ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to change your password.",
      );
    }
  },
};
