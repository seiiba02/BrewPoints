import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function validationErrorResponse(
  errors: Record<string, string[]>,
  message?: string
): NextResponse {
  const firstError =
    message ??
    Object.values(errors)[0]?.[0] ??
    'The given data was invalid.';
  return NextResponse.json(
    {
      message: firstError,
      errors,
    },
    { status: 422 }
  );
}

export async function parseJsonBody<T = Record<string, unknown>>(
  request: Request
): Promise<T> {
  try {
    const body = await request.json();
    return (body ?? {}) as T;
  } catch {
    return {} as T;
  }
}
