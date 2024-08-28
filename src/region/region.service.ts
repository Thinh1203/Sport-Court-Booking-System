import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegionDto } from './dto/region.dto';
import { UpdateRegionData } from './dto/update-region.dto';

@Injectable()
export class RegionService {
    constructor (
        private readonly prisma: PrismaService
    ) {}

    async createRegion(regionDto: RegionDto) {
        const existingRegion = await this.prisma.region.findFirst({
            where: {
                countryCode: {
                    contains: regionDto.name,
                    mode: 'insensitive'
                }
            }
        });

        if (existingRegion) {
            throw new HttpException('Region already exists', HttpStatus.CONFLICT);
        }
        return await this.prisma.region.create({
            data: {
                name: regionDto.name,
                type: regionDto.type,
                countryCode: regionDto.countryCode
            }
        });
    }

    async getAll(){
        return await this.prisma.region.findMany();
    } 

    async getOneById(id: number) {
        const existingRegion = await this.prisma.region.findUnique({
            where: {id}
        });

        if (!existingRegion) {
            throw new HttpException('Region not found', HttpStatus.NOT_FOUND);
        }

        return existingRegion;
    }

    async updateOneById(id: number, data: UpdateRegionData) {
        const existingRegion = await this.prisma.region.findUnique({
            where: {id}
        });

        if (!existingRegion) {
            throw new HttpException('Region not found', HttpStatus.NOT_FOUND);
        }

        return await this.prisma.region.update({
            where: {
                id
            },
            data: {
                name: data.name ?? existingRegion.name,
                type: data.type ?? existingRegion.type,
                countryCode: data.countryCode ?? existingRegion.countryCode
            }
        });
    }
}
