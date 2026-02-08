import arcjet, { slidingWindow } from '@/lib/arcjet';
import { base } from '../base';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { ArcjetNextRequest } from '@arcjet/next';

const buildStandardArcjet = () =>
  arcjet.withRule(
    slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: 180,
    }),
  );

export const readSecurityMiddleware = base
  .$context<{
    request: Request | ArcjetNextRequest;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decidedArcjet = await buildStandardArcjet().protect(context.request, {
      userId: context.user.id,
    });

    if (decidedArcjet.isDenied()) {
      if (decidedArcjet.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: 'Too many requests. Please try again later.',
        });
      }

      throw errors.FORBIDDEN({
        message: 'Request blocked by security policy',
      });
    }

    return next();
  });
