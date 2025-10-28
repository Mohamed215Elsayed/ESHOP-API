// @desc :this class is responsible about operation errors (errors that i can predict)
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message); // Pass the message to the built-in Error class
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true; //
  }
}

export default ApiError;
