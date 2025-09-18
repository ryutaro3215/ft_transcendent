import { request } from "./apiClient";
import type { LoginType, RegisterType, MeType } from "../types/api";
import { MeSchema } from "../schema/auth";

export const AuthApi = {
  async register(req: RegisterType) {
    return await request<{ ok: true }>({
      url: "/api/auth/register",
      method: "POST",
      body: req,
      credentials: "include",
    });
  },

  async login(req: LoginType) {
    return await request<{ ok: true; csrfToken: string } | void>({
      url: "/api/auth/login",
      method: "POST",
      body: req,
      credentials: "include",
    });
  },

  async me() {
    const me = await request<MeType>({
      url: "/api/auth/me",
      method: "GET",
      credentials: "include",
    });
    return MeSchema.parse(me);
  },

  async logout() {
    return request<void>({
      url: "/api/auth/logout",
      method: "GET",
      credentials: "include",
    });
  },
};
