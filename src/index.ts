import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Strapi's relation-write validator (throw-restricted-relations) requires the
    // requesting role to have `find` permission on a relation's TARGET content-type
    // before it will let ANY write set that relation — even when the value is set
    // server-side by a controller (e.g. `data.student = user.id`), not client-supplied.
    // Our `course.instructor`, `enrollment.student`, `lesson-progress.student`, and
    // `quiz-result.student` relations all target plugin::users-permissions.user, so
    // without this permission every create/update touching those fields fails with
    // 400 "Invalid key <field>". Grant it once to the Authenticated role, additively
    // (this only inserts the one missing permission row; it never touches or removes
    // any permission already configured for the role).
    const role = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (role) {
      // `plugin::users-permissions.user.find` — see the relation-write note above.
      // `api::user-management.user-management.*` — custom routes are gated by the
      // users-permissions plugin the same way core routes are: without an explicit
      // permission row the Authenticated role gets 403 before the handler runs.
      // These handlers each enforce `userType === 'admin'` themselves, so granting
      // them to every authenticated user is safe — the controller is the real gate.
      const actions = [
        'plugin::users-permissions.user.find',
        'api::user-management.user-management.getAllUsers',
        'api::user-management.user-management.updateRole',
        'api::user-management.user-management.adminCreateUser',
        'api::user-management.user-management.getInstructors',
        'api::dashboard-stats.dashboard-stats.getStats',
        'api::course-progress.course-progress.getStudentProgress',
      ];

      for (const action of actions) {
        const existing = await strapi.db
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action, role: role.id } });

        if (!existing) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { action, role: role.id },
          });
          strapi.log.info(`[bootstrap] Granted "${action}" to the Authenticated role.`);
        }
      }
    }
  },
};
