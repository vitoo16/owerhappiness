import 'server-only';
import { cookies } from 'next/headers';
import type { ApiFailure, ApiSuccess } from '@portfolio/contracts';

const internalApiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function publicApi<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${internalApiUrl}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

export async function privateApi<T>(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const response = await fetch(`${internalApiUrl}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      cookie: cookieStore.toString(),
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

export async function requireOwner() {
  try {
    return await privateApi<{ id: string; email: string; role: 'OWNER' }>('/auth/me');
  } catch {
    return null;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!response.ok || !body.success) {
    const error = (body as ApiFailure).error;
    throw new ApiError(
      response.status,
      error?.code ?? 'API_ERROR',
      error?.message ?? 'Request failed',
      error?.fields,
    );
  }

  return (body as ApiSuccess<T>).data;
}
