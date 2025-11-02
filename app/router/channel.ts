import { channelNameSchema } from '@/schemas/channel';
import { heavyWriteSecurityMiddleware } from '../middlewares/arcjet/heavy-write';
import { standardSecurityMiddleware } from '../middlewares/arcjet/standard';
import { requiredAuthMiddleware } from '../middlewares/auth';
import { base } from '../middlewares/base';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace';
import prisma from '@/lib/db';
import z from 'zod';
import { Channel } from '@/lib/generated/prisma/client';
import { init, organization_user, Organizations } from '@kinde/management-api-js';
import { KindeOrganization } from '@kinde-oss/kinde-auth-nextjs';

export const createChannel = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(heavyWriteSecurityMiddleware)
  .route({
    method: 'POST',
    path: '/channels',
    summary: 'Create a new channel',
    tags: ['channels'],
  })
  .input(channelNameSchema)
  .output(z.custom<Channel>())
  .handler(async ({ input, context }) => {
    const channel = await prisma.channel.create({
      data: {
        name: input.name,
        workspaceId: context.workspace.orgCode,
        createdById: context.user.id,
      },
    });

    return channel;
  });

export const listChannels = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: 'GET',
    path: '/channels',
    summary: 'List channels',
    tags: ['channels'],
  })
  .input(z.void())
  .output(
    z.object({
      channels: z.array(z.custom<Channel>()),
      members: z.array(z.custom<organization_user>()),
      currentWorkspace: z.custom<KindeOrganization<unknown>>(),
    }),
  )
  .handler(async ({ context }) => {
    const [channels, members] = await Promise.all([
      prisma.channel.findMany({
        where: {
          workspaceId: context.workspace.orgCode,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      (async () => {
        await init();
        const usersInOrg = await Organizations.getOrganizationUsers({
          orgCode: context.workspace.orgCode,
          sort: 'name_asc',
        });
        return usersInOrg.organization_users ?? [];
      })(),
    ]);

    return {
      channels,
      members,
      currentWorkspace: context.workspace,
    };
  });
