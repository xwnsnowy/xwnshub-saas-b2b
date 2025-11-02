import { createWorkspace, listWorkspaces } from './workspace';
import { createChannel, listChannels } from './channel';

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
  },

  channel: {
    create: createChannel,
    list: listChannels,
  },
};
