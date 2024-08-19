import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookingService {
    constructor (
        private readonly prisma: PrismaService
    ) {}

    async createdBooking (): Promise<any> {
        
    }
}
