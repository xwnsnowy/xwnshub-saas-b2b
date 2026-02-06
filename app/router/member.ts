import { inviteMemberSchema } from '@/schemas/member';
import { heavyWriteSecurityMiddleware } from '../middlewares/arcjet/heavy-write';
import { standardSecurityMiddleware } from '../middlewares/arcjet/standard';
import { requiredAuthMiddleware } from '../middlewares/auth';
import { base } from '../middlewares/base';
import { requiredWorkspaceMiddleware } from '../middlewares/workspace';
import z from 'zod';
import { init, organization_user, Organizations, Users } from '@kinde/management-api-js';
import { getAvatar } from '@/lib/get-avatar';
import { readSecurityMiddleware } from '../middlewares/arcjet/read';

export const inviteMember = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(heavyWriteSecurityMiddleware)
  .route({
    method: 'POST',
    path: '/member',
    summary: 'Invite a member to the workspace',
    tags: ['member'],
  })
  .input(inviteMemberSchema)
  .output(z.void())
  .handler(async ({ input, context, errors }) => {
    try {
      init();

      await Users.createUser({
        requestBody: {
          organization_code: context.workspace!.orgCode,
          profile: {
            given_name: input.name,
            picture: getAvatar(null, input.email),
          },
          identities: [
            {
              type: 'email',
              details: {
                email: input.email,
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error('Invite member error:', error);
      throw errors.INTERNAL_SERVER_ERROR();
    }
  });

export const listMembers = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: 'GET',
    path: '/member',
    summary: 'List members',
    tags: ['member'],
  })
  .input(z.void())
  .output(z.array(z.custom<organization_user>()))
  .handler(async ({ context, errors }) => {
    try {
      init();

      const members = await Organizations.getOrganizationUsers({
        orgCode: context.workspace!.orgCode,
        sort: 'id_desc',
      });

      if (!members.organization_users) {
        throw errors.NOT_FOUND();
      }

      return members.organization_users;
    } catch (error) {
      console.error('List members error:', error);
      throw errors.INTERNAL_SERVER_ERROR();
    }
  });
