import { ArcjetNextRequest } from '@arcjet/next';
import { os } from '@orpc/server';

export const base = os.$context<{ request: Request | ArcjetNextRequest }>().errors({
  RATE_LIMITED: {
    message: 'Too many requests',
  },
  BAD_REQUEST: {
    message: 'Bad request',
  },
  NOT_FOUND: {
    message: 'Not found',
  },
  FORBIDDEN: {
    message: 'Forbidden',
  },
  UNAUTHORIZED: {
    message: 'Unauthorized',
  },
  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error',
  },
  SERVICE_UNAVAILABLE: {
    message: 'Service unavailable',
  },
  GONE: {
    message: 'Gone',
  },
  CONFLICT: {
    message: 'Conflict',
  },
  PAYLOAD_TOO_LARGE: {
    message: 'Payload too large',
  },
  UNSUPPORTED_MEDIA_TYPE: {
    message: 'Unsupported media type',
  },
});
