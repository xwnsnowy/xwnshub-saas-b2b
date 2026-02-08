import aj, { detectBot, sensitiveInfo, shield, slidingWindow } from '@/lib/arcjet';
import { base } from '../base';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { ArcjetNextRequest } from '@arcjet/next';

const buildAIAj = () =>
  aj
    .withRule(
      shield({
        mode: 'LIVE',
      }),
    )
    .withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: 3,
      }),
    )
    .withRule(
      detectBot({
        mode: 'LIVE',
        allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
      }),
    )
    .withRule(
      sensitiveInfo({
        mode: 'LIVE',
        deny: ['CREDIT_CARD_NUMBER', 'PHONE_NUMBER', 'EMAIL'],
      }),
    );

export const aiSecurityMiddleware = base
  .$context<{
    request: Request | ArcjetNextRequest;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decidedArcjet = await buildAIAj().protect(context.request, {
      userId: context.user.id,
    });

    if (decidedArcjet.isDenied()) {
      if (decidedArcjet.reason.isSensitiveInfo()) {
        throw errors.RATE_LIMITED({
          message: 'Request contains sensitive information and cannot be processed.',
        });
      }

      if (decidedArcjet.reason.isRateLimit()) {
        throw errors.FORBIDDEN({
          message: 'Too many requests. Please try again later.',
        });
      }

      if (decidedArcjet.reason.isBot()) {
        throw errors.FORBIDDEN({
          message: 'Request blocked due to bot detection.',
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

//   Luồng hoạt động: Khi một request đến, middleware gọi Arcjet để kiểm tra. Nếu pass, tiếp tục; nếu fail, throw lỗi với thông báo cụ thể.
// Lý do sử dụng: Bảo vệ chống bot, rate limiting, WAF, và sensitive info trong ứng dụng B2B AI SaaS, đảm bảo an toàn cho user và hệ thống.
// Lưu ý: Code sử dụng TypeScript, tích hợp với Next.js và Kinde Auth. Nếu cần sửa đổi, hãy đảm bảo test kỹ trong môi trường LIVE để tránh block hợp lệ. Nếu bạn có câu hỏi cụ thể về phần nào, hãy hỏi!
