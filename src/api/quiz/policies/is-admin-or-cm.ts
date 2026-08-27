
export default (policyContext: any, config: any, {  }) => {
    const user = policyContext.state.user;
    if (!user) return false;
    return ['admin', 'content_manager', 'instructor'].includes(user.userType);
};