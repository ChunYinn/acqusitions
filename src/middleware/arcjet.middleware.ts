import { NextFunction, Request, Response } from "express";
import logger from "#configs/logger";
import {
  arcjetClient,
  arcjetSignupClient,
  isSpoofedBot,
} from "#configs/arcjet";

const respond = (res: Response, status: number, message: string, reason: string) => {
  logger.warn("Arcjet request denied", { reason, status });
  return res.status(status).json({ error: message });
};

export const arcjetSecurityGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!arcjetClient) {
    return next();
  }

  try {
    const decision = await arcjetClient.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return respond(res, 429, "Too many requests.", "rate_limit");
      }

      if (decision.reason.isBot()) {
        return respond(res, 403, "Bots are not allowed.", "bot_detected");
      }

      return respond(res, 403, "Forbidden.", "arcjet_denied");
    }

    if (decision.ip.isHosting()) {
      return respond(res, 403, "Forbidden.", "hosting_ip");
    }

    if (decision.results.some(isSpoofedBot)) {
      return respond(res, 403, "Forbidden.", "spoofed_bot");
    }

    return next();
  } catch (error) {
    logger.error("Arcjet security guard failure", {
      error,
    });

    return res
      .status(503)
      .json({ error: "Security checks unavailable. Please try again later." });
  }
};

export const arcjetSignupGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!arcjetSignupClient) {
    return next();
  }

  const emailCandidate = req.body?.email;
  if (!emailCandidate || typeof emailCandidate !== "string") {
    return next();
  }

  try {
    const decision = await arcjetSignupClient.protect(req, {
      email: emailCandidate,
    });

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        return respond(res, 400, "Invalid email address.", "email_validation");
      }

      if (decision.reason.isRateLimit()) {
        return respond(res, 429, "Too many signup attempts.", "rate_limit");
      }

      if (decision.reason.isBot()) {
        return respond(res, 403, "Bots are not allowed to signup.", "bot_detected");
      }

      return respond(res, 403, "Signup forbidden.", "arcjet_denied");
    }

    return next();
  } catch (error) {
    logger.error("Arcjet signup guard failure", {
      error,
    });

    return res.status(503).json({
      error: "Signup security checks unavailable. Please try again later.",
    });
  }
};
