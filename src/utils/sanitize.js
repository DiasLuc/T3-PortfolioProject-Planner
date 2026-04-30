function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username
  };
}

module.exports = {
  sanitizeUser
};
