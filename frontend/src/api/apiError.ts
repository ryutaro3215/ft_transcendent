import type { RequestProps, apiErrorProps } from "../types/api";
import { safeJson } from "../utils/auth";

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: unknown;

  constructor(props: apiErrorProps) {
    super(props.message ?? props.code ?? "HTTP_ERROR");
    this.name = "ApiError";
    this.status = props.status;
    this.code = props.code ?? "HTTP_ERROR";
    this.details = props.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static async formResponse(res: Response) {
    const json = await safeJson(res);
    return new ApiError({
      status: res.status,
      code: (json as any)?.code ?? "HTTP_ERROR",
      message: (json as any)?.message ?? res.statusText,
      details: json,
    });
  }
}
