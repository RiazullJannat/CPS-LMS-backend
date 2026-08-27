/**
 * quiz controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user || !['admin', 'content_manager', 'instructor'].includes(user.userType)) {
            return ctx.forbidden('You are not authorized to create a quiz');
        }

        if (user.userType === 'instructor') {
            const courseId = ctx.request.body.data.course;
            const course = await strapi.db.query('api::course.course').findOne({
                where: { id: courseId },
                populate: ['instructor'],
            });
            if (!course || !course.instructor || course.instructor.id !== user.id) {
                return ctx.forbidden('This is not your course');
            }
        }

        return super.create(ctx);
    },

    async update(ctx) {
        const user = ctx.state.user;
        if (!user || !['admin', 'content_manager', 'instructor'].includes(user.userType)) {
            return ctx.forbidden('You are not authorized to update this quiz');
        }

        if (user.userType === 'instructor') {
            const quiz = await strapi.db.query('api::quiz.quiz').findOne({
                where: { id: ctx.params.id },
                populate: ['course', 'course.instructor'],
            });
            if (!quiz || !quiz.course || !quiz.course.instructor || quiz.course.instructor.id !== user.id) {
                return ctx.forbidden('This quiz does not belong to your course');
            }
        }

        return super.update(ctx);
    },

    async delete(ctx) {
        const user = ctx.state.user;
        if (!user || !['admin', 'content_manager', 'instructor'].includes(user.userType)) {
            return ctx.forbidden('You are not authorized to delete this quiz');
        }

        if (user.userType === 'instructor') {
            const quiz = await strapi.db.query('api::quiz.quiz').findOne({
                where: { id: ctx.params.id },
                populate: ['course', 'course.instructor'],
            });
            if (!quiz || !quiz.course || !quiz.course.instructor || quiz.course.instructor.id !== user.id) {
                return ctx.forbidden('This quiz does not belong to your course');
            }
        }

        return super.delete(ctx);
    },
}));
