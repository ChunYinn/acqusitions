import arcjet, { detectBot, protectSignup, shield, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import logger from "./logger";

type ArcjetMode = "LIVE" | "DRY_RUN";

const resolveMode = (value: string | undefined, fallback: ArcjetMode): ArcjetMode => {
  if (value === "LIVE" || value === "DRY_RUN") {
    return value;
  }

  return fallback;
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
};

const toList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const ARCJET_KEY = process.env.ARCJET_KEY;
const baseMode = resolveMode(process.env.ARCJET_MODE, "DRY_RUN");
const botAllowList = toList(process.env.ARCJET_BOT_ALLOW, [
  "CATEGORY:SEARCH_ENGINE",
]);
const refillRate = toNumber(process.env.ARCJET_RATE_REFILL, 5);
const intervalSeconds = toNumber(process.env.ARCJET_RATE_INTERVAL_SECONDS, 10);
const bucketCapacity = toNumber(process.env.ARCJET_RATE_CAPACITY, 10);

const signupMode = resolveMode(process.env.ARCJET_SIGNUP_MODE, "LIVE");
const signupInterval = process.env.ARCJET_SIGNUP_INTERVAL ?? "10m";
const signupMax = toNumber(process.env.ARCJET_SIGNUP_MAX, 5);
const signupEmailBlockList = toList(process.env.ARCJET_SIGNUP_EMAIL_BLOCK, [
  "DISPOSABLE",
  "INVALID",
  "NO_MX_RECORDS",
]);

const createBaseArcjet = () => {
  if (!ARCJET_KEY) {
    logger.warn("ARCJET_KEY not set. Arcjet security checks are disabled.");
    return null;
  }

  return arcjet({
    key: ARCJET_KEY,
    rules: [
      shield({ mode: baseMode }),
      detectBot({
        mode: baseMode,
        allow: botAllowList,
      } as Parameters<typeof detectBot>[0]),
      tokenBucket({
        mode: baseMode,
        refillRate,
        interval: intervalSeconds,
        capacity: bucketCapacity,
      }),
    ],
  });
};

const createSignupArcjet = () => {
  if (!ARCJET_KEY) {
    return null;
  }

  return arcjet({
    key: ARCJET_KEY,
    rules: [
      protectSignup({
        email: {
          mode: signupMode,
          block: signupEmailBlockList,
        },
        bots: {
          mode: signupMode,
          allow: [],
        },
        rateLimit: {
          mode: signupMode,
          interval: signupInterval,
          max: signupMax,
        },
      } as Parameters<typeof protectSignup>[0]),
    ],
  });
};

export const arcjetClient = createBaseArcjet();
export const arcjetSignupClient = createSignupArcjet();
export { isSpoofedBot };
