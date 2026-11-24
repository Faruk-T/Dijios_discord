import { PROBLEM_CODES, type ProblemCode, type ProblemDetails } from "@dijios-connect/contracts";
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { DomainException } from "../errors/domain.exception.js";

function codeForStatus(status: number): ProblemCode {
  if (status === 401) {
    return PROBLEM_CODES.UNAUTHORIZED;
  }
  if (status === 403) {
    return PROBLEM_CODES.TENANT_FORBIDDEN;
  }
  return PROBLEM_CODES.VALIDATION_FAILED;
}

function detailFromHttp(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === "string") {
    return response;
  }
  if (typeof response === "object" && response !== null && "message" in response) {
    const message = response.message;
    if (typeof message === "string") {
      return message;
    }
    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      return message.join("; ");
    }
  }
  return exception.message;
}

function toProblem(exception: unknown, instance: string): ProblemDetails {
  if (exception instanceof DomainException) {
    return { ...exception.problem, instance };
  }
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    return {
      type: `https://connect.dijios.com/problems/http-${status}`,
      title: exception.name,
      status,
      detail: detailFromHttp(exception),
      code: codeForStatus(status),
      instance,
    };
  }
  return {
    type: "https://connect.dijios.com/problems/internal",
    title: "Internal server error",
    status: 500,
    detail: "Unexpected server error.",
    code: PROBLEM_CODES.VALIDATION_FAILED,
    instance,
  };
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();
    if (reply.sent) {
      return;
    }
    const problem = toProblem(exception, request.url);
    void reply.status(problem.status).type("application/problem+json").send(problem);
  }
}
