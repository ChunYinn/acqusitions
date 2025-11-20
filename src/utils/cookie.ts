import { CookieOptions, Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";
const defaultCookieName =
  process.env.AUTH_COOKIE_NAME ?? "acquisition_auth_token";
const cookieDomain = process.env.COOKIE_DOMAIN;
const maxAgeDays = Number(process.env.AUTH_COOKIE_MAX_AGE_DAYS ?? "7");

const maxAgeMs =
  Number.isFinite(maxAgeDays) && maxAgeDays > 0
    ? maxAgeDays * 24 * 60 * 60 * 1000
    : 7 * 24 * 60 * 60 * 1000;

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: isProduction,
  path: "/",
  maxAge: maxAgeMs,
  domain: cookieDomain,
};

const sanitizeOptions = (overrides: CookieOptions = {}): CookieOptions => {
  const options: CookieOptions = {
    ...baseCookieOptions,
    ...overrides,
  };

  const hasDomainOverride = overrides.domain !== undefined;
  if (!cookieDomain && !hasDomainOverride) {
    delete options.domain;
  }

  return options;
};

export const cookie = {
  name: defaultCookieName,
  getOptions: (overrides?: CookieOptions) => sanitizeOptions(overrides),
  set: (
    res: Response,
    value: string,
    overrides?: CookieOptions,
    name = defaultCookieName
  ) => {
    res.cookie(name, value, sanitizeOptions(overrides));
    return res;
  },
  get: (req: Request, name = defaultCookieName): string | undefined => {
    return req.cookies?.[name];
  },
  clear: (
    res: Response,
    overrides?: CookieOptions,
    name = defaultCookieName
  ) => {
    const options = sanitizeOptions(overrides);
    res.clearCookie(name, options);
    return res;
  },
};

export type CookieHelper = typeof cookie;
