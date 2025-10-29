import { KindeOrganization, KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import z from 'zod';
import { base } from '../middlewares/base';
import { requiredAuthMiddleware } from '../middlewares/auth';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace';
import { workspaceSchema } from '@/schemas/workspace';
import { init, Organizations } from '@kinde/management-api-js';

export const listWorkspaces = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: 'GET',
    path: '/workspace',
    summary: 'List workspaces',
    tags: ['workspace'],
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string(),
        }),
      ),
      user: z.custom<KindeUser<Record<string, unknown>>>(),
      currentWorkspace: z.custom<KindeOrganization<unknown>>(),
    }),
  )
  .handler(async ({ context, errors }) => {
    const { getUserOrganizations } = getKindeServerSession();

    const organizations = await getUserOrganizations();
    // console.log(organizations);
    if (!organizations) {
      throw errors.FORBIDDEN();
    }

    return {
      workspaces: organizations.orgs.map((org) => ({
        id: org.code,
        name: org.name ?? 'My Workspace',
        avatar: org.name?.charAt(0) ?? 'T',
      })),
      user: context.user,
      currentWorkspace: context.workspace,
    };
  });

export const createWorkspace = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: 'POST',
    path: '/workspace',
    summary: 'Create a workspace',
    tags: ['workspace'],
  })
  .input(workspaceSchema)
  .output(
    z.object({
      orgCode: z.string(),
      workspaceName: z.string(),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    init();

    let data;

    try {
      data = await Organizations.createOrganization({
        requestBody: {
          name: input.name,
        },
      });
    } catch (error) {
      throw errors.INTERNAL_SERVER_ERROR();
    }

    if (!data.organization?.code) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: 'Organization code not found',
      });
    }

    try {
      await Organizations.addOrganizationUsers({
        orgCode: data.organization.code,
        requestBody: {
          users: [
            {
              id: context.user.id,
              roles: ['admin'],
            },
          ],
        },
      });
    } catch {
      throw errors.INTERNAL_SERVER_ERROR();
    }

    const { refreshTokens } = getKindeServerSession();

    await refreshTokens();

    return {
      orgCode: data.organization.code,
      workspaceName: input.name,
    };
  });
