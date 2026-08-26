export default {
  /*
   * =========================================================
   * HELPER — GET LOGGED-IN STUDENT
   * =========================================================
   */
  async getLoggedInStudent(userId: number) {
    if (!userId) {
      return null;
    }

    return await strapi.db.query("api::student.student").findOne({
      where: {
        user: {
          id: userId,
        },
      },
      populate: {
        course: true,
        user: true,
      },
    });
  },

  /*
   * =========================================================
   * HELPER — GET ACTIVE SCHOOL YEAR / SEMESTER
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
   * GET MY TEACHER ASSIGNMENTS
   *
   * GET /student-teacher-assignments/me
   * =========================================================
   */
  async getMyAssignments(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("You must be logged in.");
      }

      /*
       * Find Student profile linked to logged-in user
       */
      const student = await this.getLoggedInStudent(userId);

      if (!student) {
        return ctx.notFound("Student profile not found.");
      }

      /*
       * Find active academic period
       */
      const activeSchoolYear = await this.getActiveSchoolYear();

      if (!activeSchoolYear) {
        return ctx.badRequest(
          "There is currently no active school year and semester.",
        );
      }

      /*
       * Get assignments for current academic period only
       */
      const assignments = await strapi.db
        .query("api::student-teacher-assignment.student-teacher-assignment")
        .findMany({
          where: {
            student: {
              id: student.id,
            },

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

            school_year_record: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        });

      return ctx.send({
        data: assignments,

        student: {
          id: student.id,
          documentId: student.documentId,
          student_id: student.student_id,
          name: student.name,
          year_level: student.year_level,
          section: student.section,
          course: student.course,
        },

        active_period: {
          id: activeSchoolYear.id,
          documentId: activeSchoolYear.documentId,
          school_year: activeSchoolYear.school_year,
          semester: activeSchoolYear.semester,
        },
      });
    } catch (error: any) {
      console.error("GET MY TEACHER ASSIGNMENTS ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to load your teacher assignments.",
      );
    }
  },

  /*
   * =========================================================
   * GET AVAILABLE TEACHERS
   *
   * GET /student-teacher-assignments/available-teachers
   * =========================================================
   */
  async getAvailableTeachers(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("You must be logged in.");
      }

      const student = await this.getLoggedInStudent(userId);

      if (!student) {
        return ctx.notFound("Student profile not found.");
      }

      const activeSchoolYear = await this.getActiveSchoolYear();

      if (!activeSchoolYear) {
        return ctx.badRequest(
          "There is currently no active school year and semester.",
        );
      }

      /*
       * Find current assignments
       */
      const existingAssignments = await strapi.db
        .query("api::student-teacher-assignment.student-teacher-assignment")
        .findMany({
          where: {
            student: {
              id: student.id,
            },

            school_year_record: {
              id: activeSchoolYear.id,
            },

            is_active: true,
          },

          populate: {
            teacher: true,
          },
        });

      const assignedTeacherIds = existingAssignments
        .map((assignment: any) => assignment.teacher?.id)
        .filter(Boolean);

      /*
       * Load faculty directory
       */
      const teachers = await strapi.db.query("api::teacher.teacher").findMany({
        where: assignedTeacherIds.length
          ? {
              id: {
                $notIn: assignedTeacherIds,
              },
            }
          : {},

        populate: {
          department: true,
        },

        orderBy: {
          name: "asc",
        },
      });

      return ctx.send({
        data: teachers,
        active_period: {
          school_year: activeSchoolYear.school_year,
          semester: activeSchoolYear.semester,
        },
      });
    } catch (error: any) {
      console.error("GET AVAILABLE TEACHERS ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to load available teachers.",
      );
    }
  },

  /*
   * =========================================================
   * ADD MY TEACHERS
   *
   * POST /student-teacher-assignments/me
   *
   * Body:
   * {
   *   teacher_ids: [1, 2, 3]
   * }
   * =========================================================
   */
  async addMyTeachers(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("You must be logged in.");
      }

      const { teacher_ids } = ctx.request.body as {
        teacher_ids?: number[];
      };

      if (!teacher_ids || !Array.isArray(teacher_ids) || !teacher_ids.length) {
        return ctx.badRequest("Select at least one teacher.");
      }

      /*
       * Remove duplicate IDs in same request
       */
      const uniqueTeacherIds = [...new Set(teacher_ids.map(Number))].filter(
        (id) => Number.isFinite(id) && id > 0,
      );

      if (!uniqueTeacherIds.length) {
        return ctx.badRequest("No valid teachers were selected.");
      }

      /*
       * Resolve logged-in Student
       */
      const student = await this.getLoggedInStudent(userId);

      if (!student) {
        return ctx.notFound("Student profile not found.");
      }

      /*
       * Resolve active period
       */
      const activeSchoolYear = await this.getActiveSchoolYear();

      if (!activeSchoolYear) {
        return ctx.badRequest(
          "There is currently no active school year and semester.",
        );
      }

      /*
       * Verify selected teachers actually exist
       */
      const teachers = await strapi.db.query("api::teacher.teacher").findMany({
        where: {
          id: {
            $in: uniqueTeacherIds,
          },
        },
      });

      if (teachers.length !== uniqueTeacherIds.length) {
        return ctx.badRequest("One or more selected teachers are invalid.");
      }

      const createdAssignments: any[] = [];
      const skippedTeachers: any[] = [];

      /*
       * Process each selected teacher
       */
      for (const teacher of teachers) {
        /*
         * Check for an existing assignment
         */
        const existing = await strapi.db
          .query("api::student-teacher-assignment.student-teacher-assignment")
          .findOne({
            where: {
              student: {
                id: student.id,
              },

              teacher: {
                id: teacher.id,
              },

              school_year_record: {
                id: activeSchoolYear.id,
              },
            },
          });

        /*
         * Already active → skip duplicate
         */
        if (existing && existing.is_active) {
          skippedTeachers.push({
            id: teacher.id,
            name: teacher.name,
          });

          continue;
        }

        /*
         * Existing but previously deactivated:
         * reactivate instead of creating duplicate
         */
        if (existing && !existing.is_active) {
          const updated = await strapi.entityService.update(
            "api::student-teacher-assignment.student-teacher-assignment",
            existing.id,
            {
              data: {
                is_active: true,
              },
              populate: {
                teacher: true,
                school_year_record: true,
              },
            },
          );

          createdAssignments.push(updated);

          continue;
        }

        /*
         * Create new assignment
         */
        const assignment = await strapi.entityService.create(
          "api::student-teacher-assignment.student-teacher-assignment",
          {
            data: {
              student: student.id,

              teacher: teacher.id,

              school_year_record: activeSchoolYear.id,

              is_active: true,
            },

            populate: {
              teacher: {
                populate: {
                  department: true,
                },
              },

              school_year_record: true,
            },
          },
        );

        createdAssignments.push(assignment);
      }

      return ctx.send({
        message: createdAssignments.length
          ? "Teacher assignments saved successfully."
          : "The selected teachers are already assigned.",

        count: createdAssignments.length,

        skipped: skippedTeachers,

        data: createdAssignments,
      });
    } catch (error: any) {
      console.error("ADD MY TEACHERS ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to save your teacher assignments.",
      );
    }
  },

  /*
   * =========================================================
   * REMOVE MY TEACHER
   *
   * DELETE /student-teacher-assignments/me/:id
   * =========================================================
   */
  async removeMyTeacher(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("You must be logged in.");
      }

      const { id } = ctx.params;

      if (!id) {
        return ctx.badRequest("Assignment ID is required.");
      }

      /*
       * Resolve logged-in Student
       */
      const student = await this.getLoggedInStudent(userId);

      if (!student) {
        return ctx.notFound("Student profile not found.");
      }

      /*
       * Find the assignment AND ensure it belongs
       * to this logged-in Student.
       */
      const assignment = await strapi.db
        .query("api::student-teacher-assignment.student-teacher-assignment")
        .findOne({
          where: {
            id: Number(id),

            student: {
              id: student.id,
            },
          },

          populate: {
            teacher: true,
          },
        });

      if (!assignment) {
        return ctx.notFound("Teacher assignment not found.");
      }

      /*
       * Soft-remove instead of permanently deleting.
       *
       * This lets us preserve the historical record.
       */
      await strapi.entityService.update(
        "api::student-teacher-assignment.student-teacher-assignment",
        assignment.id,
        {
          data: {
            is_active: false,
          },
        },
      );

      return ctx.send({
        message: "Teacher removed successfully.",

        data: {
          id: assignment.id,
          teacher: assignment.teacher?.name || "Teacher",
        },
      });
    } catch (error: any) {
      console.error("REMOVE MY TEACHER ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to remove the teacher assignment.",
      );
    }
  },

  async getMyAssignmentHistory(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("You must be logged in.");
      }

      /*
       * -----------------------------------------------------
       * GET LOGGED-IN STUDENT
       * -----------------------------------------------------
       */

      const student = await this.getLoggedInStudent(userId);

      if (!student) {
        return ctx.notFound("Student profile not found.");
      }

      /*
       * -----------------------------------------------------
       * GET ACTIVE ACADEMIC PERIOD
       * -----------------------------------------------------
       */

      const activeSchoolYear = await this.getActiveSchoolYear();

      /*
       * -----------------------------------------------------
       * GET ALL ASSIGNMENTS
       * -----------------------------------------------------
       *
       * We intentionally include inactive assignments because
       * they are part of the student's history.
       */

      const assignments = await strapi.db
        .query("api::student-teacher-assignment.student-teacher-assignment")
        .findMany({
          where: {
            student: {
              id: student.id,
            },
            is_active: true
          },
          populate: {
            teacher: {
              populate: {
                department: true,
              },
            },
            school_year_record: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      /*
       * -----------------------------------------------------
       * EXCLUDE CURRENT ACTIVE PERIOD
       * -----------------------------------------------------
       */

      const previousAssignments = assignments.filter((assignment: any) => {
        if (!activeSchoolYear) {
          return true;
        }

        return assignment?.school_year_record?.id !== activeSchoolYear.id;
      });

      /*
       * -----------------------------------------------------
       * GROUP BY ACADEMIC PERIOD
       * -----------------------------------------------------
       */

      const periodMap = new Map<string, any>();

      for (const assignment of previousAssignments) {
        const schoolYearRecord = assignment?.school_year_record;

        if (!schoolYearRecord) {
          continue;
        }

        const schoolYear =
          schoolYearRecord?.school_year || "Unknown School Year";

        const semester = schoolYearRecord?.semester || "Unknown Semester";

        const periodKey = String(
          schoolYearRecord?.documentId ||
            schoolYearRecord?.id ||
            `${schoolYear}-${semester}`,
        );

        if (!periodMap.has(periodKey)) {
          periodMap.set(periodKey, {
            id: schoolYearRecord.id,
            documentId: schoolYearRecord.documentId,
            school_year: schoolYear,
            semester,
            assignments: [],
          });
        }

        periodMap.get(periodKey).assignments.push(assignment);
      }

      /*
       * -----------------------------------------------------
       * FORMAT HISTORY
       * -----------------------------------------------------
       */

      const history = Array.from(periodMap.values());

      return ctx.send({
        data: history,
        student: {
          id: student.id,
          documentId: student.documentId,
          student_id: student.student_id,
          name: student.name,
        },
      });
    } catch (error: any) {
      console.error("GET TEACHER ASSIGNMENT HISTORY ERROR:", error);

      return ctx.internalServerError(
        error?.message || "Unable to load teacher assignment history.",
      );
    }
  },
};
