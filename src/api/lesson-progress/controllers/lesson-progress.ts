/**
 * lesson-progress controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson-progress.lesson-progress', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user || user.userType !== 'student') {
            return ctx.forbidden('Only students can mark progress');
        }

        const lessonId = ctx.request.body.data.lesson;

        const lesson = await strapi.db.query('api::lesson.lesson').findOne({
            where: { id: lessonId },
            populate: ['course'],
        });

        if (!lesson || !lesson.course) {
            return ctx.notFound('Lesson not found');
        }

        const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
            where: { student: user.id, course: lesson.course.id },
        });

        if (!enrollment) {
            return ctx.forbidden('You are not enrolled in this course');
        }

        const existing = await strapi.db.query('api::lesson-progress.lesson-progress').findOne({
            where: { student: user.id, lesson: lessonId },
        });
        if (existing) {
            return ctx.badRequest('This lesson is already marked complete');
        }

        ctx.request.body.data.student = user.id;
        ctx.request.body.data.completed = true;
        ctx.request.body.data.completed_at = new Date();

        return super.create(ctx);
    },

    async find(ctx) {
        const user = ctx.state.user;

        if (user.userType === 'student') {
            ctx.query = {
                ...ctx.query,
                filters: { student: { id: user.id } },
            };
        }

        return super.find(ctx);
    },
    async getPercentage(ctx) {
        const user = ctx.state.user;
        const courseId = ctx.params.courseId;

        const totalLessons = await strapi.db.query('api::lesson.lesson').count({
            where: { course: courseId },
        });

        const completedCount = await strapi.db.query('api::lesson-progress.lesson-progress').count({
            where: { student: user.id, completed: true, lesson: { course: courseId } },
        });

        const percentage = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

        ctx.body = {
            totalLessons,
            completedCount,
            percentage,
        };
    }
}));