import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SportsCenterDto } from './dto/sports-center.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  FilterByCommentDto,
  SportsCenterFilterDto,
} from './dto/sports-center.filter.dto';
import { SportsCenterDataDto } from './dto/update/data.dto';

@Injectable()
export class SportsCenterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudService: CloudinaryService,
  ) {}

  private toRad(Value: number): number {
    return (Value * Math.PI) / 180;
  }
  private calcDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    let R = 6371;
    let dLat = this.toRad(lat2 - lat1);
    let dLon = this.toRad(lon2 - lon1);
    let newLat1 = this.toRad(lat1);
    let newLat2 = this.toRad(lat2);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(newLat1) *
        Math.cos(newLat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

  async createSportsCenter(
    sportsCenterDto: SportsCenterDto,
    files: Express.Multer.File[],
  ): Promise<any> {
    const latitude = parseFloat(sportsCenterDto.latitude.toString());
    const longtitude = parseFloat(sportsCenterDto.longtitude.toString());
    const existingSportsCenter = await this.prisma.theSportsCenter.findFirst({
      where: {
        AND: [
          {
            latitude: {
              equals: latitude,
            },
          },
          {
            longtitude: {
              equals: longtitude,
            },
          },
        ],
      },
    });
    if (existingSportsCenter) {
      throw new HttpException(
        'Sports Center already exists',
        HttpStatus.CONFLICT,
      );
    }
    const newSportsCenter = await this.prisma.theSportsCenter.create({
      data: {
        name: sportsCenterDto.name,
        address: sportsCenterDto.address,
        latitude: latitude,
        longtitude: longtitude,
      },
    });

    await Promise.all(
      sportsCenterDto.openingHour.map((hour) =>
        this.prisma.openingHour.create({
          data: {
            sportsCenterId: newSportsCenter.id,
            dayOfWeek: hour.dayOfWeek,
            openingTime: hour.openingTime,
            closingTime: hour.closingTime,
          },
        }),
      ),
    );

    const uploadImages = files.map((element) =>
      this.cloudService.uploadFile(element, 300, 300),
    );
    const uploadResults = await Promise.all(uploadImages);

    await Promise.all(
      uploadResults.map((result) =>
        this.prisma.theSportsCenterImages.create({
          data: {
            imageUrl: result.secure_url,
            theSportsCenterId: newSportsCenter.id,
            sportsCenterCloudinaryId: result.public_id,
          },
        }),
      ),
    );
    return newSportsCenter;
  }

  async getAllSportsCenter(query: SportsCenterFilterDto): Promise<any> {
    const itemsPerPage = Number(query.items_per_page) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * itemsPerPage;

    const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
    const amenitiesIds = query.amenitiesIds
      ? Array.isArray(query.amenitiesIds)
        ? query.amenitiesIds.map(Number)
        : [Number(query.amenitiesIds)]
      : [];
    const fromPrice = query.fromPrice ? Number(query.fromPrice) : undefined;
    const toPrice = query.toPrice ? Number(query.toPrice) : undefined;

    const conditions: any = {
      isDeleted: false,
    };

    if (query.search) {
      conditions.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (
      categoryId ||
      amenitiesIds.length > 0 ||
      fromPrice !== undefined ||
      toPrice !== undefined
    ) {
      conditions.theSportCenterCourt = {
        some: {
          ...(categoryId && { categoryId }),
          ...(amenitiesIds.length > 0 && {
            amenities: {
              some: {
                id: {
                  in: amenitiesIds,
                },
              },
            },
          }),
          ...(fromPrice !== undefined &&
            toPrice !== undefined && {
              price: {
                gte: fromPrice,
                lte: toPrice,
              },
            }),
        },
      };
    }

    let listSportsCenter: any[];

    if (query.latitude !== undefined && query.longtitude !== undefined) {
      const allCenters = await this.prisma.theSportsCenter.findMany({
        where: { isDeleted: false },
        include: {
          headquarters: true,
          theSportCenterCourt: {
            include: {
              category: true,
              amenities: {
                select: {
                  id: true,
                  name: true,
                },
              },
              comments: true,
            },
          },
          theSportsCenterImages: true,
        },
      });

      listSportsCenter = allCenters
        .map((center) => {
          const distance = this.calcDistance(
            query.latitude,
            query.longtitude,
            center.latitude,
            center.longtitude,
          );
          return { ...center, distance };
        })
        .filter((center) => center.distance <= 5)
        .slice(skip, skip + itemsPerPage);
    } else {
      listSportsCenter = await this.prisma.theSportsCenter.findMany({
        take: itemsPerPage,
        skip,
        where: conditions,
        include: {
          headquarters: true,
          theSportCenterCourt: {
            include: {
              comments: true,
              amenities: {
                select: {
                  id: true,
                  name: true,
                },
              },
              category: true,
            },
          },
          theSportsCenterImages: true,
        },
      });
    }

    const count = await this.prisma.theSportsCenter.count({
      where: conditions,
    });

    const starCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalComments = 0;
    let totalStars = 0;

    listSportsCenter.forEach((center) => {
      let centerStars = 0;
      let centerCommentsCount = 0;

      center.theSportCenterCourt.forEach((court) => {
        court.comments.forEach((comment) => {
          starCounts[comment.star]++;
          centerStars += comment.star;
          centerCommentsCount++;
          totalComments++;
          totalStars += comment.star;
        });
      });

      center.averageStars = centerCommentsCount
        ? centerStars / centerCommentsCount
        : 0;
      center.totalComments = centerCommentsCount;
    });

    const lastPage = Math.ceil(count / itemsPerPage);
    const previousPage = page - 1 < 1 ? null : page - 1;
    const nextPage = page + 1 > lastPage ? null : page + 1;

    return {
      data: {
        sports: listSportsCenter,
        regions: query.search
          ? await this.prisma.region.findMany({
              where: {
                name: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            })
          : [],
      },
      currentPage: page,
      lastPage,
      previousPage,
      nextPage,
      total: count,
      totalComments,
    };
  }

  async getAllSportsCenterByViews(query: SportsCenterFilterDto): Promise<any> {
    const starCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    const listSportsCenter = await this.prisma.theSportsCenter.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        theSportCenterCourt: {
          include: {
            comments: {
              select: {
                id: true,
                star: true,
              },
            },
          },
        },
        theSportsCenterImages: true,
        openingHour: true,
      },
      orderBy: {
        view: 'desc',
      },
    });

    const result = listSportsCenter
      .map((center) => {
        const distance = this.calcDistance(
          query.latitude,
          query.longtitude,
          center.latitude,
          center.longtitude,
        );

        let totalStars = 0;
        let totalComments = 0;

        center.theSportCenterCourt.forEach((court) => {
          court.comments.forEach((comment) => {
            starCounts[comment.star]++;
            totalStars += comment.star;
            totalComments++;
          });
        });

        const averageStars = totalComments > 0 ? totalStars / totalComments : 0;
        return {
          ...center,
          distance,
          averageStars,
        };
      })
      .filter(
        (center) =>
          center.distance <= 5 && center.theSportCenterCourt.length > 0,
      );
    return {
      data: result.map((e) => ({
        id: e.id,
        name: e.name,
        address: e.address,
        status: e.status,
        isDeleted: e.isDeleted,
        latitude: e.latitude,
        longtitude: e.longtitude,
        distance: e.distance,
        averageStars: e.averageStars,
        images: e.theSportsCenterImages,
        // openingHours: e.openingHour
      })),
      total: result.length,
    };
  }

  async getAllSportsCenterByStars(query: SportsCenterFilterDto): Promise<any> {
    const starCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    const listSportsCenter = await this.prisma.theSportsCenter.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        theSportCenterCourt: {
          include: {
            comments: true,
          },
        },
        theSportsCenterImages: true,
        openingHour: true,
      },
    });

    const result = listSportsCenter
      .map((center) => {
        const distance = this.calcDistance(
          query.latitude,
          query.longtitude,
          center.latitude,
          center.longtitude,
        );

        let totalStars = 0;
        let totalComments = 0;

        center.theSportCenterCourt.forEach((court) => {
          court.comments.forEach((comment) => {
            starCounts[comment.star]++;
            totalStars += comment.star;
            totalComments++;
          });
        });

        const averageStars = totalComments > 0 ? totalStars / totalComments : 0;

        return {
          ...center,
          distance,
          averageStars,
        };
      })
      .filter(
        (center) =>
          center.distance <= 5 && center.theSportCenterCourt.length > 0,
      )
      .sort((a, b) => a.averageStars - b.averageStars)
      .reverse();

    return {
      data: result.map((e) => ({
        id: e.id,
        name: e.name,
        address: e.address,
        status: e.status,
        isDeleted: e.isDeleted,
        latitude: e.latitude,
        longtitude: e.longtitude,
        distance: e.distance,
        averageStars: e.averageStars,
        images: e.theSportsCenterImages,
        // openingHours: e.openingHour
      })),
      total: result.length,
    };
  }

  async getOneById(id: number, query: FilterByCommentDto): Promise<any> {
    const existingSportsCenter = await this.prisma.theSportsCenter.findFirst({
      where: { id },
      include: {
        theSportCenterCourt: {
          include: {
            comments: {
              include: {
                court: {
                  select: {
                    name: true,
                  },
                },
                user: {
                  select: {
                    fullName: true,
                    avatar: true,
                    id: true,
                  },
                },
              },
            },
            amenities: true,
            courtImages: true,
          },
        },
        theSportsCenterImages: true,
      },
    });
    if (!existingSportsCenter) {
      throw new HttpException(
        'The Sports Center not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const starCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    const userCommentCounts = new Map<number, number>();
    let total: number = 0;
    let numberOfStart: number = 0;
    let commentList: any;

    const amenitiesSet = new Map<string, { name: string; image: string }>();
    existingSportsCenter.theSportCenterCourt.forEach((e) => {
      e.amenities.forEach((amenity) => {
        amenitiesSet.set(amenity.name, {
          name: amenity.name,
          image: amenity.imageUrl,
        });
      });

      e.comments.forEach((comment) => {
        if (comment.star >= 1 && comment.star <= 5) {
          starCounts[comment.star]++;
        }
        total++;
        const userId = comment.user.id;
        if (!userCommentCounts.has(userId)) {
          userCommentCounts.set(userId, 0);
        }
        userCommentCounts.set(userId, userCommentCounts.get(userId) + 1);
      });
    });

    const uniqueAmenities = Array.from(amenitiesSet.values());
    for (let i in starCounts) {
      numberOfStart += Number(i) * starCounts[i];
    }
    let averageStar = numberOfStart > 0 ? numberOfStart / total : 0;
    if (
      query.createdAt !== undefined ||
      query.isImage !== undefined ||
      query.isYou !== undefined
    ) {
      const sportCenterListByQuery =
        await this.prisma.theSportsCenter.findFirst({
          where: {
            id,
          },
          include: {
            theSportCenterCourt: {
              include: {
                comments: {
                  ...(query.createdAt
                    ? {
                        orderBy: {
                          createdAt: 'desc',
                        },
                      }
                    : {}),
                  ...(query.isImage
                    ? {
                        where: {
                          imageUrl: { not: null },
                        },
                      }
                    : {}),
                  ...(query.isYou
                    ? {
                        where: {
                          userId: Number(query.isYou),
                        },
                      }
                    : {}),
                  include: {
                    court: {
                      select: {
                        name: true,
                      },
                    },
                    user: true,
                  },
                },
                amenities: true,
                courtImages: true,
              },
            },
            theSportsCenterImages: true,
          },
        });

      commentList = sportCenterListByQuery.theSportCenterCourt.flatMap(
        (court) =>
          court.comments.map((comment) => ({
            id: comment.id,
            star: comment.star,
            text: comment.text,
            image: comment.imageUrl,
            commentImageCloudinaryId: comment.commentImageCloudinaryId,
            createdAt: comment.createdAt,
            court: comment.court.name,
            user: comment.user,
            commentCount: userCommentCounts.get(comment.user.id) || 0,
          })),
      );

      const result = {
        id: existingSportsCenter.id,
        name: existingSportsCenter.name,
        address: existingSportsCenter.address,
        status: existingSportsCenter.status,
        view: existingSportsCenter.view,
        isDeleted: existingSportsCenter.isDeleted,
        latitude: existingSportsCenter.latitude,
        longtitude: existingSportsCenter.longtitude,
        images: existingSportsCenter.theSportsCenterImages,
        theSportCenterCourt: existingSportsCenter.theSportCenterCourt.map(
          (e) => {
            return {
              id: e.id,
              name: e.name,
              price: e.price,
              discount: e.discount,
              isDeleted: e.isDeleted,
              time: e.time,
              amenities: e.amenities,
              isVip: e.isVip,
              attributes: e.attributes,
              flagTime: e.flagTime,
              maximumTime: e.maximumTime,
            };
          },
        ),
        starCounts,
        averageStar,
        total,
        commentList,
        amenities: uniqueAmenities,
      };
      return result;
    }

    commentList = existingSportsCenter.theSportCenterCourt.flatMap((court) =>
      court.comments.map((comment) => ({
        id: comment.id,
        star: comment.star,
        text: comment.text,
        image: comment.imageUrl,
        commentImageCloudinaryId: comment.commentImageCloudinaryId,
        createdAt: comment.createdAt,
        court: comment.court.name,
        user: comment.user.fullName,
        userId: comment.user.id,
        avatar: comment.user.avatar,
        commentCount: userCommentCounts.get(comment.user.id) || 0,
      })),
    );

    const result = {
      id: existingSportsCenter.id,
      name: existingSportsCenter.name,
      address: existingSportsCenter.address,
      status: existingSportsCenter.status,
      view: existingSportsCenter.view,
      isDeleted: existingSportsCenter.isDeleted,
      latitude: existingSportsCenter.latitude,
      longtitude: existingSportsCenter.longtitude,
      images: existingSportsCenter.theSportsCenterImages,
      theSportCenterCourt: existingSportsCenter.theSportCenterCourt.map((e) => {
        return {
          id: e.id,
          name: e.name,
          price: e.price,
          discount: e.discount,
          isDeleted: e.isDeleted,
          time: e.time,
          isVip: e.isVip,
          attributes: e.attributes,
          flagTime: e.flagTime,
          maximumTime: e.maximumTime,
          amenities: e.amenities,
          // comment: e.comments.map(comment => {
          // const timeDiff = nowDate.getTime() - new Date(comment.createdAt).getTime();
          // const timeInHours = Math.floor(timeDiff / (1000 * 60 * 60));
          // const timeInMinutes = Math.floor(timeDiff / (1000 * 60));
          // return {
          // id: comment.id,
          // star: comment.star,
          // text: comment.text,
          // image: comment.imageUrl,
          // commentImageCloudinaryId: comment.commentImageCloudinaryId,
          // timeInHours: timeInHours,
          // timeInMinutes: timeInMinutes,
          //     createdAt: comment.createdAt,
          //     court: comment.court.name,
          //     user: comment.user.fullName,
          //     userId: comment.user.id,
          //     avatar: comment.user.avatar,
          //     commentCount: userCommentCounts.get(comment.user.id) || 0
          // }}),
        };
      }),
      starCounts,
      averageStar,
      total,
      commentList,
      amenities: uniqueAmenities,
    };
    return result;
  }

  async updateSportsCenterInformation(id: number, data: SportsCenterDataDto) {
    const existingSportsCenter = await this.prisma.theSportsCenter.findFirst({
      where: { id },
    });
    if (!existingSportsCenter) {
      throw new HttpException(
        'The Sports Center not found',
        HttpStatus.NOT_FOUND,
      );
    }
    let updateView: number = 0;
    if (data.view > 0) {
      updateView = existingSportsCenter.view + data.view;
    }
    return await this.prisma.theSportsCenter.update({
      where: {
        id,
      },
      data: {
        name: data.name ?? existingSportsCenter.name,
        address: data.address ?? existingSportsCenter.address,
        status: data.status ?? existingSportsCenter.status,
        view: updateView ?? existingSportsCenter.view,
        isDeleted: data.isDeleted ?? existingSportsCenter.isDeleted,
        latitude: data.latitude ?? existingSportsCenter.latitude,
        longtitude: data.longtitude ?? existingSportsCenter.longtitude,
        regionId: data.regionId ?? existingSportsCenter.regionId,
      },
    });
  }

  async deleteSportsCenter(id: number) {
    const existingSportsCenter = await this.prisma.theSportsCenter.findFirst({
      where: { id },
    });
    if (!existingSportsCenter) {
      throw new HttpException(
        'The Sports Center not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.prisma.theSportsCenter.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
  }
}
