import { createWorkspace, listWorkspaces } from './workspace';
import { createChannel } from './channel';

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
  },

  channel: {
    create: createChannel,
  },
};
