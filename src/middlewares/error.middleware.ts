import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import { env } from "@/config/env";
import { RESPONSE_CODES, type ResponseCode, ResponseStatus } from "@/types";

const mapHttpStatusToInternalCode = (status: number): ResponseCode => {
	if (status >= 500) return RESPONSE_CODES.INTERNAL_ERROR;
	if (status === 409) return RESPONSE_CODES.CONFLICT;
	if (status === 404) return RESPONSE_CODES.NOT_FOUND;
	if (status === 403) return RESPONSE_CODES.FORBIDDEN;
	if (status === 401) return RESPONSE_CODES.UNAUTHORIZED;
	if (status === 400) return RESPONSE_CODES.VALIDATION_ERROR;

	return RESPONSE_CODES.GENERAL_FAILURE;
};

function isHTTPResponseError(error: unknown): error is { res: Response } {
	return typeof error === "object" && error !== null && "res" in error;
}

export const errorHandler = async (err: unknown, c: Context) => {
	if (env.APP_ENV !== "production") {
		console.error("[GlobalErrorHandler]", err);
	}

	let httpStatus: ContentfulStatusCode = 500;
	let message = "Internal Server Error";

	if (err instanceof HTTPException) {
		httpStatus = err.status;
		message = err.message;
	} else if (isHTTPResponseError(err)) {
		const res = err.res;
		httpStatus = res.status as ContentfulStatusCode;

		try {
			const clone = res.clone();
			const data = (await clone.json()) as { message?: string; error?: string };
			message = data.message ?? data.error ?? "HTTP Error";
		} catch {
			message = res.statusText || "HTTP Error";
		}
	} else if (err instanceof ZodError) {
		const firstIssue = err.issues[0];
		httpStatus = 400;
		message = firstIssue.message;
	} else if (err instanceof Error) {
		message = err.message || message;
	}

	const internalCode = mapHttpStatusToInternalCode(httpStatus);

	return c.json(
		{
			code: internalCode,
			status: ResponseStatus.FAILED,
			message,
			timestamp: new Date().toISOString(),
		},
		httpStatus,
	);
};
