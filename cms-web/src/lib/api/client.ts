const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  json?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const { body, json = true, headers, ...rest } = opts;
  const init: RequestInit = {
    credentials: "include",
    headers: {
      ...(json && body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    ...rest,
  };
  if (body !== undefined) {
    init.body = json ? JSON.stringify(body) : (body as BodyInit);
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, init);

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const parsed = res.status === 204 ? undefined : isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : `${res.status} ${res.statusText}`;
    throw new ApiError(res.status, msg, parsed);
  }
  return parsed as T;
}
