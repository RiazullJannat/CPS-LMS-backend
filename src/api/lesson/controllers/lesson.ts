/**
 * lesson controller
 */

import { factories } from '@strapi/strapi';
import { resolveNumericId } from '../../../utils/resolve-id';


export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user || !['admin', 'content_manager', 'instructor'].includes(user.userType)) {
            return ctx.forbidden('You are not authorized to add lessons');
        }

        if (user.userType === 'instructor') {
            const courseId = await resolveNumericId(strapi, 'api::course.course', ctx.request.body.data.course);
            const course = courseId && await strapi.db.query('api::course.course').findOne({
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
            return ctx.forbidden('You are not authorized to update this lesson');
        }

        if (user.userType === 'instructor') {
            const lessonId = await resolveNumericId(strapi, 'api::lesson.lesson', ctx.params.id);
            const lesson = lessonId && await strapi.db.query('api::lesson.lesson').findOne({
                where: { id: lessonId },
                populate: ['course', 'course.instructor'],
            });

            if (!lesson || !lesson.course || !lesson.course.instructor || lesson.course.instructor.id !== user.id) {
                return ctx.forbidden('This lesson does not belong to your course');
            }
        }

        return super.update(ctx);
    },

    async delete(ctx) {
        const user = ctx.state.user;
        if (!user || !['admin', 'content_manager', 'instructor'].includes(user.userType)) {
            return ctx.forbidden('You are not authorized to delete this lesson');
        }

        if (user.userType === 'instructor') {
            const lessonId = await resolveNumericId(strapi, 'api::lesson.lesson', ctx.params.id);
            const lesson = lessonId && await strapi.db.query('api::lesson.lesson').findOne({
                where: { id: lessonId },
                populate: ['course', 'course.instructor'],
            });

            if (!lesson || !lesson.course || !lesson.course.instructor || lesson.course.instructor.id !== user.id) {
                return ctx.forbidden('This lesson does not belong to your course');
            }
        }

        return super.delete(ctx);
    },
}));
