export default {
    routes: [
        {
            method: 'GET',
            path: '/courses/:id/student-progress',
            handler: 'course-progress.getStudentProgress',
            config: { policies: [] },
        },
    ],
};
