import { ApiError } from '#/generated/api'

export function isNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404
}
