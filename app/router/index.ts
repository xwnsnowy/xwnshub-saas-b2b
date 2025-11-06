import { createWorkspace, listWorkspaces } from './workspace';
import { createChannel, listChannels } from './channel';
import { createMessageChannel } from './message';

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
  },

  channel: {
    create: createChannel,
    list: listChannels,
  },

  message: {
    create: createMessageChannel,
  },
};
