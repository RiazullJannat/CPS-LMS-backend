// src/api/lesson-progress/routes/custom-progress.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/lesson-progresses/course/:courseId/percentage',
      handler: 'lesson-progress.getPercentage',
      config: {
        policies: [],
      },
    },
  ],
};