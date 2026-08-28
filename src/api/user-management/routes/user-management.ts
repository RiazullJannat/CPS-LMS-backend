export default {
    routes: [
        {
            method: 'GET',
            path: '/users/all',
            handler: 'user-management.getAllUsers',
            config: { policies: [] },
        },
        {
            method: 'PUT',
            path: '/users/:id/role',
            handler: 'user-management.updateRole',
            config: { policies: [] },
        },
        {
            method: 'POST',
            path: '/users/admin-create',
            handler: 'user-management.adminCreateUser',
            config: { policies: [] },
        },
    ],
};