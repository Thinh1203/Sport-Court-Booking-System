import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CourtDto } from './dto/court.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { courtDataUpdate } from './dto/update/data-update';


@Injectable()
export class CourtService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async createNewCourt(courtDto: CourtDto, files: Express.Multer.File[]): Promise<any> {

        const existingCategory = await this.prisma.category.findFirst({
            where: {
                id: Number(courtDto.categoryId),
            },
        });

        if (!existingCategory) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }

        const existingSportsCenter = await this.prisma.theSportsCenter.findFirst({
            where: {
                id: Number(courtDto.sportsCenterId),
            },
        });

        if (!existingSportsCenter) {
            throw new HttpException('Sport center not found', HttpStatus.NOT_FOUND);
        }


        const uploadImages = files.map((element) => this.cloudinaryService.uploadFile(element, 300, 300));
        const uploadResults = await Promise.all(uploadImages);

    
        const newCourt = await this.prisma.court.create({
            data: {
                name: courtDto.name,
                price: Number(courtDto.price),
                sportsCenterId: existingSportsCenter.id,
                categoryId: existingCategory.id,
                attributes: courtDto.attributes ? JSON.parse(courtDto.attributes) : null,
                time: Number(courtDto.time),
                amenities: {
                    connect: courtDto.amenitiesIds.map((id: number) => ({ id })), 
                },
            },
        });

        // Tạo mới CourtImages
        await Promise.all(
            uploadResults.map((result) =>
                this.prisma.courtImages.create({
                    data: {
                        imageUrl: result.secure_url,
                        imageId: result.public_id,
                        courtId: newCourt.id,
                    },  
                }),
            ),
        );

        return newCourt; 
    }


    async getAll (): Promise<any> {
        const result = await this.prisma.court.findMany({
            include: {
                category: true,
                amenities: true,
                courtImages: true
                // sportsCenter: true
            }
        });
        const formattedResult = result.map(e => ({
            id: e.id,
            name: e.name,
            price: e.price,
            discount: e.discount,
            isDeleted: e.isDeleted,
            time: e.time,
            isVip: e.isVip,
            flagTime: e.flagTime,
            maximumTime: e.maximumTime,
            attributes: e.attributes,
            images: e.courtImages,
            category: {
                id: e.category.id,
                type: e.category.type,
                description: e.category.description,
                imageUrl: e.category.imageUrl,
                categoryCloudinaryId: e.category.categoryCloudinaryId,
                isDeleted: e.category.isDeleted
            },
            amenities: e.amenities.map(amenity => ({
                id: amenity.id,
                name: amenity.name,
                description: amenity.description,
                imageUrl: amenity.imageUrl,
                amentityCloudinaryId: amenity.amentityCloudinaryId
            })),
            // sportsCenter: {
            //     id: e.sportsCenter.id,
            //     name: e.sportsCenter.name,
            //     address: e.sportsCenter.address,
            //     status: e.sportsCenter.status,
            //     view: e.sportsCenter.view,
            //     isDeleted: e.sportsCenter.isDeleted,
            //     latitude: e.sportsCenter.latitude,
            //     longtitude: e.sportsCenter.longtitude
            // }
        }));
        return formattedResult
    }

    async getById (id: number): Promise<any> {
        const existingCourt = await this.prisma.court.findFirst(
            {
                where: {id},
                include: {
                    category: true, 
                    amenities: true,
                    booking: true,
                    courtImages: true,
                    sportsCenter: {
                        include: {
                            openingHour: true
                        }
                    }
                }
            },
    );  
        if (!existingCourt) {
            throw new HttpException('Court not found', HttpStatus.NOT_FOUND);
        }
        return existingCourt;
    }

    async updateById(id: number, data: courtDataUpdate, files: Express.Multer.File[] | null): Promise<any> {
        const existingCourt = await this.prisma.court.findFirst({
            where: { id },
            include: {
                amenities: true,
                category: true,
                sportsCenter: true,
                courtImages: true,
            },
        });

        if (!existingCourt) {
            throw new HttpException('Court not found', HttpStatus.NOT_FOUND);
        }

        const amenitiesToSet = data?.amenities
            ? data.amenities.map(id => ({ id }))
            : existingCourt.amenities.map(a => ({ id: a.id }));

        const oldImageIds = existingCourt.courtImages.map(image => image.imageId);
        
        await Promise.all(
            oldImageIds.map(imageId => this.cloudinaryService.deleteFile(imageId))
        );
     
        let newImageUrls = [];
        if (files && files.length > 0) {
            newImageUrls = await Promise.all(
                files.map(async (file) => {
                    const uploadResult = await this.cloudinaryService.uploadFile(file, 300, 300);
                    return {
                        imageUrl: uploadResult.secure_url,
                        imageId: uploadResult.public_id,
                    };
                })
            );
        }

      
        return await this.prisma.court.update({
            where: { id },
            data: {
                name: data.name ?? existingCourt.name,
                price: data.price ?? existingCourt.price,
                time: data.time ?? existingCourt.time,
                discount: data.discount ?? existingCourt.discount,
                isDeleted: data.isDeleted ?? existingCourt.isDeleted,
                isVip: data.isVip ?? existingCourt.isVip,
                attributes: data.attributes ?? existingCourt.attributes,
                categoryId: data.categoryId ?? existingCourt.category.id,
                amenities: {
                    set: amenitiesToSet,
                },
                courtImages: {
                    deleteMany: {},
                    create: newImageUrls.map(image => ({ 
                        imageUrl: image.imageUrl,
                        imageId: image.imageId 
                    })), 
                },
            },
        });
    }
}
