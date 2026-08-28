/**
 * quiz controller
 */

import { factories } from '@strapi/strapi';
import { resolveNumericId } from '../../../utils/resolve-id';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user || !['admin', 'content_manager', 'instructor'].includes(user.userType)) {
            return ctx.forbidden('You are not authorized to create a quiz');
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
    async find(ctx) {
        const { data, meta } = await super.find(ctx);
        const user = ctx.state.user;

        if (user && user.userType === 'student') {
            data.forEach((quiz: any) => {
                if (quiz.questions) {
                    quiz.questions = quiz.questions.map((q: any) => {
                        const { correct_answer, ...rest } = q;
                        return rest;
                    });
                }
            });
        }

        return { data, meta };
    },

    async findOne(ctx) {
        const { data, meta } = await super.findOne(ctx);
        const user = ctx.state.user;

        if (user && user.userType === 'student' && data && data.questions) {
            data.questions = data.questions.map((q: any) => {
                const { correct_answer, ...rest } = q;
                return rest;
            });
        }

        return { data, meta };
    },

    async update(ctx) {
        const user = ctx.state.user;
        if (!user || !['admin', 'content_manager', 'instructor'].includes(user.userType)) {
            return ctx.forbidden('You are not authorized to update this quiz');
        }

        if (user.userType === 'instructor') {
            const quizId = await resolveNumericId(strapi, 'api::quiz.quiz', ctx.params.id);
            const quiz = quizId && await strapi.db.query('api::quiz.quiz').findOne({
                where: { id: quizId },
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
            const quizId = await resolveNumericId(strapi, 'api::quiz.quiz', ctx.params.id);
            const quiz = quizId && await strapi.db.query('api::quiz.quiz').findOne({
                where: { id: quizId },
                populate: ['course', 'course.instructor'],
            });
            if (!quiz || !quiz.course || !quiz.course.instructor || quiz.course.instructor.id !== user.id) {
                return ctx.forbidden('This quiz does not belong to your course');
            }
        }

        return super.delete(ctx);
    },
}));
