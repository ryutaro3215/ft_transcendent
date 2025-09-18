import { LoginSchema, RegisterSchema, MeSchema } from "../schemas/auth";
import { httpMethod } from "./http";
import * as z from "zod";

export type RequestProps = {
  url: string;
  method?: httpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  timeOutms?: number;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
};

export type apiErrorProps = {
  status: number;
  code?: string;
  message?: string;
  details?: unknown;
};

export type LoginType = z.infer<typeof LoginSchema>;
export type RegisterType = z.infer<typeof RegisterSchema>;
export type MeType = z.infer<typeof MeSchema>;
