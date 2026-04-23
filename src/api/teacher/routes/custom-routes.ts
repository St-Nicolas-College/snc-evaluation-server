export default {
  routes: [
    {
      method: 'POST',
      path: '/teachers/register',
      handler: 'custom-controller.registerTeacher',
      config: {
        auth: false
      }
    },
    {
      method: 'PUT',
      path: '/teachers/update-with-user/:id',
      handler: 'custom-controller.updateTeacherWithUser',
      config: {
        auth: false
      }
    },
    {
      method: 'DELETE',
      path: '/teachers/delete-with-user/:id',
      handler: 'custom-controller.deleteTeacherWithUser',
      config: {
        auth: false
      }
    }
  ]
}