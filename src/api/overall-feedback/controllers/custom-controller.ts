'use strict'
const getValue = (val) => {
  if (!val) return null
  if (typeof val === 'object') return val.value || val.id || null
  return val
}

export default {
    async checkMySubmission(ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.unauthorized('You must be logged in.')
    }

    const semester = getValue(ctx.query.semester)
    const schoolYear = getValue(ctx.query.school_year)

    if (!semester || !schoolYear) {
      return ctx.badRequest('Semester and school year are required.')
    }

    const studentRecord = await strapi.db.query('api::student.student').findOne({
      where: {
        user: user.id
      }
    })

    if (!studentRecord) {
      return ctx.badRequest('Student profile not found.')
    }

    const existing = await strapi.db.query('api::overall-feedback.overall-feedback').findOne({
      where: {
        evaluator_user: user.id,
        student: studentRecord.id,
        semester,
        school_year: schoolYear
      }
    })

    return {
      submitted: !!existing,
      feedbackId: existing?.id || null
    }
  },

   async create(ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.unauthorized('You must be logged in.')
    }

    const data = ctx.request.body?.data || {}

    const semester = getValue(data.semester)
    const schoolYear = getValue(data.school_year)
    const date = getValue(data.date)
    const responses = data.responses || []

    if (!semester || !schoolYear) {
      return ctx.badRequest('Semester and school year are required.')
    }

    if (!Array.isArray(responses) || responses.length === 0) {
      return ctx.badRequest('Responses are required.')
    }

    const studentRecord = await strapi.db.query('api::student.student').findOne({
      where: {
        user: user.id
      },
      populate: {
        course: true
      }
    })

    if (!studentRecord) {
      return ctx.badRequest('Student profile not found.')
    }

    const existing = await strapi.db.query('api::overall-feedback.overall-feedback').findOne({
      where: {
        evaluator_user: user.id,
        student: studentRecord.id,
        semester,
        school_year: schoolYear
      }
    })

    if (existing) {
      return ctx.badRequest('You already submitted overall feedback for this semester and school year.')
    }

    return await strapi.entityService.create('api::overall-feedback.overall-feedback', {
      data: {
        semester,
        school_year: schoolYear,
        date,
        student: studentRecord.id,
        course: studentRecord.course?.id || null,
        subject: null,
        evaluator_user: user.id,
        responses
      }
    })
  }
};
