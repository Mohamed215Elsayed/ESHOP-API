export const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
  MANAGER: 'manager',
});
//Object.freeze prevents adding, removing, or modifying properties.
// makes your enum-like object immutable
// ROLES.USER = "somethingElse"; // ❌ This won’t work (frozen object)
