import arcjet, { detectBot, shield } from '@/lib/arcjet';
import { base } from '../base';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { ArcjetNextRequest } from '@arcjet/next';

const buildStandardArcjet = () =>
  arcjet
    .withRule(
      shield({
        mode: 'LIVE',
      }),
    )
    .withRule(
      detectBot({
        mode: 'LIVE',
        allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW', 'CATEGORY:MONITOR'],
      }),
    );

export const standardSecurityMiddleware = base
  .$context<{
    request: Request | ArcjetNextRequest;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decidedArcjet = await buildStandardArcjet().protect(context.request, {
      userId: context.user.id,
    });

    if (decidedArcjet.isDenied()) {
      if (decidedArcjet.reason.isBot()) {
        throw errors.FORBIDDEN({
          message: 'Bot detected',
        });
      }

      if (decidedArcjet.reason.isShield()) {
        throw errors.FORBIDDEN({
          message: 'Request blocked by security policy (WAF)',
        });
      }

      throw errors.FORBIDDEN({
        message: 'Request blocked by security policy',
      });
    }

    return next();
  });
