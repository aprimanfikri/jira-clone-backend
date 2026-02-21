import type { User } from "@/database/schemas";

export interface SessionData {
	user: Omit<User, "password">;
}

export enum ResponseStatus {
	SUCCESS = "SUCCESS",
	FAILED = "FAILED",
}

export const RESPONSE_CODES = {
	// Success
	SUCCESS: "00",
	CREATED: "01",
	UPDATED: "02",
	DELETED: "03",
	EMPTY: "04",

	// Validation
	VALIDATION_ERROR: "10",
	REQUIRED_MISSING: "11",
	INVALID_FORMAT: "12",
	TYPE_MISMATCH: "13",
	OUT_OF_RANGE: "14",
	DUPLICATE: "15",
	NOT_FOUND: "16",

	// Auth
	UNAUTHORIZED: "20",
	AUTH_FAILED: "21",
	FORBIDDEN: "22",
	TOKEN_INVALID: "23",
	TOKEN_EXPIRED: "24",

	// Business
	BUSINESS_RULE: "30",
	NOT_ALLOWED: "31",
	CONFLICT: "32",

	// System
	INTERNAL_ERROR: "40",
	DB_ERROR: "41",
	TIMEOUT: "47",

	// Critical
	UNKNOWN: "60",
	GENERAL_FAILURE: "99",
} as const;

export type ResponseCode = (typeof RESPONSE_CODES)[keyof typeof RESPONSE_CODES];

export type PurposeType = "verification" | "reset-password";

export interface BaseJWTPayload {
	iss?: string;
	sub?: string;
	aud?: string | string[];
	exp?: number;
	nbf?: number;
	iat?: number;
	jti?: string;
	[key: string]: unknown;
}

export interface JwtPayload extends BaseJWTPayload {
	id: string;
	email: string;
	purpose?: PurposeType;
}

export type AppEnv = "development" | "staging" | "production" | "test";
