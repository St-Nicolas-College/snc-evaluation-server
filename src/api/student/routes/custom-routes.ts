export default {
  routes: [
    {
      method: 'POST',
      path: '/students/register',
      handler: 'custom-controller.registerStudent',
      config: {
        auth: false
      }
    },
     {
      method: 'PUT',
      path: '/students/update-with-user/:id',
      handler: 'custom-controller.updateStudentWithUser',
      config: { auth: false }
    },
    {
      method: 'DELETE',
      path: '/students/delete-with-user/:id',
      handler: 'custom-controller.deleteStudentWithUser',
      config: { auth: false }
    }
  ]
}