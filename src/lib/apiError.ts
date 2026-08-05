interface ValidationErrorItem {
  msg?: string;
}

type ApiErrorDetail = string | ValidationErrorItem[] | undefined;

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: ApiErrorDetail } } })?.response?.data?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0 && typeof detail[0]?.msg === "string") {
    return detail[0].msg.replace(/^Value error,\s*/, "");
  }
  return fallback;
}
