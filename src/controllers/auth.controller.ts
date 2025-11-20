import { Request, Response } from "express";
import logger from "#configs/logger";
import { cookie } from "#utils/cookie";
import { signJwt } from "#utils/jwt";
import formatValidationErrors from "#utils/validation";
import { hashPassword, verifyPassword } from "#services/password.service";
import {
  createUser,
  findUserByEmail,
  sanitizeUser,
} from "#services/user.service";
import {
  signInSchema,
  signOutSchema,
  signUpSchema,
  SignOutInput,
} from "#validations/auth.validation";

type AuthenticatedUser = ReturnType<typeof sanitizeUser>;

const issueAuthToken = (res: Response, user: AuthenticatedUser) => {
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const token = signJwt(tokenPayload);
  cookie.set(res, token);
  return token;
};

const respondWithValidationErrors = (
  res: Response,
  error: unknown,
  context: string
) => {
  const errors = formatValidationErrors(error);
  logger.warn(`Validation failed for ${context}`, { errors });
  return res.status(400).json({ errors });
};

const handleUnexpectedError = (
  res: Response,
  error: unknown,
  context: string
) => {
  const normalisedError =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error) };

  logger.error(`Unexpected error during ${context}`, normalisedError);

  return res.status(500).json({
    error: "Something went wrong. Please try again later.",
  });
};

export const signUp = async (req: Request, res: Response) => {
  const parsed = signUpSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return respondWithValidationErrors(res, parsed.error, "signup");
  }

  try {
    const { email, password, name, role } = parsed.data.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      logger.info("Attempt to register with existing email", { email });
      return res.status(409).json({
        error: "An account with that email already exists.",
      });
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = await createUser({
      email,
      password: hashedPassword,
      name,
      role,
    });

    if (!createdUser) {
      throw new Error("Failed to persist user record");
    }

    const user = sanitizeUser(createdUser);
    const accessToken = issueAuthToken(res, user);

    logger.info("User signed up successfully", {
      userId: user.id,
      email: user.email,
    });

    return res.status(201).json({
      message: "User registered successfully.",
      user,
      token: accessToken,
    });
  } catch (error) {
    return handleUnexpectedError(res, error, "signup");
  }
};

export const signIn = async (req: Request, res: Response) => {
  const parsed = signInSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return respondWithValidationErrors(res, parsed.error, "signin");
  }

  try {
    const { email, password } = parsed.data.body;
    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      logger.info("Signin failed: user not found", { email });
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const passwordMatches = await verifyPassword(
      password,
      existingUser.password
    );

    if (!passwordMatches) {
      logger.info("Signin failed: incorrect password", { email });
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = sanitizeUser(existingUser);
    const accessToken = issueAuthToken(res, user);

    logger.info("User signed in successfully", {
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      message: "Signed in successfully.",
      user,
      token: accessToken,
    });
  } catch (error) {
    return handleUnexpectedError(res, error, "signin");
  }
};

export const signOut = async (req: Request, res: Response) => {
  const parsed = signOutSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return respondWithValidationErrors(res, parsed.error, "signout");
  }

  try {
    const body: SignOutInput | undefined = parsed.data.body;
    if (body?.refreshToken) {
      logger.info("Received refresh token for signout", {
        tokenLength: body.refreshToken.length,
      });
    }

    cookie.clear(res);

    logger.info("User signed out successfully");

    return res.status(200).json({
      message: "Signed out successfully.",
    });
  } catch (error) {
    return handleUnexpectedError(res, error, "signout");
  }
};
