import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationDto } from './dto/location.dto';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}
  async addNewLocation(locationDto: LocationDto, userId: number) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const existingLocation = await this.prisma.userLocation.findFirst({
      where: {
        placeId: locationDto.place_id,
      },
    });
    if (existingLocation) {
      throw new HttpException('Location already exists', HttpStatus.CONFLICT);
    }
    const data = await this.prisma.userLocation.create({
      data: {
        latitude: locationDto.lat,
        longtitude: locationDto.lon,
        name: locationDto.name,
        displayName: locationDto.display_name,
        placeId: locationDto.place_id,
        userId: userId,
      },
    });
    return {
      id: data.id,
      place_id: data.placeId,
      lat: data.latitude,
      lon: data.longtitude,
      name: data.name,
      display_name: data.displayName,
    };
  }

  async getLocationByUserId(userId: number) {
    const existingUser = await this.prisma.user.findMany({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const data = await this.prisma.userLocation.findMany({
      where: {
        userId,
      },
    });
    return data.map((e) => ({
      id: e.id,
      place_id: e.placeId,
      lat: e.latitude,
      lon: e.longtitude,
      name: e.name,
      display_name: e.displayName,
    }));
  }
}
