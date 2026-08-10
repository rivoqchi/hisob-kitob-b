import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export type SyncPayload = {
  type: string;
  message: string;
  at: string;
  from?: string;
};

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  private readonly familyRoom: string;

  constructor(private readonly config: ConfigService) {
    this.familyRoom = this.config.get<string>('familyRoom') ?? 'family';
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /** Mijoz oila xonasiga qo‘shiladi — barcha sync shu yerda ketadi. */
  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket) {
    void client.join(this.familyRoom);
    return {
      ok: true,
      room: this.familyRoom,
      socketId: client.id,
    };
  }

  /** Engil latency tekshiruvi (demo). `ping` Socket.IO rezerv — shuning uchun boshqa nom. */
  @SubscribeMessage('latency:ping')
  handleLatencyPing(@MessageBody() body: { sentAt?: string } | undefined) {
    return {
      event: 'latency:pong',
      sentAt: body?.sentAt ?? null,
      serverAt: new Date().toISOString(),
    };
  }

  /**
   * Bir oila a’zosidan kelgan xabar — xonadagi qolganlarga yuboriladi.
   * Payload kichik saqlanadi (~10 client uchun qotmaydi).
   */
  @SubscribeMessage('sync')
  handleSync(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { message?: string; type?: string } | undefined,
  ) {
    const payload: SyncPayload = {
      type: body?.type ?? 'message',
      message: (body?.message ?? '').slice(0, 280),
      at: new Date().toISOString(),
      from: client.id,
    };

    client.to(this.familyRoom).emit('sync', payload);
    return { ok: true, payload };
  }

  /** REST yoki boshqa servislardan oilaga broadcast qilish uchun. */
  emitToFamily(payload: SyncPayload) {
    this.server.to(this.familyRoom).emit('sync', payload);
  }
}
