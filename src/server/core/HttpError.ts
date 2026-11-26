import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: ContentfulStatusCode = 400,
    public readonly extra?: Record<string, unknown>
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, extra?: Record<string, unknown>) {
    super(message, 400, extra);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Silakan masuk terlebih dahulu.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Anda tidak memiliki izin akses.") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
