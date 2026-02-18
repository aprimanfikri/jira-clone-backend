import type { Context } from "hono";
import { RESPONSE_CODES, type ResponseCode, ResponseStatus } from "@/types";

class ResponseHandler {
	private static _instance: ResponseHandler;

	private constructor() {}

	static get instance() {
		if (!ResponseHandler._instance) {
			ResponseHandler._instance = new ResponseHandler();
		}
		return ResponseHandler._instance;
	}

	success<T>(
		_c: Context,
		message: string,
		data?: T,
		code: ResponseCode = RESPONSE_CODES.SUCCESS,
		httpStatus = 200,
	) {
		const body: Record<string, unknown> = {
			code,
			status: ResponseStatus.SUCCESS,
			message,
			timestamp: new Date().toISOString(),
		};

		if (data !== null && data !== undefined) {
			body.data = data;
		}

		return new Response(JSON.stringify(body), {
			status: httpStatus,
			headers: { "Content-Type": "application/json" },
		});
	}

	error(
		_c: Context,
		message: string,
		code: ResponseCode = RESPONSE_CODES.GENERAL_FAILURE,
		httpStatus = 400,
		errors?: unknown,
	) {
		const body: Record<string, unknown> = {
			code,
			status: ResponseStatus.FAILED,
			message,
			timestamp: new Date().toISOString(),
		};

		if (errors !== null && errors !== undefined) {
			body.errors = errors;
		}

		return new Response(JSON.stringify(body), {
			status: httpStatus,
			headers: { "Content-Type": "application/json" },
		});
	}
}

const responseHandler = ResponseHandler.instance;
export default responseHandler;
