const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || null,
  profileImg: user.profileImg || null,
  coverImg: user.coverImg || null,
  role: user.role,
  termsAccepted: user.termsAccepted,
  termsAcceptedAt: user.termsAcceptedAt || null,
  // termsVersion: user.termsVersion,
});
export default sanitizeUser;
