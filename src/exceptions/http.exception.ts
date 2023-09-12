/**
 * Custom HTTP exception class that extends the Error class.
 * @class HttpException
 * @extends Error
 * @param {number} status - The HTTP status code of the exception.
 * @param {string} message - The error message associated with the exception.
 * @param {boolean} [isOperational=true] - Indicates whether the exception is operational or not.
 * @param {string} [stack=""] - The stack trace of the exception.
 * @property {number} status - The HTTP status code of the exception.
 * @property {string} message - The error message associated with the exception.
 * @property {boolean} isOperational - Indicates whether the exception is operational or not.
 */
export class HttpException extends Error {
  public status: number;
  public message: string;
  public isOperational;

  constructor(
    status: number,
    message: string,
    isOperational = true,
    stack = ""
  ) {
    super(message);
    this.status = status;
    this.message = message;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    }
  }
}
