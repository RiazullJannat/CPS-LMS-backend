import type { Context } from 'koa';

export default {
    async getAllUsers(ctx: Context) {
        const admin = ctx.state.user;
        if (!admin || admin.userType !== 'admin') {
            return ctx.forbidden('Only admin can view all users');
        }

        const users = await strapi.db.query('plugin::users-permissions.user').findMany({
            select: ['id', 'username', 'email', 'userType', 'createdAt'],
        });

        ctx.body = { data: users };
    },

    async updateRole(ctx: Context) {
        const admin = ctx.state.user;
        if (!admin || admin.userType !== 'admin') {
            return ctx.forbidden('Only admin can change user roles');
        }

        const { id } = ctx.params;
        const { userType } = ctx.request.body;

        const allowedTypes = ['admin', 'content_manager', 'instructor', 'student'];
        if (!allowedTypes.includes(userType)) {
            return ctx.badRequest('Invalid userType');
        }

        const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
            where: { id },
            data: { userType },
            select: ['id', 'username', 'email', 'userType'],
        });

        if (!updatedUser) {
            return ctx.notFound('User not found');
        }

        ctx.body = { data: updatedUser };
    },

    async adminCreateUser(ctx: Context) {
        const admin = ctx.state.user;
        if (!admin || admin.userType !== 'admin') {
            return ctx.forbidden('Only admin can create users directly');
        }

        const { username, email, password, userType } = ctx.request.body;

        const allowedTypes = ['admin', 'content_manager', 'instructor', 'student'];
        if (!allowedTypes.includes(userType)) {
            return ctx.badRequest('Invalid userType');
        }

        if (!username || !email || !password) {
            return ctx.badRequest('username, email and password are required');
        }

        // The users-permissions `user.add` service does NOT enforce uniqueness
        // (only the public /auth/local/register flow does), so guard it here —
        // otherwise duplicate emails/usernames get silently created.
        const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { $or: [{ email: email.toLowerCase() }, { username }] },
        });
        if (existingUser) {
            return ctx.badRequest('Email or username already taken');
        }

        const authenticatedRole = await strapi.db
            .query('plugin::users-permissions.role')
            .findOne({ where: { type: 'authenticated' } });

        if (!authenticatedRole) {
            return ctx.badRequest('Default authenticated role not found');
        }

        try {
            const newUser = await strapi.plugins['users-permissions'].services.user.add({
                username,
                email: email.toLowerCase(),
                password,
                userType,
                role: authenticatedRole.id,
                provider: 'local',
                confirmed: true,
            });

            ctx.body = {
                data: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    userType: newUser.userType,
                },
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create user';
            return ctx.badRequest(message);
        }
    },
    async getInstructors(ctx: Context) {
        const user = ctx.state.user;

        if (!user || !['admin', 'content_manager'].includes(user.userType)) {
            return ctx.forbidden('Not authorized to view instructor list');
        }

        const instructors = await strapi.db.query('plugin::users-permissions.user').findMany({
            where: { userType: 'instructor' },
            select: ['id', 'username', 'email'],
        });

        ctx.body = { data: instructors };
    },
};