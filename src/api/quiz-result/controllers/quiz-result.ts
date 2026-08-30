/**
 * quiz-result controller
 */

import { factories } from '@strapi/strapi';
import { resolveNumericId } from '../../../utils/resolve-id';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user || user.userType !== 'student') {
            return ctx.forbidden('Only students can submit quizzes');
        }

        const quizId = await resolveNumericId(strapi, 'api::quiz.quiz', ctx.request.body.data.quiz);
        const submittedAnswers = ctx.request.body.data.answers;

        
        const quiz = quizId && await strapi.db.query('api::quiz.quiz').findOne({
            where: { id: quizId },
            populate: ['course', 'questions'],
        });

        if (!quiz) {
            return ctx.notFound('Quiz not found');
        }

        // Student oi course a enrolled ki na check 
        const enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
            where: { student: user.id, course: quiz.course.id },
        });
        if (!enrollment) {
            return ctx.forbidden('You are not enrolled in this course');
        }

        // Retake 
        const existing = await strapi.db.query('api::quiz-result.quiz-result').findOne({
            where: { student: user.id, quiz: quizId },
        });
        if (existing) {
            return ctx.badRequest('You have already submitted this quiz');
        }

        // Auto-grade 
        let score = 0;
        const gradedAnswers = quiz.questions.map((q: { correct_answer: any; }, index: any) => {
            const submitted = submittedAnswers.find((a: { question_index: any; }) => a.question_index === index);
            const isCorrect = submitted && submitted.selected === q.correct_answer;
            if (isCorrect) score += 1;
            return {
                question_index: index,
                selected: submitted ? submitted.selected : null,
                correct: isCorrect,
            };
        });

        ctx.request.body.data = {
            student: user.id,
            quiz: quizId,
            score,
            total_questions: quiz.questions.length,
            answers: gradedAnswers,
            submitted_at: new Date(),
        };

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
}));
