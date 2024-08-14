import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AmenityDto } from './dto/amenity.dto';
import { AmenityData } from './dto/data-update';

@Injectable()
export class AmenityService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async createAmenity (amenityDto: AmenityDto, file: Express.Multer.File): Promise<any> {
        const existingItem = await this.prisma.amentity.findFirst({
            where: {
                name: {
                    contains: amenityDto.name,
                    mode: 'insensitive'
                }
            },
        });
        if (existingItem) {
            throw new HttpException ('Item already exists', HttpStatus.CONFLICT);
        }
        const imageUpload = await this.cloudinaryService.uploadFile(file, 100, 100);
        return await this.prisma.amentity.create({
            data: {
                name: amenityDto.name,
                description: amenityDto.description,
                imageUrl: imageUpload.secure_url,
                amentityCloudinaryId: imageUpload.public_id
            }
        });
    }

    async getAll (): Promise<any> {
        return await this.prisma.amentity.findMany();
    }

    async getOneById (id: number): Promise<any> {
        const existingItem = await this.prisma.amentity.findFirst({
            where: {
                id
            }
        });
        if (!existingItem) {
            throw new HttpException ('Item not found', HttpStatus.NOT_FOUND);
        }
        return existingItem;
    }

    async updateById (id: number, amenityData: AmenityData, file: Express.Multer.File | null): Promise<any> {
        const existingItem = await this.prisma.amentity.findFirst({
            where: {
                id
            }
        });
        if (!existingItem) {
            throw new HttpException ('Item not found', HttpStatus.NOT_FOUND);
        }
        if(file !== null) {
            await this.cloudinaryService.deleteFile(existingItem.amentityCloudinaryId);
            const newFile = await this.cloudinaryService.uploadFile(file, 100, 100);
            return await this.prisma.amentity.update({
                where: {
                    id
                },
                data: {
                    name: amenityData.name ?? existingItem.name,
                    description: amenityData.description ?? existingItem.description,
                    imageUrl: newFile.secure_url,
                    amentityCloudinaryId: newFile.public_id
                }
            }) ;
        }
        return await this.prisma.amentity.update({
            where: {
                id
            },
            data: {
                name: amenityData.name ?? existingItem.name,
                description: amenityData.description ?? existingItem.description
            }
        });
    }   

    async deleteById (id: number): Promise<any> {
        const existingItem = await this.prisma.amentity.findFirst({
            where: {
                id
            }
        });
        if (!existingItem) {
            throw new HttpException ('Item not found', HttpStatus.NOT_FOUND);
        }
        return await this.prisma.amentity.delete({
            where: {
                id
            }
        });
    }
}
