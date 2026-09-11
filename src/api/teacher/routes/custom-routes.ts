export default {
  routes: [
    {
      method: 'POST',
      path: '/teachers/register',
      handler: 'custom-controller.registerTeacher',
      config: {}
    },
    {
      method: 'PUT',
      path: '/teachers/update-with-user/:id',
      handler: 'custom-controller.updateTeacherWithUser',
      config: {}
    },
    {
      method: 'DELETE',
      path: '/teachers/delete-with-user/:id',
      handler: 'custom-controller.deleteTeacherWithUser',
      config: {}
    }
  ]
}