import type { ApiFailure, ApiSuccess } from '@portfolio/contracts';

export class ClientApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ClientApiError';
  }
}

export async function api<T>(path: string, init: RequestInit = {}) {
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      accept: 'application/json',
      ...(isFormData ? {} : { 'content-type': 'application/json' }),
      ...init.headers,
    },
  });

  if (response.status === 204) return null as T;

  const body = await readApiBody<T>(response);
  if (!response.ok || !body.success) {
    const error = (body as ApiFailure).error;
    throw new ClientApiError(
      response.status,
      error?.code ?? 'API_ERROR',
      error?.message ?? 'Request failed',
      error?.fields,
    );
  }

  return (body as ApiSuccess<T>).data;
}

async function readApiBody<T>(response: Response): Promise<ApiSuccess<T> | ApiFailure> {
  try {
    return (await response.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    return {
      success: false,
      error: {
        code: 'INVALID_API_RESPONSE',
        message: 'The API returned an unreadable response.',
      },
    };
  }
}
