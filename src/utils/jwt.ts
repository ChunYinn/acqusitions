import jwt, {
  Algorithm,
  JwtPayload,
  SignOptions,
  TokenExpiredError,
  VerifyOptions,
} from "jsonwebtoken";

type PayloadInput = string | Buffer | object;

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m";
const JWT_ALGORITHM: Algorithm =
  (process.env.JWT_ALGORITHM as Algorithm | undefined) ?? "HS256";

const ensureSecret = (): string => {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET environment variable is required to sign or verify tokens."
    );
  }

  return JWT_SECRET;
};

const baseSignOptions: SignOptions = {
  algorithm: JWT_ALGORITHM,
  expiresIn: JWT_EXPIRES_IN,
};

export interface VerifyJwtResult<TPayload extends JwtPayload | string> {
  valid: boolean;
  expired: boolean;
  payload?: TPayload;
  error?: Error;
}

export const signJwt = <TPayload extends PayloadInput>(
  payload: TPayload,
  options: SignOptions = {}
): string => {
  const finalOptions: SignOptions = {
    ...baseSignOptions,
    ...options,
    expiresIn: options.expiresIn ?? baseSignOptions.expiresIn,
  };

  return jwt.sign(payload, ensureSecret(), finalOptions);
};

export const verifyJwt = <TPayload extends JwtPayload | string>(
  token: string,
  options: VerifyOptions = {}
): VerifyJwtResult<TPayload> => {
  try {
    const decoded = jwt.verify(token, ensureSecret(), {
      algorithms: [JWT_ALGORITHM],
      ...options,
    }) as TPayload;

    return {
      valid: true,
      expired: false,
      payload: decoded,
    };
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      return { valid: false, expired: true, error };
    }

    const normalisedError =
      error instanceof Error
        ? error
        : new Error("JWT verification failed with an unknown error");

    return { valid: false, expired: false, error: normalisedError };
  }
};

export const decodeJwt = <TPayload extends JwtPayload | null>(
  token: string
): TPayload | null => {
  const decoded = jwt.decode(token);
  return (decoded as TPayload) ?? null;
};
