/**
 * Standardized result type for all server actions.
 * Use this across all projects for consistent error handling.
 */
export interface ActionResult<T = null> {
  success: boolean;
  data?: T;
  error?: string;
  code?: 'AUTH_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'RATE_LIMITED' | 'SERVER_ERROR';
}

export function successResult<T>(data?: T): ActionResult<T> {
  return { success: true, data: data ?? undefined };
}

export function errorResult(error: string, code?: ActionResult['code']): ActionResult<never> {
  return { success: false, error, code };
}
