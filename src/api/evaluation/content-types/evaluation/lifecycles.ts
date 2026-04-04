export default {
    async beforeCreate(event) {
        const { data } = event.params
        const teacherId = data.teacher?.connect?.[0]
        const studentId = data.studentId
        
        if (!teacherId || !studentId) return

        // Check if already exist
        const existing = await strapi.entityService.findMany('api::evaluation.evaluation', {
            filters: {
                teacher: teacherId,
                student: studentId
            }
        })

        if (existing.length > 0) {
            throw new Error('You already evaluated this teacher.')
        }
    }
}