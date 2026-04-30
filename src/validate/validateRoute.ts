import path from "path";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const ROUTE_NAME_REGEX = /^[a-zA-Z0-9/_\-\[\]]+$/;
const DYNAMIC_SEGMENT_REGEX = /\[([a-zA-Z0-9_]+)\]/g;

export function validateRouteName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push("Route name must not be empty.");
    return { valid: false, errors };
  }

  if (!ROUTE_NAME_REGEX.test(name)) {
    errors.push(
      `Route name "${name}" contains invalid characters. Use letters, numbers, slashes, hyphens, underscores, or dynamic segments like [id].`
    );
  }

  const segments = name.split("/").filter(Boolean);
  for (const segment of segments) {
    if (segment.startsWith("[") && !segment.endsWith("]")) {
      errors.push(`Dynamic segment "${segment}" is malformed. Expected format: [paramName].`);
    }
    if (segment === ".") {
      errors.push("Route segments must not be '.'.");
    }
    if (segment === "..") {
      errors.push("Route segments must not be '..' (path traversal is not allowed).");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateMethods(methods: string[]): ValidationResult {
  const errors: string[] = [];

  if (!methods || methods.length === 0) {
    errors.push("At least one HTTP method must be specified.");
    return { valid: false, errors };
  }

  for (const method of methods) {
    if (!VALID_METHODS.includes(method.toUpperCase())) {
      errors.push(
        `"${method}" is not a valid HTTP method. Valid methods: ${VALID_METHODS.join(", ")}.`
      );
    }
  }

  const unique = new Set(methods.map((m) => m.toUpperCase()));
  if (unique.size !== methods.length) {
    errors.push("Duplicate HTTP methods are not allowed.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateOutputDir(outputDir: string): ValidationResult {
  const errors: string[] = [];

  if (!outputDir || outputDir.trim().length === 0) {
    errors.push("Output directory must not be empty.");
    return { valid: false, errors };
  }

  if (path.isAbsolute(outputDir)) {
    errors.push("Output directory should be a relative path.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateRouteInput(
  name: string,
  methods: string[],
  outputDir: string
): ValidationResult {
  const nameResult = validateRouteName(name);
  const methodsResult = validateMethods(methods);
  const dirResult = validateOutputDir(outputDir);

  const errors = [
    ...nameResult.errors,
    ...methodsResult.errors,
    ...dirResult.errors,
  ];

  return { valid: errors.length === 0, errors };
}
