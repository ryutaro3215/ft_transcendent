import * as z from "zod";

export const LoginSchema = z.object({
  email: z
    .email("This format is not valid address, change to collect address")
    .max(254),
  password: z
    .string()
    .min(8, "password needs more than 8 letters")
    .max(128, "password needs less than 128 letters")
    .regex(/[a-z]/, { message: "include lower alphabet" })
    .regex(/[0-9]/, { message: "include number" }),
});

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "name need more than 2 letters")
    .max(50, "name need less than 50 letters"),
  email: z.email("This format is not valid").max(254),
  password: z
    .string()
    .min(8, "password needs more than 8 letters")
    .max(128, "password needs less than 128 letters")
    .regex(/[a-z]/, { message: "include lower alphabet" })
    .regex(/[0-9]/, { message: "include number" }),
});

export const MeSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
});
