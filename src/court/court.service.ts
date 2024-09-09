import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CourtDto } from './dto/court.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { courtDataUpdate } from './dto/update/data-update';
import * as moment from 'moment-timezone';
import { CourtFilter } from './dto/court-filter.dto';
import { CartData, TimeLineBooking } from './interfaces';
import { CartDto } from './dto/cart.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class CourtService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly socketService: SocketService,
  ) {}

  private async setCacheData(key: string, value: any) {
    const ttl = 120;
    await this.cacheManager.set(key, value, ttl);
  }

  private async getCacheData(key: string): Promise<CartData[]> {
    return await this.cacheManager.get(key);
  }

  private async updateCacheData(key: string, oldValue: any, newValue: any) {
    const updatedValue = { ...oldValue, ...newValue };
    await this.setCacheData(key, updatedValue);
  }

  async createNewCourt(
    courtDto: CourtDto,
    files: Express.Multer.File[],
  ): Promise<any> {
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

    const uploadImages = files.map((element) =>
      this.cloudinaryService.uploadFile(element, 300, 300),
    );
    const uploadResults = await Promise.all(uploadImages);

    const newCourt = await this.prisma.court.create({
      data: {
        name: courtDto.name,
        price: Number(courtDto.price),
        sportsCenterId: existingSportsCenter.id,
        categoryId: existingCategory.id,
        attributes: courtDto.attributes
          ? JSON.parse(courtDto.attributes)
          : null,
        time: Number(courtDto.time),
        amenities: {
          connect: courtDto.amenitiesIds.map((id: number) => ({ id })),
        },
      },
    });

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

  async getAll() {
    const result = await this.prisma.court.findMany({
      include: {
        category: true,
        amenities: true,
        courtImages: true,
        // sportsCenter: true
      },
    });
    const formattedResult = result.map((e) => ({
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
        isDeleted: e.category.isDeleted,
      },
      amenities: e.amenities.map((amenity) => ({
        id: amenity.id,
        name: amenity.name,
        description: amenity.description,
        imageUrl: amenity.imageUrl,
        amentityCloudinaryId: amenity.amentityCloudinaryId,
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
    return formattedResult;
  }

  async updateById(
    id: number,
    data: courtDataUpdate,
    files: Express.Multer.File[] | null,
  ): Promise<any> {
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
      ? data.amenities.map((id) => ({ id }))
      : existingCourt.amenities.map((a) => ({ id: a.id }));

    const oldImageIds = existingCourt.courtImages.map((image) => image.imageId);

    await Promise.all(
      oldImageIds.map((imageId) => this.cloudinaryService.deleteFile(imageId)),
    );

    let newImageUrls = [];
    if (files && files.length > 0) {
      newImageUrls = await Promise.all(
        files.map(async (file) => {
          const uploadResult = await this.cloudinaryService.uploadFile(
            file,
            300,
            300,
          );
          return {
            imageUrl: uploadResult.secure_url,
            imageId: uploadResult.public_id,
          };
        }),
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
          create: newImageUrls.map((image) => ({
            imageUrl: image.imageUrl,
            imageId: image.imageId,
          })),
        },
      },
    });
  }

  async getById(id: number, query: CourtFilter) {
    let toDay: string = moment().format('YYYY-MM-DD');
    if (query.date) {
      toDay = query.date;
    }

    const existingCourt = await this.prisma.court.findFirst({
      where: { id },
      include: {
        category: true,
        amenities: true,
        booking: {
          where: {
            startDate: {
              equals: toDay,
            },
          },
        },
        courtImages: true,
        sportsCenter: {
          include: {
            openingHour: true,
          },
        },
      },
    });

    if (!existingCourt) {
      throw new HttpException('Court not found', HttpStatus.NOT_FOUND);
    }

    const now = moment().format('dddd');
    const day = now.slice(0, 3).toLowerCase();
    const timeLineBooking: TimeLineBooking[] = [];

    existingCourt.sportsCenter.openingHour.forEach((element) => {
      if (element.dayOfWeek === day) {
        const openingTime = moment(element.openingTime, 'HH:mm');
        const closingTime = moment(element.closingTime, 'HH:mm');

        let currentTime = openingTime.clone();

        while (currentTime.isBefore(closingTime)) {
          const nextTime = currentTime.clone().add(60, 'minutes');
          if (nextTime.isAfter(closingTime)) {
            break;
          }
          timeLineBooking.push({
            startTime: currentTime.format('H:mm'),
            endTime: nextTime.format('H:mm'),
            freeTime: true,
          });
          currentTime = nextTime;
        }
      }
    });

    const listOfTimeBooking = timeLineBooking.map((slot) => {
      const slotStartTime = moment(slot.startTime, 'H:mm');
      const slotEndTime = slotStartTime.clone().add(60, 'minutes');

      const isBusy = existingCourt.booking.some((booking) => {
        const bookingStartTime = moment(booking.startTime, 'H:mm');
        const bookingEndTime = moment(booking.endTime, 'H:mm');

        return (
          slotStartTime.isBefore(bookingEndTime) &&
          slotEndTime.isAfter(bookingStartTime)
        );
      });

      if (isBusy) {
        slot.freeTime = false;
      }
      return slot;
    });

    return {
      existingCourt,
      listOfTimeBooking,
    };
  }

  async addToCart(cartDto: CartDto) {
    const toDay: string = moment(cartDto.startDate).format('YYYY-MM-DD');

    const existingCourt = await this.prisma.court.findFirst({
      where: { id: cartDto.courtId },
      include: {
        category: true,
        amenities: true,
        booking: {
          where: {
            startDate: {
              equals: toDay,
            },
          },
        },
        courtImages: true,
        sportsCenter: {
          include: {
            openingHour: true,
          },
        },
      },
    });

    if (!existingCourt) {
      throw new HttpException('Court not found', HttpStatus.NOT_FOUND);
    }

    const newData = {
      startDate: cartDto.startDate,
      startTime: cartDto.startTime,
      endTime: cartDto.endTime,
      courtId: cartDto.courtId,
    };

    const cacheKey = `cart-${cartDto.userId}-${cartDto.courtId}-${toDay}`;
    const userCart = ``;
    let valueInCache: CartData[] = await this.cacheManager.get(cacheKey);

    if (!valueInCache) {
      valueInCache = [newData];
    } else {
      valueInCache.push(newData);
    }

    await this.cacheManager.set(cacheKey, valueInCache, 120);

    const channelName = `court-${cartDto.courtId}-${toDay}`;

    const updatedTimeLineBooking = this.generateUpdatedTimeSlots(
      existingCourt,
      valueInCache,
    );

    this.socketService.server.to(channelName).emit('courtData', {
      existingCourt,
      listOfTimeBooking: updatedTimeLineBooking,
    });

    return {
      existingCourt,
      listOfTimeBooking: updatedTimeLineBooking,
    };
  }

  private generateUpdatedTimeSlots(existingCourt, valueInCache) {
    const now = moment().format('dddd');
    const day = now.slice(0, 3).toLowerCase();
    const timeLineBooking: TimeLineBooking[] = [];

    existingCourt.sportsCenter.openingHour.forEach((element) => {
      if (element.dayOfWeek === day) {
        const openingTime = moment(element.openingTime, 'HH:mm');
        const closingTime = moment(element.closingTime, 'HH:mm');
        let currentTime = openingTime.clone();

        while (currentTime.isBefore(closingTime)) {
          const nextTime = currentTime.clone().add(60, 'minutes');
          if (nextTime.isAfter(closingTime)) {
            break;
          }
          timeLineBooking.push({
            startTime: currentTime.format('H:mm'),
            endTime: nextTime.format('H:mm'),
            freeTime: true,
          });
          currentTime = nextTime;
        }
      }
    });

    return timeLineBooking.map((slot) => {
      const slotStartTime = moment(slot.startTime, 'H:mm');
      const slotEndTime = slotStartTime.clone().add(60, 'minutes');

      const isBusy = existingCourt.booking.some((booking) => {
        const bookingStartTime = moment(booking.startTime, 'H:mm');
        const bookingEndTime = moment(booking.endTime, 'H:mm');
        return (
          slotStartTime.isBefore(bookingEndTime) &&
          slotEndTime.isAfter(bookingStartTime)
        );
      });

      const isCachedBusy = valueInCache.some((cache) => {
        const cacheStartTime = moment(cache.startTime, 'H:mm');
        const cacheEndTime = moment(cache.endTime, 'H:mm');
        return (
          slotStartTime.isBefore(cacheEndTime) &&
          slotEndTime.isAfter(cacheStartTime)
        );
      });

      if (isBusy || isCachedBusy) {
        slot.freeTime = false;
      }

      return slot;
    });
  }

  // private generateUpdatedTimeSlots(existingCourt, valueInCache) {
  //   const now = moment().format('dddd');
  //   const day = now.slice(0, 3).toLowerCase();
  //   const timeLineBooking: TimeLineBooking[] = [];

  //   // Lấy giờ mở cửa và tạo các khung giờ trống
  //   existingCourt.sportsCenter.openingHour.forEach((element) => {
  //     if (element.dayOfWeek === day) {
  //       const openingTime = moment(element.openingTime, 'HH:mm');
  //       const closingTime = moment(element.closingTime, 'HH:mm');
  //       let currentTime = openingTime.clone();

  //       while (currentTime.isBefore(closingTime)) {
  //         const nextTime = currentTime.clone().add(60, 'minutes');
  //         if (nextTime.isAfter(closingTime)) {
  //           break;
  //         }
  //         timeLineBooking.push({
  //           startTime: currentTime.format('H:mm'),
  //           endTime: nextTime.format('H:mm'),
  //           freeTime: true,
  //         });
  //         currentTime = nextTime;
  //       }
  //     }
  //   });

  //   // Kiểm tra từng khung giờ xem có bị bận từ booking hoặc cache không
  //   return timeLineBooking.map((slot) => {
  //     const slotStartTime = moment(slot.startTime, 'H:mm');
  //     const slotEndTime = slotStartTime.clone().add(60, 'minutes');

  //     const isBusy = existingCourt.booking.some((booking) => {
  //       const bookingStartTime = moment(booking.startTime, 'H:mm');
  //       const bookingEndTime = moment(booking.endTime, 'H:mm');
  //       return (
  //         slotStartTime.isBefore(bookingEndTime) &&
  //         slotEndTime.isAfter(bookingStartTime)
  //       );
  //     });

  //     const isCachedBusy = valueInCache.some((cache) => {
  //       const cacheStartTime = moment(cache.startTime, 'H:mm');
  //       const cacheEndTime = moment(cache.endTime, 'H:mm');
  //       return (
  //         slotStartTime.isBefore(cacheEndTime) &&
  //         slotEndTime.isAfter(cacheStartTime)
  //       );
  //     });

  //     if (isBusy || isCachedBusy) {
  //       slot.freeTime = false;
  //     }

  //     return slot;
  //   });
  // }

  // async addToCart(cartDto: CartDto) {
  //   const toDay: string = moment(cartDto.startDate).format('YYYY-MM-DD');

  //   const existingCourt = await this.prisma.court.findFirst({
  //     where: { id: cartDto.courtId },
  //     include: {
  //       category: true,
  //       amenities: true,
  //       booking: {
  //         where: {
  //           startDate: {
  //             equals: toDay,
  //           },
  //         },
  //       },
  //       courtImages: true,
  //       sportsCenter: {
  //         include: {
  //           openingHour: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!existingCourt) {
  //     throw new HttpException('Court not found', HttpStatus.NOT_FOUND);
  //   }

  //   const newData = {
  //     startDate: cartDto.startDate,
  //     startTime: cartDto.startTime,
  //     endTime: cartDto.endTime,
  //     courtId: cartDto.courtId,
  //   };

  //   const userCartKey = `cart-${cartDto.userId}-${cartDto.courtId}-${toDay}`;
  //   let userCart: CartData[] = await this.cacheManager.get(userCartKey);

  //   if (!userCart) {
  //     userCart = [newData];
  //   } else {
  //     userCart.push(newData);
  //   }

  //   await this.cacheManager.set(userCartKey, userCart);

  //   const busyTimesKey = `court-${cartDto.courtId}-${toDay}`;
  //   let isExist: CartData[] = await this.cacheManager.get(busyTimesKey);
  //  let value: CartData[];
  //  console.log(isExist);

  //   if (!isExist) {
  //     await this.cacheManager.set(busyTimesKey, [newData]);
  //     // busyTimes = [newData];
  //   } else {
  //     console.log('123');

  //     value = await this.cacheManager.get(busyTimesKey);
  //     let newValue: CartData[] = value;
  //     newValue.push(newData);
  //     await this.cacheManager.set(busyTimesKey, newValue)
  //   }

  //   // set key - value in cache
  //   // await this.cacheManager.set(busyTimesKey, busyTimes);

  //   const debugCache = await this.cacheManager.get(busyTimesKey);
  //   console.log('Cached busyTimes:', debugCache);

  //   // Update and notify clients of the new timeline
  //   const updatedTimeLineBooking = this.generateUpdatedTimeSlots(
  //     existingCourt,
  //     isExist,
  //   );

  //   const channelName = `court-${cartDto.courtId}-${toDay}`;
  //   this.socketService.server.to(channelName).emit('courtData', {
  //     existingCourt,
  //     listOfTimeBooking: updatedTimeLineBooking,
  //   });

  //   return {
  //     existingCourt,
  //     listOfTimeBooking: updatedTimeLineBooking,
  //   };
  // }

  // #region test
  async getOneById(id: number, startDate: string) {
    const toDay: string = moment(startDate).format('YYYY-MM-DD');

    const existingCourt = await this.prisma.court.findFirst({
      where: { id },
      include: {
        category: true,
        amenities: true,
        booking: {
          where: {
            startDate: {
              equals: toDay,
            },
          },
        },
        courtImages: true,
        sportsCenter: {
          include: {
            openingHour: true,
          },
        },
      },
    });

    if (!existingCourt) {
      throw new HttpException('Court not found', HttpStatus.NOT_FOUND);
    }

    const now = moment().format('dddd').slice(0, 3).toLowerCase();
    const timeLineBooking: TimeLineBooking[] = [];

   
    existingCourt.sportsCenter.openingHour.forEach((element) => {
      if (element.dayOfWeek === now) {
        const openingTime = moment(element.openingTime, 'HH:mm');
        const closingTime = moment(element.closingTime, 'HH:mm');

        let currentTime = openingTime.clone();
        while (currentTime.isBefore(closingTime)) {
          const nextTime = currentTime.clone().add(60, 'minutes');
          if (nextTime.isAfter(closingTime)) break;

          timeLineBooking.push({
            startTime: currentTime.format('H:mm'),
            endTime: nextTime.format('H:mm'),
            freeTime: true,
          });
          currentTime = nextTime;
        }
      }
    });

    const cacheKey = `court-${id}-${toDay}`;
    const cachedBusyTimes: CartData[] = await this.cacheManager.get(cacheKey);

   
    const listOfTimeBooking = timeLineBooking.map((slot) => {
      const slotStartTime = moment(slot.startTime, 'H:mm');
      const slotEndTime = slotStartTime.clone().add(60, 'minutes');

      const isBookedBusy = existingCourt.booking.some((booking) => {
        const bookingStartTime = moment(booking.startTime, 'H:mm');
        const bookingEndTime = moment(booking.endTime, 'H:mm');
        return (
          slotStartTime.isBefore(bookingEndTime) &&
          slotEndTime.isAfter(bookingStartTime)
        );
      });

      const isCachedBusy = cachedBusyTimes?.some((cache) => {
        const cacheStartTime = moment(cache.startTime, 'H:mm');
        const cacheEndTime = moment(cache.endTime, 'H:mm');
        return (
          slotStartTime.isBefore(cacheEndTime) &&
          slotEndTime.isAfter(cacheStartTime)
        );
      });

      if (isBookedBusy || isCachedBusy) {
        slot.freeTime = false;
      }

      return slot;
    });

    return {
      existingCourt,
      listOfTimeBooking,
    };
  }
  // #endregion
}
