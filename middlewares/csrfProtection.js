import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection, generateToken, validateRequest } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET, // must be in .env file
  cookieName: 'x-csrf-token', // name of the CSRF cookie
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production', // secure in prod
  },
});

export { doubleCsrfProtection, generateToken, validateRequest };
