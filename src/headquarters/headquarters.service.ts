import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HeadquartersDto } from './dto/headquarters.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { headquartersDataUpdate } from './dto/update/data-update.dto';

@Injectable()
export class HeadquartersService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async createHeadquarters (headquartersDto: HeadquartersDto, file: Express.Multer.File): Promise<any> {
        const existingHeadquarters = await this.prisma.headquarters.findFirst({
            where: {
                name: headquartersDto.name
            }
        });

        if (existingHeadquarters) {
            throw new HttpException('Headquarters already exists', HttpStatus.CONFLICT);
        }

        const fileUpload = await this.cloudinaryService.uploadFile(file, 300, 300);
        return await this.prisma.headquarters.create({
            data: {
                name: headquartersDto.name,
                description: headquartersDto.description,
                imageUrl: fileUpload.secure_url,
                imageCloudinaryId: fileUpload.public_id
            }
        });
    }

    async updateById (id: number, headquartersData: headquartersDataUpdate, file: Express.Multer.File | null): Promise<any> {
        const existingHeadquarters = await this.prisma.headquarters.findFirst({
            where: {id}
        });

        if (!existingHeadquarters) {
            throw new HttpException('The headquarters not found', HttpStatus.NOT_FOUND);
        }

        if (file != null) {
            await this.cloudinaryService.deleteFile(existingHeadquarters.imageCloudinaryId);
            const fileUpload = await this.cloudinaryService.uploadFile(file, 300, 300);
            return await this.prisma.headquarters.update({
                where: {
                    id
                },
                data: {
                    name: headquartersData.name ?? existingHeadquarters.name,
                    description: headquartersData.description ?? existingHeadquarters.description,
                    imageUrl: fileUpload.secure_url,
                    imageCloudinaryId: fileUpload.public_id
                }
            });
        }
        return await this.prisma.headquarters.update({
            where: {
                id
            },
            data: {
                name: headquartersData.name ?? existingHeadquarters.name,
                description: headquartersData.description ?? existingHeadquarters.description
            }
        }); 
    }

    async getAll (): Promise<any> {
        return await this.prisma.headquarters.findMany();
    }

    async getOneById (id: number): Promise<any> {
        const existingHeadquarters = await this.prisma.headquarters.findFirst({
            where: {id}
        });

        if (!existingHeadquarters) {
            throw new HttpException('The headquarters not found', HttpStatus.NOT_FOUND);
        }
        return existingHeadquarters;
    }
}
