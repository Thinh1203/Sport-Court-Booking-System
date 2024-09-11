import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationDto } from './dto/location.dto';

@Injectable()
export class LocationService {
    constructor(
        private readonly prisma: PrismaService
    ) {}
    // async addNewLocation(locationDto: LocationDto, userId: number) {
    //     const existingLocation = await this.prisma.userLocation()
    // }
}
