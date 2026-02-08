// index.ts

import {
  ChannelEventSchema,
  PresenceMessageSchema,
  ThreadEventSchema,
  UserSchema,
} from '@/schemas/realtime';
import { Connection, routePartykitRequest, Server } from 'partyserver';
import z from 'zod';

const ConnectStateSchema = z
  .object({
    user: UserSchema.nullable().optional(),
  })
  .nullable();

type ConnectionState = z.infer<typeof ConnectStateSchema>;

type Message = z.infer<typeof PresenceMessageSchema>;

// Define your Server
export class Chat extends Server {
  static options = {
    hibernate: true,
  };

  onConnect(connection: Connection) {
    console.log('Connected', connection.id, 'to server', this.name);

    connection.send(JSON.stringify(this.getPresenceMessage()));
  }

  onClose(connection: Connection) {
    console.log('Connection closed', connection.id, 'from server', this.name);

    this.updateUsers();
  }

  onError(connection: Connection) {
    console.error('Error on connection', connection.id, 'from server', this.name);

    this.updateUsers();
  }

  onMessage(connection: Connection, message: string) {
    try {
      const parsed = JSON.parse(message);

      const presence = PresenceMessageSchema.safeParse(parsed);

      if (presence.success) {
        if (presence.data.type === 'add-user') {
          //store user info on the connection
          this.setConnectionState(connection, { user: presence.data.payload });

          //broadcast updated presence to all clients
          this.updateUsers();

          return;
        }
        if (presence.data.type === 'remove-user') {
          //remove user info from the connection
          this.setConnectionState(connection, { user: null });

          this.updateUsers();

          return;
        }
      }

      const channelEvent = ChannelEventSchema.safeParse(parsed);

      if (channelEvent.success) {
        const payload = JSON.stringify(channelEvent.data);

        this.broadcast(payload, [connection.id]);
        return;
      }

      //Thread events
      const threadEvent = ThreadEventSchema.safeParse(parsed);

      if (threadEvent.success) {
        const payload = JSON.stringify(threadEvent.data);

        this.broadcast(payload, [connection.id]);
        return;
      }
    } catch {
      console.error('Failed to parse message:', message);
      return;
    }

    // console.log('Message from', connection.id, ':', message);
    // // Send the message to every other connection
    // this.broadcast(message, [connection.id]);
  }

  updateUsers() {
    const presenceMessage = JSON.stringify(this.getPresenceMessage());

    this.broadcast(presenceMessage);
  }

  getPresenceMessage() {
    return {
      type: 'presence',
      payload: {
        users: this.getUser(),
      },
    } satisfies Message;
  }

  getUser() {
    const users = new Map();

    for (const connection of this.getConnections()) {
      const state = this.getConnectionState(connection);

      if (state?.user) {
        users.set(state.user.id, state.user);
      }
    }

    return Array.from(users.values());
  }

  private setConnectionState(connection: Connection, state: ConnectionState) {
    connection.setState(state);
  }

  private getConnectionState(connection: Connection): ConnectionState {
    const result = ConnectStateSchema.safeParse(connection.state);
    if (!result.success) {
      throw new Error('Invalid connection state');
    }
    return result.data;
  }
}

export default {
  // Set up your fetch handler to use configured Servers
  async fetch(request: Request, env: Env): Promise<Response> {
    return (await routePartykitRequest(request, env)) || new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
