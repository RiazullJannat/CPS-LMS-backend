/**
 * quiz router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::quiz.quiz', {
    config: {
        create: {
            policies: ['api::quiz.is-admin-or-cm'],
        },
    },
});
