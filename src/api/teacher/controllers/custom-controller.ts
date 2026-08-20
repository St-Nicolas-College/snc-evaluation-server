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

  // UPDATE TEACHER WITH USER
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

      const teacher = await strapi.entityService.findOne(
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

      // @ts-ignore
      const teacherUser = teacher.user;
      if (!teacherUser) {
        return ctx.badRequest("Linked user account not found.");
      }

      if (employee_no) {
        const duplicateTeacher = await strapi.db
          .query("api::teacher.teacher")
          .findOne({
            where: { employee_no },
          });

        if (duplicateTeacher && duplicateTeacher.id !== teacher.id) {
          return ctx.badRequest("Employee number already exists.");
        }
      }

      if (email) {
        const duplicateUser = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { email },
          });

        if (duplicateUser && duplicateUser.id !== teacherUser.id) {
          return ctx.badRequest("Email already exists.");
        }
      }

      const updateData: any = {};

      if (employee_no !== undefined) updateData.employee_no = employee_no;
      if (name !== undefined) updateData.name = name;
      if (department !== undefined) updateData.department = department;

      if (assigned_subjects !== undefined) {
        updateData.assigned_subjects = {
          set: assigned_subjects,
        };
      }

      await strapi.entityService.update("api::teacher.teacher", id, {
        data: updateData,
      });

      const userUpdateData: any = {};
      if (email) userUpdateData.email = email;

      if (roleName) {
        const role = await strapi.db
          .query("plugin::users-permissions.role")
          .findOne({
            where: { name: roleName },
          });

        if (!role) {
          return ctx.badRequest(`Role "${roleName}" not found.`);
        }

        userUpdateData.role = role.id;
      }

      if (Object.keys(userUpdateData).length > 0) {
        await strapi.db.query("plugin::users-permissions.user").update({
          where: { id: teacherUser.id },
          data: userUpdateData,
        });
      }

      const updatedTeacher = await strapi.entityService.findOne(
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

      return ctx.send({
        message: "Teacher updated successfully.",
        data: updatedTeacher,
      });
    } catch (error) {
      console.error(error);
      return ctx.internalServerError(
        "Something went wrong while updating teacher.",
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
};
