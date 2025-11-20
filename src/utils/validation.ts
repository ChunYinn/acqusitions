import type { ZodError, ZodIssue } from "zod";

export interface FormattedValidationError {
  path: string;
  message: string;
  code?: string;
}

const formatIssue = (issue: Partial<ZodIssue>): FormattedValidationError => {
  const path =
    issue.path && issue.path.length > 0
      ? issue.path.join(".")
      : issue.path?.toString() ?? "root";

  return {
    path,
    message: issue.message ?? "Validation failed",
    code: issue.code,
  };
};

const isZodError = (error: unknown): error is ZodError => {
  return Boolean(
    error &&
      typeof error === "object" &&
      "issues" in error &&
      Array.isArray((error as ZodError).issues)
  );
};

export const formatValidationErrors = (
  errors: unknown
): FormattedValidationError[] => {
  if (!errors) {
    return [];
  }

  if (isZodError(errors)) {
    return errors.issues.map((issue) => formatIssue(issue));
  }

  if (Array.isArray(errors)) {
    return errors
      .filter(
        (issue): issue is Partial<ZodIssue> & { message?: string } =>
          Boolean(issue && typeof issue === "object")
      )
      .map((issue) => formatIssue(issue));
  }

  if (
    typeof errors === "object" &&
    errors !== null &&
    "issues" in errors &&
    Array.isArray((errors as { issues: unknown }).issues)
  ) {
    return (errors as { issues: Partial<ZodIssue>[] }).issues.map((issue) =>
      formatIssue(issue)
    );
  }

  const fallbackMessage =
    errors instanceof Error
      ? errors.message
      : typeof errors === "string"
        ? errors
        : "Validation failed";

  return [{ path: "root", message: fallbackMessage }];
};

export default formatValidationErrors;
