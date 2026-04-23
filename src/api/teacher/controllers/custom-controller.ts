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
        password
      } = ctx.request.body

      if (!employee_no || !name || !roleName || !username || !email || !password) {
        return ctx.badRequest('Missing required fields.')
      }

      const existingTeacher = await strapi.db.query('api::teacher.teacher').findOne({
        where: {
          employee_no
        }
      })

      if (existingTeacher) {
        return ctx.badRequest('Employee number already exists.')
      }

      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          $or: [
            { username },
            { email }
          ]
        }
      })

      if (existingUser) {
        return ctx.badRequest('Username or email already exists.')
      }

      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: {
          name: roleName
        }
      })

      if (!role) {
        return ctx.badRequest(`Role "${roleName}" not found.`)
      }

      const user = await strapi.plugins['users-permissions'].services.user.add({
        username,
        email,
        password,
        confirmed: true,
        blocked: false,
        role: role.id
      })

      const teacher = await strapi.entityService.create('api::teacher.teacher', {
        data: {
          employee_no,
          name,
          department,
          user: user.id
        },
        populate: {
          user: {
            populate: ['role']
          }
        }
      })

      return ctx.send({
        message: 'Teacher account created successfully.',
        data: teacher
      })
    } catch (error) {
      console.error(error)
      return ctx.internalServerError('Something went wrong while registering teacher.')
    }
  },

  // UPDATE TEACHER WITH USER
  async updateTeacherWithUser(ctx) {
    try {
      const { id } = ctx.params
      const {
        employee_no,
        name,
        department,
        email,
        roleName
      } = ctx.request.body

      const teacher = await strapi.entityService.findOne('api::teacher.teacher', id, {
        populate: {
          user: {
            populate: ['role']
          }
        }
      })

      if (!teacher) {
        return ctx.notFound('Teacher not found.')
      }
      // @ts-ignore
      const teacherUser = teacher.user
      if (!teacherUser) {
        return ctx.badRequest('Linked user account not found.')
      }

      if (employee_no) {
        const duplicateTeacher = await strapi.db.query('api::teacher.teacher').findOne({
          where: {
            employee_no
          }
        })

        if (duplicateTeacher && duplicateTeacher.id !== teacher.id) {
          return ctx.badRequest('Employee number already exists.')
        }
      }

      if (email) {
        const duplicateUser = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: {
            email
          }
        })

        if (duplicateUser && duplicateUser.id !== teacherUser.id) {
          return ctx.badRequest('Email already exists.')
        }
      }

      await strapi.entityService.update('api::teacher.teacher', id, {
        data: {
          employee_no,
          name,
          department
        }
      })

      const userUpdateData: any = {}
      if (email) userUpdateData.email = email

      if (roleName) {
        const role = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: {
            name: roleName
          }
        })

        if (!role) {
          return ctx.badRequest(`Role "${roleName}" not found.`)
        }

        userUpdateData.role = role.id
      }

      if (Object.keys(userUpdateData).length > 0) {
        await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: teacherUser.id },
          data: userUpdateData
        })
      }

      const updatedTeacher = await strapi.entityService.findOne('api::teacher.teacher', id, {
        populate: {
          user: {
            populate: ['role']
          }
        }
      })

      return ctx.send({
        message: 'Teacher updated successfully.',
        data: updatedTeacher
      })
    } catch (error) {
      console.error(error)
      return ctx.internalServerError('Something went wrong while updating teacher.')
    }
  },

  // DELETE TEACHER WITH USER
  async deleteTeacherWithUser(ctx) {
    try {
      const { id } = ctx.params

      const teacher = await strapi.entityService.findOne('api::teacher.teacher', id, {
        populate: {
          user: true
        }
      })

      if (!teacher) {
        return ctx.notFound('Teacher not found.')
      }

      // @ts-ignore
      const teacherUser = teacher.user

      await strapi.entityService.delete('api::teacher.teacher', id)

      if (teacherUser?.id) {
        await strapi.db.query('plugin::users-permissions.user').delete({
          where: { id: teacherUser.id }
        })
      }

      return ctx.send({
        message: 'Teacher and linked user deleted successfully.'
      })
    } catch (error) {
      console.error(error)
      return ctx.internalServerError('Something went wrong while deleting teacher.')
    }
  }
}