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

    private toRad(Value: number): number {
        return Value * Math.PI / 180;
    }
    private calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        let R = 6371; 
        let dLat = this.toRad(lat2-lat1);
        let dLon = this.toRad(lon2-lon1);
        let newLat1 = this.toRad(lat1);
        let newLat2 = this.toRad(lat2);
        let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(newLat1) * Math.cos(newLat2); 
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        let d = R * c;
        return d;
    }

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

    async getAllSportsCenter(query: SportsCenterFilterDto): Promise<any> {
        const items_per_page = query.items_per_page || 10;
        const page = Number(query.page) || 1;
        const skip = (page - 1) * items_per_page;
    
        let listSportsCenter: any[];
        let count: number;
    
        if (query.latitude !== undefined && query.longtitude !== undefined) {            
            const allCenters = await this.prisma.theSportsCenter.findMany({ 
                where: { isDeleted: false },
                include: {
                    openingHour: true,
                    headquarters: true,
                    // theSportCenterCourt: {
                    //     include: {
                    //         category: true
                    //     }
                    // },
                    theSportsCenterImages: true
                } 
            });

            listSportsCenter = allCenters
            .map(center => {
                const distance = this.calcDistance(query.latitude, query.longtitude, center.latitude, center.longtitude);
                return { ...center, distance }; 
            })
            .filter(center => center.distance <= 5).slice(skip, skip + items_per_page); 
            count = listSportsCenter.length;
        } else {
                
        const searchCondition: any = query.search ? {
            name: {
                contains: query.search,
                mode: 'insensitive'
            }
        } : {};
            listSportsCenter = await this.prisma.theSportsCenter.findMany({
                take: items_per_page,
                skip,
                where: {
                    isDeleted: false,
                    ...searchCondition
                },
                include: {
                    headquarters: true,
                    openingHour: true,
                    // theSportCenterCourt: true,
                    theSportsCenterImages: true
                }
            });
            count = await this.prisma.theSportsCenter.count({
                where: {
                    isDeleted: false,
                    ...searchCondition
                }
            });
        }
        
    
        const lastPage = Math.ceil(count / items_per_page);
        const previousPage = page - 1 < 1 ? null : page - 1;
        const nextPage = page + 1 > lastPage ? null : page + 1;
    
        return {
            data: listSportsCenter,
            currentPage: page,
            lastPage,
            previousPage,
            nextPage,
            total: count
        };
    }
    
    async getOneById (id: number): Promise<any> {
        const existingSportsCenter = await this.prisma.theSportsCenter.findFirst({
            where: {id}
        });
        if (!existingSportsCenter) {
            throw new HttpException('The Sports Center not found', HttpStatus.NOT_FOUND);
        }
        return existingSportsCenter;
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
              isDeleted: data.isDeleted ?? existingSportsCenter.isDeleted,
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
