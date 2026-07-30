export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Auth is a JWT in localStorage, so every request has to attach it by hand.
 * A 401 means the token expired; callers redirect to /login on ApiError.status.
 */
export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    let message = response.statusText || 'Request failed';
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // Body was not JSON; the status text is the best we have.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
