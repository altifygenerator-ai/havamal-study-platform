type ValidationIssue = {
  message?: unknown;
};

type ValidationErrorShape = {
  issues?: unknown;
};

/**
 * Returns the first message from schema-validation errors without assuming that
 * an unknown caught value is an Error instance.
 */
export function firstValidationMessage(
  error: unknown,
  fallback: string,
): string | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const issues = (error as ValidationErrorShape).issues;
  if (!Array.isArray(issues)) {
    return null;
  }

  const first = issues[0] as ValidationIssue | undefined;
  return typeof first?.message === "string" && first.message.trim()
    ? first.message
    : fallback;
}
