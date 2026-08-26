export default (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  return ['admin', 'content_manager'].includes(user.userType);
};
