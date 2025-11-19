import { createWorkspace, listWorkspaces } from './workspace';
import { createChannel, getChannel, listChannels } from './channel';
import { createMessageChannel, listMessages } from './message';
import { inviteMember, listMembers } from './member';

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
    member: {
      list: listMembers,
      invite: inviteMember,
    },
  },

  channel: {
    create: createChannel,
    list: listChannels,
    get: getChannel,
  },

  message: {
    create: createMessageChannel,
    list: listMessages,
  },
};
