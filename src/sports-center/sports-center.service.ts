import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SportsCenterDto } from './dto/sports-center.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FilterByCommentDto, SportsCenterFilterDto } from './dto/sports-center.filter.dto';
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

    async countCommentsByUser(userId: number): Promise<number> {
        const count = await this.prisma.comment.count({
            where: {
                userId: userId,
            },
        });
        return count;
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
                    // openingHour: true,
                    headquarters: true,
                    theSportCenterCourt: {
                        ...(query.fromPrice && query.toPrice ? {
                            where: {
                                price: {
                                    gte: Number(query.fromPrice),
                                    lte: Number(query.toPrice)
                                }
                            }
                        } : {}),
                        include: {
                            category: true
                        }
                    },
                    theSportsCenterImages: true
                } 
            });

            listSportsCenter = allCenters
            .map(center => {
                const distance = this.calcDistance(query.latitude, query.longtitude, center.latitude, center.longtitude);
                return { ...center, distance }; 
            })
            .filter(center => (center.distance <= 5 && center.theSportCenterCourt.length > 0)).slice(skip, skip + items_per_page); 
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
                    ...searchCondition,
                    ...(query.fromPrice && query.toPrice ? {
                        theSportCenterCourt: {
                            some: {
                                price: {
                                    gte: Number(query.fromPrice),
                                    lte: Number(query.toPrice)
                                }
                            }
                        }
                    } : {})
                    
                },
                include: {
                    headquarters: true,
                    openingHour: true,
                    theSportCenterCourt: true,
                    theSportsCenterImages: true
                }
            });
            count = await this.prisma.theSportsCenter.count({
                where: {
                    isDeleted: false,
                    ...searchCondition,
                    ...(query.fromPrice && query.toPrice ? {
                        theSportCenterCourt: {
                            some: {
                                price: {
                                    gte: Number(query.fromPrice),
                                    lte: Number(query.toPrice)
                                }
                            }
                        }
                    } : {})
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
    

    async getOneById (id: number, query: FilterByCommentDto): Promise<any> {        
        const existingSportsCenter = await this.prisma.theSportsCenter.findFirst({
            where: {id},
            include: {
                theSportCenterCourt: {
                    include: {
                        comments: {
                            include: {
                                court: {
                                    select: {
                                        name: true,
                                    }
                                },
                                user: {
                                    select: {
                                        fullName: true,
                                        avatar: true,
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                }

            }
        });
        if (!existingSportsCenter) {
            throw new HttpException('The Sports Center not found', HttpStatus.NOT_FOUND);
        }
        
        const starCounts = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };
        const nowDate = new Date();
        const userCommentCounts = new Map<number, number>();
        let total: number = 0;
        let numberOfStart: number = 0;

        existingSportsCenter.theSportCenterCourt.forEach(e => {
            e.comments.forEach(comment => {
                if (comment.star >= 1 && comment.star <= 5) {
                    starCounts[comment.star]++;
                }
                total++
                const userId = comment.user.id;
                if (!userCommentCounts.has(userId)) {
                    userCommentCounts.set(userId, 0);
                }
                userCommentCounts.set(userId, userCommentCounts.get(userId) + 1);
            });
        });
        for (let i in starCounts) {
            numberOfStart += Number(i) * starCounts[i];
        }
        let averageStart = numberOfStart > 0 ? numberOfStart / total : 0;
        
        if (query.createdAt !== undefined || query.isImage !== undefined || query.isYou !== undefined) {
            const filterConditions: any = {
                where: {
                    id
                },
                include: {
                    theSportCenterCourt: {
                        include: {
                            comments: {
                                ...(query.createdAt ? {
                                    orderBy: {
                                        createdAt: "asc"
                                    }
                                } : {}),
                                ...(query.isImage ? {
                                    where: {
                                        imageUrl: { not: null }
                                    }
                                } : {}),
                                ...(query.isYou ? {
                                    where: {
                                        userId: Number(query.isYou)
                                    }
                                } : {}),
                                include: {
                                    court: {
                                        select: {
                                            name: true,
                                        }
                                    },
                                    user: {
                                        select: {
                                            fullName: true,
                                            avatar: true,
                                            id: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
    
            const result = await this.prisma.theSportsCenter.findFirst(filterConditions);
            return {
                result,
                starCounts,
                averageStart,
                total
            }
        }
     
        const result = {
            id: existingSportsCenter.id,
            name: existingSportsCenter.name,
            address: existingSportsCenter.address,
            status: existingSportsCenter.status,
            view: existingSportsCenter.view,
            isDeleted: existingSportsCenter.isDeleted,
            latitude: existingSportsCenter.latitude,
            longtitude: existingSportsCenter.longtitude,
            theSportCenterCourt: existingSportsCenter.theSportCenterCourt.map(e => {  
                return {
                id: e.id,
                name: e.name,
                price: e.price,
                discount: e.discount,
                isDeleted: e.isDeleted,
                imageUrl: e.imageUrl,
                time: e.time,
                courtCloudinaryId: e.courtCloudinaryId,
                isVip: e.isVip,
                attributes: e.attributes,
                flagTime: e.flagTime,
                maximumTime: e.maximumTime,
                comment: e.comments.map(comment => {
                    const timeDiff = nowDate.getTime() - new Date(comment.createdAt).getTime();
                    const timeInHours = Math.floor(timeDiff / (1000 * 60 * 60));
                    const timeInMinutes = Math.floor(timeDiff / (1000 * 60));
                    return {
                    id: comment.id,
                    start: comment.star,
                    text: comment.text,
                    image: comment.imageUrl,
                    commentImageCloudinaryId: comment.commentImageCloudinaryId,
                    timeInHours: timeInHours,
                    timeInMinutes: timeInMinutes,
                    court: comment.court.name,
                    user: comment.user.fullName,
                    userId: comment.user.id,
                    avatar: comment.user.avatar,
                    commentCount: userCommentCounts.get(comment.user.id) || 0
                }}),
            }}),
            starCounts,
            averageStart,
            total
        }
        return result;
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