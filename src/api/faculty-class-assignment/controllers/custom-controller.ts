export default {
  /*
   * =========================================================
   * HELPER — GET ACTIVE SCHOOL YEAR
   * =========================================================
   */
  async getActiveSchoolYear() {
    return await strapi.db.query("api::school-year.school-year").findOne({
      where: {
        active_sy: true,
      },
    });
  },

  /*
   * =========================================================
   * GET CURRENT CLASS ASSIGNMENTS
   *
   * GET /faculty-class-assignments/class
   *
   * Query:
   * ?course=1&year_level=1st Year&section=1A
   * =========================================================
   */
  async getClassAssignments(ctx) {
    try {
      const { course, year_level, section } = ctx.query;

      if (!course || !year_level || !section) {
        return ctx.badRequest("Course, year level, and section are required.");
      }

      const activeSchoolYear = await this.getActiveSchoolYear();

      if (!activeSchoolYear) {
        return ctx.badRequest("There is currently no active academic period.");
      }

      const assignments = await strapi.db
        .query("api::faculty-class-assignment.faculty-class-assignment")
        .findMany({
          where: {
            course: {
              id: Number(course),
            },

            year_level: String(year_level),

            section: String(section),

            school_year_record: {
              id: activeSchoolYear.id,
            },

            is_active: true,
          },

          populate: {
            teacher: {
              populate: {
                department: true,
              },
            },

            course: true,

            school_year_record: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        });

      return ctx.send({
        data: assignments,

        active_period: {
          id: activeSchoolYear.id,

          documentId: activeSchoolYear.documentId,

          school_year: activeSchoolYear.school_year,

          semester: activeSchoolYear.semester,
        },
      });
    } catch (error: any) {
      console.error("GET CLASS ASSIGNMENTS ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to load class faculty assignments.",
      );
    }
  },

  /*
   * =========================================================
   * SAVE CLASS ASSIGNMENTS
   *
   * POST /faculty-class-assignments/class
   *
   * Body:
   * {
   *   course: 1,
   *   year_level: "1st Year",
   *   section: "1A",
   *   teacher_ids: [2, 4, 7]
   * }
   * =========================================================
   */
  async saveClassAssignments(ctx) {
    try {
      const { course, year_level, section, teacher_ids } = ctx.request.body as {
        course?: number;
        year_level?: string;
        section?: string;
        teacher_ids?: number[];
      };

      if (!course || !year_level || !section || !Array.isArray(teacher_ids)) {
        return ctx.badRequest(
          "Course, year level, section, and teacher IDs are required.",
        );
      }

      const activeSchoolYear = await this.getActiveSchoolYear();

      if (!activeSchoolYear) {
        return ctx.badRequest("There is currently no active academic period.");
      }

      /*
       * -----------------------------------------------------
       * VERIFY COURSE
       * -----------------------------------------------------
       */

      const selectedCourse = await strapi.entityService.findOne(
        "api::course.course",
        Number(course),
      );

      if (!selectedCourse) {
        return ctx.badRequest("Selected course is invalid.");
      }

      /*
       * -----------------------------------------------------
       * NORMALIZE TEACHER IDS
       * -----------------------------------------------------
       */

      const uniqueTeacherIds = [
        ...new Set(
          teacher_ids.map(Number).filter((id) => Number.isFinite(id) && id > 0),
        ),
      ];

      /*
       * -----------------------------------------------------
       * VERIFY TEACHERS
       * -----------------------------------------------------
       */

      const teachers = uniqueTeacherIds.length
        ? await strapi.db.query("api::teacher.teacher").findMany({
            where: {
              id: {
                $in: uniqueTeacherIds,
              },
            },
          })
        : [];

      if (teachers.length !== uniqueTeacherIds.length) {
        return ctx.badRequest("One or more selected teachers are invalid.");
      }

      /*
       * -----------------------------------------------------
       * LOAD EXISTING ASSIGNMENTS FOR CLASS
       * -----------------------------------------------------
       */

      const existingAssignments = await strapi.db
        .query("api::faculty-class-assignment.faculty-class-assignment")
        .findMany({
          where: {
            course: {
              id: Number(course),
            },

            year_level: String(year_level),

            section: String(section),

            school_year_record: {
              id: activeSchoolYear.id,
            },
          },

          populate: {
            teacher: true,
          },
        });

      /*
       * -----------------------------------------------------
       * SOFT-DISABLE REMOVED TEACHERS
       * -----------------------------------------------------
       */

      for (const assignment of existingAssignments) {
        const teacherId = assignment?.teacher?.id;

        if (!teacherId) {
          continue;
        }

        const shouldRemainActive = uniqueTeacherIds.includes(teacherId);

        if (assignment.is_active !== shouldRemainActive) {
          await strapi.entityService.update(
            "api::faculty-class-assignment.faculty-class-assignment",
            assignment.id,
            {
              data: {
                is_active: shouldRemainActive,
              },
            },
          );
        }
      }

      /*
       * -----------------------------------------------------
       * CREATE / REACTIVATE SELECTED TEACHERS
       * -----------------------------------------------------
       */

      for (const teacherId of uniqueTeacherIds) {
        const existing = existingAssignments.find(
          (assignment: any) => assignment?.teacher?.id === teacherId,
        );

        if (existing) {
          if (!existing.is_active) {
            await strapi.entityService.update(
              "api::faculty-class-assignment.faculty-class-assignment",
              existing.id,
              {
                data: {
                  is_active: true,
                },
              },
            );
          }

          continue;
        }

        await strapi.entityService.create(
          "api::faculty-class-assignment.faculty-class-assignment",
          {
            data: {
              teacher: teacherId,

              course: Number(course),

              year_level: String(year_level),

              section: String(section),

              school_year_record: activeSchoolYear.id,

              is_active: true,
            },
          },
        );
      }

      /*
       * -----------------------------------------------------
       * RETURN UPDATED ACTIVE LIST
       * -----------------------------------------------------
       */

      const updatedAssignments = await strapi.db
        .query("api::faculty-class-assignment.faculty-class-assignment")
        .findMany({
          where: {
            course: {
              id: Number(course),
            },

            year_level: String(year_level),

            section: String(section),

            school_year_record: {
              id: activeSchoolYear.id,
            },

            is_active: true,
          },

          populate: {
            teacher: {
              populate: {
                department: true,
              },
            },

            course: true,

            school_year_record: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        });

      return ctx.send({
        message: "Class faculty assignments saved successfully.",

        count: updatedAssignments.length,

        data: updatedAssignments,
      });
    } catch (error: any) {
      console.error("SAVE CLASS ASSIGNMENTS ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to save class faculty assignments.",
      );
    }
  },
};
