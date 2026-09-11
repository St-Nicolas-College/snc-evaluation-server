export default {
  async registerStudent(ctx) {
    let createdUserId: number | null = null;

    try {
      const { student_id, name, course, year_level, section, email, password } =
        ctx.request.body;

      /*
       * -----------------------------------------------------
       * NORMALIZE INPUT
       * -----------------------------------------------------
       */

      const normalizedStudentId = String(student_id || "").trim();
      const normalizedName = String(name || "").trim();
      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();
      const normalizedYearLevel = String(year_level || "").trim();
      const normalizedSection = String(section || "").trim();

      /*
       * Student ID will always be the login username.
       * Do not accept a user-defined username from the browser.
       */
      const username = normalizedStudentId;

      /*
       * -----------------------------------------------------
       * REQUIRED FIELD VALIDATION
       * -----------------------------------------------------
       */

      if (
        !normalizedStudentId ||
        !normalizedName ||
        !course ||
        !normalizedYearLevel ||
        !normalizedSection ||
        !normalizedEmail ||
        !password
      ) {
        return ctx.badRequest("Complete all required registration fields.");
      }

      /*
       * -----------------------------------------------------
       * BASIC EMAIL VALIDATION
       * -----------------------------------------------------
       */

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(normalizedEmail)) {
        return ctx.badRequest("Enter a valid email address.");
      }

      /*
       * -----------------------------------------------------
       * PASSWORD VALIDATION
       * -----------------------------------------------------
       */

      if (String(password).length < 6) {
        return ctx.badRequest("Password must contain at least 6 characters.");
      }

      /*
       * -----------------------------------------------------
       * CHECK STUDENT ID
       * -----------------------------------------------------
       */

      const existingStudent = await strapi.db
        .query("api::student.student")
        .findOne({
          where: {
            student_id: normalizedStudentId,
          },
        });

      if (existingStudent) {
        return ctx.badRequest("Student ID is already registered.");
      }

      /*
       * -----------------------------------------------------
       * CHECK USERNAME / EMAIL
       * -----------------------------------------------------
       */

      const existingUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            $or: [
              {
                username,
              },
              {
                email: normalizedEmail,
              },
            ],
          },
        });

      if (existingUser) {
        if (existingUser.username === username) {
          return ctx.badRequest(
            "Student ID is already being used as an account username.",
          );
        }

        return ctx.badRequest("Email address is already registered.");
      }

      /*
       * -----------------------------------------------------
       * VERIFY COURSE
       * -----------------------------------------------------
       */

      const selectedCourse = await strapi.entityService.findOne(
        "api::course.course",
        course,
      );

      if (!selectedCourse) {
        return ctx.badRequest("Selected course is invalid.");
      }

      /*
       * -----------------------------------------------------
       * GET STUDENT ROLE
       * -----------------------------------------------------
       */

      const role = await strapi.db
        .query("plugin::users-permissions.role")
        .findOne({
          where: {
            name: "Student",
          },
        });

      if (!role) {
        return ctx.internalServerError("Student role is not configured.");
      }

      /*
       * -----------------------------------------------------
       * CREATE USERS & PERMISSIONS ACCOUNT
       * -----------------------------------------------------
       */

      const user = await strapi.plugins["users-permissions"].services.user.add({
        username,
        email: normalizedEmail,
        password,
        confirmed: true,
        blocked: false,
        role: role.id,
      });

      createdUserId = user.id;

      /*
       * -----------------------------------------------------
       * CREATE STUDENT PROFILE
       * -----------------------------------------------------
       */

      const student = await strapi.documents("api::student.student").create({
        data: {
          student_id: normalizedStudentId,
          name: normalizedName,
          email: normalizedEmail,
          course,
          year_level: normalizedYearLevel,
          section: normalizedSection,
          user: user.id,
        },
        populate: {
          user: true,
          course: true,
        },
      });

      /*
       * -----------------------------------------------------
       * SUCCESS
       * -----------------------------------------------------
       */

      return ctx.send({
        message: "Student account created successfully.",

        data: {
          id: student.id,
          documentId: student.documentId,
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          year_level: student.year_level,
          section: student.section,
          course: student.course,
          username: user.username,
        },
      });
    } catch (error: any) {
      console.error("REGISTER STUDENT ERROR:", error);

      /*
       * -----------------------------------------------------
       * CLEAN UP ORPHAN USER
       * -----------------------------------------------------
       *
       * If the Users & Permissions account was created but
       * Student profile creation failed, remove the user so
       * we don't leave an orphan login account.
       */

      if (createdUserId) {
        try {
          await strapi.db.query("plugin::users-permissions.user").delete({
            where: {
              id: createdUserId,
            },
          });
        } catch (cleanupError) {
          console.error("REGISTER STUDENT CLEANUP ERROR:", cleanupError);
        }
      }

      return ctx.internalServerError(
        error?.message || "Something went wrong while registering the student.",
      );
    }
  },

  // ✅ UPDATE
  async updateStudentWithUser(ctx) {
    try {
      const { id } = ctx.params;
      const {
        student_id,
        name,
        course,
        year_level,
        section,
        email,
        assigned_teachers,
      } = ctx.request.body;

      const student = await strapi.entityService.findOne(
        "api::student.student",
        id,
        {
          populate: { user: true },
        },
      );

      if (!student) {
        return ctx.notFound("Student not found.");
      }

      //@ts-ignore
      const user = student.user;
      if (!user || !user.id) {
        return ctx.badRequest("User not linked.");
      }

      if (student_id) {
        const duplicate = await strapi.db
          .query("api::student.student")
          .findOne({
            where: { student_id },
          });

        if (duplicate && duplicate.id !== student.id) {
          return ctx.badRequest("Student ID already exists.");
        }
      }

      if (email) {
        const duplicateUser = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { email },
          });

        if (duplicateUser && duplicateUser.id !== user.id) {
          return ctx.badRequest("Email already exists.");
        }
      }

      const updateData: any = {};

      if (student_id !== undefined) updateData.student_id = student_id;
      if (name !== undefined) updateData.name = name;
      if (course !== undefined) updateData.course = course;
      if (year_level !== undefined) updateData.year_level = year_level;
      if (section !== undefined) updateData.section = section;
      if (email !== undefined) updateData.email = email;
      if (assigned_teachers !== undefined) {
        updateData.assigned_teachers = {
          set: assigned_teachers,
        };
      }

      await strapi.entityService.update("api::student.student", id, {
        data: updateData,
      });

      if (email && email.trim() !== "") {
        await strapi.db.query("plugin::users-permissions.user").update({
          where: { id: user.id },
          data: { email },
        });
      }

      const updated = await strapi.entityService.findOne(
        "api::student.student",
        id,
        {
          populate: {
            user: {
              populate: ["role"],
            },
          },
        },
      );

      return ctx.send({
        message: "Student updated successfully.",
        data: updated,
      });
    } catch (error) {
      console.error("UPDATE STUDENT ERROR:", error);
      return ctx.internalServerError(
        error.message || "Error updating student.",
      );
    }
  },

  // ✅ DELETE
  async deleteStudentWithUser(ctx) {
    try {
      const { id } = ctx.params;

      const student = await strapi.entityService.findOne(
        "api::student.student",
        id,
        {
          populate: { user: true },
        },
      );

      if (!student) {
        return ctx.notFound("Student not found.");
      }
      //@ts-ignore
      const user = student.user;

      await strapi.entityService.delete("api::student.student", id);

      console.log("User id: ", user?.id);

      if (user?.id) {
        await strapi.db.query("plugin::users-permissions.user").delete({
          where: { id: user.id },
        });
      }

      return ctx.send({
        message: "Student and user deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return ctx.internalServerError("Error deleting student.");
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
          "New password must contain at least 6 characters.",
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
       * PREVENT SAME PASSWORD
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
       *
       * Use the Users & Permissions service so the new password
       * is properly hashed before being stored.
       */

      await strapi.plugin("users-permissions").service("user").edit(userId, {
        password: new_password,
      });

      return ctx.send({
        message: "Password changed successfully.",
      });
    } catch (error: any) {
      console.error("CHANGE STUDENT PASSWORD ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to change your password.",
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
       * Get Student linked to logged-in user
       */
      const student = await strapi.db.query("api::student.student").findOne({
        where: {
          user: {
            id: userId,
          },
        },

        populate: {
          user: true,
          course: true,
        },
      });

      if (!student) {
        return ctx.notFound("Student profile not found.");
      }

      const linkedUser: any = student.user;

      if (!linkedUser?.id) {
        return ctx.badRequest("Linked user account not found.");
      }

      /*
       * Check whether email is already used
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
       * Update Student record
       */
      await strapi.entityService.update("api::student.student", student.id, {
        data: {
          email: normalizedEmail,
        },
      });

      /*
       * Update Users & Permissions account
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
       * Return refreshed profile
       */
      const updatedStudent = await strapi.entityService.findOne(
        "api::student.student",
        student.id,
        {
          populate: {
            user: true,
            course: true,
          },
        },
      );

      return ctx.send({
        message: "Account information updated successfully.",

        data: updatedStudent,
      });
    } catch (error: any) {
      console.error("UPDATE STUDENT SETTINGS ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to update your account settings.",
      );
    }
  },
};
