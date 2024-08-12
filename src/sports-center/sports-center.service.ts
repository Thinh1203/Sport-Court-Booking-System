import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SportsCenterDto } from './dto/sports-center.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { SportsCenterFilterDto } from './dto/sports-center.filter.dto';
import { SportsCenterDataDto } from './dto/update/data.dto';

@Injectable()
export class SportsCenterService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly cloudService: CloudinaryService
    ) {}

    async createSportsCenter (sportsCenterDto: SportsCenterDto, files: Express.Multer.File[]): Promise <any> {
        const latitude = parseFloat(sportsCenterDto.latitude.toString());
        const longtitude = parseFloat(sportsCenterDto.longtitude.toString());                
        const existingSportsCenter =  await this.prisma.theSportsCenter.findFirst({
            where: {
                AND: [
                    {
                        latitude: {
                            equals: latitude
                        }
                    },
                    {
                        longtitude: {
                            equals: longtitude
                        }
                    }
                ]
            }
        });
        if (existingSportsCenter) {
            throw new HttpException ( 'Sports Center already exists', HttpStatus.CONFLICT);
        }
        const newSportsCenter = await this.prisma.theSportsCenter.create({
            data: {
                name: sportsCenterDto.name,
                address: sportsCenterDto.address,
                latitude: latitude,
                longtitude: longtitude
            }
        });
                
        await Promise.all(
            sportsCenterDto.openingHour.map(hour => 
                this.prisma.openingHour.create({
                    data: {
                        sportsCenterId: newSportsCenter.id,
                        dayOfWeek: Number(hour.dayOfWeek),
                        openingTime: hour.openingTime,
                        closingTime: hour.closingTime
                    }
                })
            )
        );

        const uploadImages = files.map(element => this.cloudService.uploadFile(element, 300, 300));
        const uploadResults = await Promise.all(uploadImages);
                       
        await Promise.all(
            uploadResults.map(result => 
                this.prisma.theSportsCenterImages.create({
                    data: {
                        imageUrl: result.secure_url,
                        theSportsCenterId: newSportsCenter.id,
                        sportsCenterCloudinaryId: result.public_id
                    }
                })
            )
        );
        return newSportsCenter;
    }

    async getAllSportsCenter (query: SportsCenterFilterDto): Promise<any> {
        const items_per_page = query.items_per_page || 10;
        const page = Number(query.page) || 1;
        const skip = (page - 1) * items_per_page;
           
        const searchCondition: any = query.search ? {
            name: {
                contains: query.search,
                mode: 'insensitive' 
            }
        } : {};

        const listSportsCenter = this.prisma.theSportsCenter.findMany({
            take: items_per_page,
            skip,
            where: {
                isDeleted: false,
                ...searchCondition
            }
        });
        const count = this.prisma.theSportsCenter.count({
            where: {
                isDeleted: false
            }
        });
        const [data, total] = await Promise.all([listSportsCenter, count]);

        const lastPage = Math.ceil(total / items_per_page);
        const previousPage = page - 1 < 1 ? null : page - 1;
        const nextPage = page + 1 > lastPage ? null : page + 1;
        return {
            data,
            currentPage: page,
            lastPage,
            previousPage,
            nextPage,
            total
        };
    }

    async updateSportsCenterInformation (id: number, data: SportsCenterDataDto) {
        const existingSportsCenter = await this.prisma.theSportsCenter.findFirst({
            where: {id}
        });
        if (!existingSportsCenter) {
            throw new HttpException('The Sports Center not found', HttpStatus.NOT_FOUND);
        }
        let updateView : number = 0;
        if (data.view > 0) {
            updateView = existingSportsCenter.view + data.view;
        }
        return await this.prisma.theSportsCenter.update({
            where: {
                id
            },
            data: {
              name: data.name ?? existingSportsCenter.name,
              address: data.address ?? existingSportsCenter.address,
              status: data.status ?? existingSportsCenter.status,
              view: updateView ?? existingSportsCenter.view,
              latitude: data.latitude ?? existingSportsCenter.latitude,
              longtitude: data.longtitude ?? existingSportsCenter.longtitude
            }
        });
    }

    async deleteSportsCenter (id : number) {
        const existingSportsCenter = await this.prisma.theSportsCenter.findFirst({
            where: {id}
        });
        if (!existingSportsCenter) {
            throw new HttpException('The Sports Center not found', HttpStatus.NOT_FOUND);
        }
        return await this.prisma.theSportsCenter.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        });
    }
}
