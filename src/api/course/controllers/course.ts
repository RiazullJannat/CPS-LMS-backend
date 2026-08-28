/**
 * course controller
 */

import { factories } from '@strapi/strapi';
import { resolveNumericId } from '../../../utils/resolve-id';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
    async update(ctx) {
        const user = ctx.state.user;
        if (!user || !['admin', 'content_manager', 'instructor'].includes(user.userType)) {
            return ctx.forbidden('You are not authorized to update this course');
        }
        if (user.userType === 'instructor') {
            const courseId = await resolveNumericId(strapi, 'api::course.course', ctx.params.id);
            const course = courseId && await strapi.db.query('api::course.course').findOne({
                where: { id: courseId },
                populate: ['instructor']
            });
            if (!course || !course.instructor || course.instructor.id !== user.id) {
                return ctx.forbidden('You are not the owner of this course');
            }
        }
        return super.update(ctx);
    },

    async delete(ctx) {
        const user = ctx.state.user;
        if(!user || !['admin', 'content_manager', 'instructor'].includes(user.userType)) {
            return ctx.forbidden('You are not authorized to delete this course');
        }

        if(user.userType === 'instructor') {
            const courseId = await resolveNumericId(strapi, 'api::course.course', ctx.params.id);
            const course = courseId && await strapi.db.query('api::course.course').findOne({
                where: { id: courseId },
                populate: ['instructor']
            });
            if(!course || !course.instructor || course.instructor.id !== user.id) {
                return ctx.forbidden('You are not the owner of this course');
            }
        }
        return super.delete(ctx);
    }
}));
