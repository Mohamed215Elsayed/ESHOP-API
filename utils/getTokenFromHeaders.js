/** -----------------------------
 * 🧩 Helper: Get Token from Headers
 * ----------------------------- **/
const getTokenFromHeaders = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

export default getTokenFromHeaders;
