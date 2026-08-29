import type { Context } from 'koa';
import { resolveNumericId } from '../../../utils/resolve-id';

export default {
    async getStudentProgress(ctx: Context) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.forbidden('You must be logged in to view course progress');
        }

        const courseId = await resolveNumericId(strapi, 'api::course.course', ctx.params.id);
        const course = courseId && await strapi.db.query('api::course.course').findOne({
            where: { id: courseId },
            populate: ['instructor'],
        });

        if (!course) {
            return ctx.notFound('Course not found');
        }

        const isStaff = ['admin', 'content_manager'].includes(user.userType);
        const isOwningInstructor =
            user.userType === 'instructor' &&
            course.instructor &&
            course.instructor.id === user.id;

        if (!isStaff && !isOwningInstructor) {
            return ctx.forbidden('You are not authorized to view progress for this course');
        }

        const totalLessons = await strapi.db.query('api::lesson.lesson').count({
            where: { course: courseId },
        });

        const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
            where: { course: courseId },
            populate: ['student'],
        });

        const data = [];
        for (const enrollment of enrollments) {
            const student = enrollment.student;
            if (!student) {
                continue;
            }

            const completedCount = await strapi.db.query('api::lesson-progress.lesson-progress').count({
                where: { student: student.id, completed: true, lesson: { course: courseId } },
            });

            const percentage = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

            data.push({
                studentId: student.id,
                username: student.username,
                email: student.email,
                completedCount,
                totalLessons,
                percentage,
            });
        }

        ctx.body = { data };
    },
};
