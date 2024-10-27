export class ApiExceptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiExceptionError";
  }
}
