import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CourtService } from 'src/court/court.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class SocketService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => CourtService))
    private readonly courtService: CourtService,
  ) {}

  @SubscribeMessage('joinCourtChannel')
  async handleJoinCourtChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { courtId: number; date: string },
  ) {
    // const oldChannels = Array.from(socket.rooms);
    // oldChannels.forEach((channel) => socket.leave(channel));
    
    const channelName = `court-${data.courtId}-${data.date}`;

    socket.join(channelName);

    const availableTimes = await this.courtService.getOneById(
      data.courtId,
      data.date,
    );
    this.server.to(channelName).emit('courtData', availableTimes);
  }

  afterInit(socket: Socket) {}

  handleConnection(socket: Socket) {
    console.log('User connected:', socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log('User disconnected:', socket.id);
  }
}
