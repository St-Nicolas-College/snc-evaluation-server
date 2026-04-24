export default {
  async registerStudent(ctx) {
    try {
      const {
        student_id,
        name,
        course,
        year_level,
        section,
        username,
        email,
        password,
      } = ctx.request.body;

      if (!student_id || !name || !username || !email || !password) {
        return ctx.badRequest("Missing required fields.");
      }

      const existingStudent = await strapi.db
        .query("api::student.student")
        .findOne({
          where: { student_id },
        });

      if (existingStudent) {
        return ctx.badRequest("Student ID already exists.");
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
          where: { name: "Student" },
        });

      if (!role) {
        return ctx.badRequest("Student role not found.");
      }

      const user = await strapi.plugins["users-permissions"].services.user.add({
        username,
        email,
        password,
        confirmed: true,
        blocked: false,
        role: role.id,
      });

      //   const student = await strapi.entityService.create('api::student.student', {
      //     data: {
      //       student_id,
      //       name,
      //       course,
      //       year_level,
      //       section,
      //       user: user.id
      //     },
      //     populate: {
      //       user: true
      //     }
      //   })
      const student = await strapi.documents("api::student.student").create({
        data: {
          student_id,
          name,
          email,
          course,
          year_level,
          section,
          user: user.id,
        },
        populate: ["user"],
      });

      return ctx.send({
        message: "Student account created successfully.",
        data: student,
      });
    } catch (error) {
      console.error(error);
      return ctx.internalServerError(
        "Something went wrong while registering student.",
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
};
