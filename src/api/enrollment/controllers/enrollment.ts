/**
 * enrollment controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;

        if (!user || user.userType !== 'student') {
            return ctx.forbidden('Only students can enroll in courses');
        }

        ctx.request.body.data.student = user.id;
        ctx.request.body.data.enrolled_at = new Date();

        return super.create(ctx);
    },

    async find(ctx) {
        const user = ctx.state.user;

        if (user.userType === 'student') {
            ctx.query = {
                ...ctx.query,
                filters: {
                    student: { id: user.id },
                },
            };
        }

        return super.find(ctx);
    },
}));
