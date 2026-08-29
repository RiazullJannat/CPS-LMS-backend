import type { Context } from 'koa';

export default {
    async getStats(ctx: Context) {
        const admin = ctx.state.user;
        if (!admin || admin.userType !== 'admin') {
            return ctx.forbidden('Only admin can view platform stats');
        }

        const userQuery = strapi.db.query('plugin::users-permissions.user');

        const [
            students,
            instructors,
            contentManagers,
            admins,
            totalCourses,
            totalLessons,
            totalEnrollments,
            totalQuizzes,
        ] = await Promise.all([
            userQuery.count({ where: { userType: 'student' } }),
            userQuery.count({ where: { userType: 'instructor' } }),
            userQuery.count({ where: { userType: 'content_manager' } }),
            userQuery.count({ where: { userType: 'admin' } }),
            strapi.db.query('api::course.course').count(),
            strapi.db.query('api::lesson.lesson').count(),
            strapi.db.query('api::enrollment.enrollment').count(),
            strapi.db.query('api::quiz.quiz').count(),
        ]);

        ctx.body = {
            data: {
                users: {
                    students,
                    instructors,
                    contentManagers,
                    admins,
                    total: students + instructors + contentManagers + admins,
                },
                totalCourses,
                totalLessons,
                totalEnrollments,
                totalQuizzes,
            },
        };
    },
};
