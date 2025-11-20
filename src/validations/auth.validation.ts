import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(64, "Password must be at most 64 characters long.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
    "Password must include uppercase, lowercase, number, and special character."
  );

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters.")
  .max(50, "Name must be at most 50 characters.");

const roleSchema = z.enum(["user", "admin"]).default("user");

export const signUpSchema = z.object({
  body: z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema,
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>["body"];

export const signInSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(64, "Password must be at most 64 characters long."),
  }),
});

export type SignInInput = z.infer<typeof signInSchema>["body"];

export const signOutSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1).optional(),
    })
    .optional(),
});

export type SignOutInput = z.infer<typeof signOutSchema>["body"];
