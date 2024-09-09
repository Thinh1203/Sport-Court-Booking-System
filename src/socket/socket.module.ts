import { forwardRef, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketController } from './socket.controller';
import { CourtModule } from 'src/court/court.module';

@Module({
  providers: [SocketService],
  controllers: [SocketController],
  imports: [
    forwardRef(() => CourtModule)
  ],
  exports: [SocketService]
})
export class SocketModule {}
