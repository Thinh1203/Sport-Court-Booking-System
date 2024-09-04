import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListBooking } from './dto/booking.dto';
import { AppotapayService } from 'src/appotapay/appotapay.service';
import * as moment from 'moment-timezone';
import { BillStatus, BookingStatus } from './dto/booking-status.enum';
import { BookingFilterDto } from './dto/booking-filter.dto';
import {
  Bill,
  BookingData,
  BookingDataByUser,
} from './interfaces/booking-interface';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appotapayService: AppotapayService,
  ) {}

  private convertDateTime(dateTime: string | Date): moment.Moment {
    return moment.tz(dateTime, 'Asia/Ho_Chi_Minh');
  }

  async updateBookingBill(data: any): Promise<string | any> {
    try {
      if (data.transaction.errorCode === 0) {
        const bill = await this.prisma.bill.update({
          where: {
            id: Number(data.partnerReference.order.id),
          },
          data: {
            paymentStatus: BillStatus.Success,
          },
        });
        await this.prisma.booking.updateMany({
          where: {
            billId: bill.id,
          },
          data: {
            statusBooking: BookingStatus.WaitingActive,
          },
        });

        await this.prisma.billDetail.create({
          data: {
            billId: bill.id,
            transactionId: String(data.transaction.transactionId),
            reconciliationId: String(data.transaction.reconciliationId),
            partnerCode: String(data.transaction.partnerCode),
            status: String(data.transaction.status),
            errorCode: Number(data.transaction.errorCode),
            errorMessage: String(data.transaction.errorMessage),
            orderAmount: Number(data.transaction.orderAmount),
            amount: Number(data.transaction.amount),
            discountAmount: Number(data.transaction.discountAmount),
            currency: String(data.transaction.currency),
            bankCode: String(data.transaction.bankCode),
            paymentMethod: String(data.transaction.paymentMethod),
            action: String(data.transaction.action),
            clientIp: String(data.transaction.clientIp),
            createdAt: String(data.transaction.createdAt),
            updatedAt: String(data.transaction.updatedAt),
          },
        });
        return 'success';
      }

      if (
        data.transaction.errorCode === 38 ||
        data.transaction.errorMessage === 77
      ) {
        const notes = 'Payment Cancelled';
        const bill = await this.prisma.bill.update({
          where: {
            id: Number(data.partnerReference.order.id),
          },
          data: {
            paymentStatus: BillStatus.Cancelled,
          },
        });

        await this.prisma.booking.updateMany({
          where: {
            billId: bill.id,
          },
          data: {
            statusBooking: BookingStatus.Cancelled,
            notes,
          },
        });
        return 'failed';
      }
      return 'error';
    } catch (error) {
      console.error(error);
      return {
        message: error.message || 'An error occurred during the update process',
      };
    }
  }

  async createdBooking(data: ListBooking, userId: number) {
    const existingUser = await this.prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
      },
    });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    let amount: number = 0;
    let totalDiscount: number = 0;

    for (const booking of data.bookingData) {
      const existingCourt = await this.prisma.court.findFirst({
        where: { id: booking.courtId },
      });

      if (!existingCourt) {
        throw new HttpException('Court not found', HttpStatus.NOT_FOUND);
      }
      const startTime = moment(booking.startTime, 'HH:mm');
      const endTime = moment(booking.endTime, 'HH:mm');
      const timePlay: number = endTime.diff(startTime, 'minutes');
      const pricePerMinute: number = existingCourt.price / existingCourt.time;
      amount += pricePerMinute * timePlay;

      if (existingCourt.discount) {
        amount -= (amount * existingCourt.discount) / 100;
      }
    }

    if (data.coupons && data.coupons.length > 0) {
      for (const couponId of data.coupons) {
        const existingCoupon = await this.prisma.coupon.findFirst({
          where: { id: couponId },
        });

        if (!existingCoupon) {
          throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);
        }

        const now = moment();
        const startDate = moment(
          existingCoupon.startDate,
          'YYYY-MM-DDTHH:mm:ss',
        );
        const endDate = moment(existingCoupon.endDate, 'YYYY-MM-DDTHH:mm:ss');

        if (now.isBefore(startDate) || now.isAfter(endDate)) {
          throw new HttpException(
            'Coupon is not currently in use or has expired',
            HttpStatus.NOT_FOUND,
          );
        }

        if (existingCoupon.maxUsage <= (existingCoupon.usedCount || 0)) {
          throw new HttpException(
            'Number of expired coupons',
            HttpStatus.NOT_FOUND,
          );
        }

        if (
          existingCoupon.isDynamic &&
          existingCoupon.discountType === 'percentage'
        ) {
          totalDiscount = (amount * existingCoupon.discountValue) / 100;
          if (
            existingCoupon.MaximumDiscountTotal &&
            totalDiscount > existingCoupon.MaximumDiscountTotal
          ) {
            totalDiscount = existingCoupon.MaximumDiscountTotal;
          }
        } else {
          totalDiscount = existingCoupon.discountValue;
        }

        amount -= totalDiscount;
      }
    }

    const newBill = await this.prisma.bill.create({
      data: {
        amount,
        paymentMethod: data.paymentMethod,
        userId: existingUser.id,
        paymentStatus: 'Pending',
        totalDiscountAmount: totalDiscount,
      },
    });

    for (const element of data.bookingData) {
      const existingCourt = await this.prisma.court.findFirst({
        where: { id: element.courtId },
      });

      if (!existingCourt) {
        throw new HttpException(
          `Court with ID ${element.courtId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const startDate = moment(element.startDate).format('YYYY-MM-DD');
      const startTime = moment(element.startTime, 'HH:mm').format('HH:mm');
      const endTime = moment(element.endTime, 'HH:mm').format('HH:mm');
      const timePlay = moment(element.endTime, 'HH:mm').diff(
        moment(element.startTime, 'HH:mm'),
        'minutes',
      );
      const timeCancel = moment(element.startTime, 'HH:mm')
        .subtract(30, 'minutes')
        .format('HH:mm');
      let totalPriceBooking: number = 0;
      const pricePerMinute: number = existingCourt.price / existingCourt.time;
      totalPriceBooking += pricePerMinute * timePlay;

      if (existingCourt.discount) {
        totalPriceBooking -= (amount * existingCourt.discount) / 100;
      }

      await this.prisma.booking.create({
        data: {
          startDate,
          startTime,
          endTime,
          playTime: timePlay,
          cancelTime: timeCancel,
          statusBooking: 'Waiting',
          totalPrice: totalPriceBooking,
          courtId: element.courtId,
          billId: newBill.id,
        },
      });
    }

    if (data.coupons && data.coupons.length > 0) {
      for (const couponId of data.coupons) {
        await this.prisma.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }
    }

    const billWithDetails = await this.prisma.bill.findUnique({
      where: { id: newBill.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        booking: {
          select: {
            id: true,
            startDate: true,
            startTime: true,
            endTime: true,
            cancelTime: true,
            playTime: true,
            totalPrice: true,
            statusBooking: true,
          },
        },
      },
    });

    // Initiate payment
    const dataPayment = await this.appotapayService.createTransaction(newBill);

    return {
      billWithDetails,
      dataPayment,
    };
  }

  async getAllBooking(query: BookingFilterDto): Promise<Bill | any> {
    const items_per_page = Number(query.items_per_page) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * items_per_page;

    const listBooking = await this.prisma.bill.findMany({
      take: items_per_page,
      skip,
      where: {
        ...(query.paymentStatus
          ? {
              paymentStatus: query.paymentStatus,
            }
          : {}),
        user: {
          ...(query.search
            ? {
                OR: [
                  {
                    phoneNumber: {
                      contains: query.search,
                    },
                  },
                  {
                    fullName: {
                      contains: query.search,
                    },
                  },
                ],
              }
            : {}),
        },
        // booking: {
        //     ...(query.statusBooking ? {
        //         statusBooking: query.statusBooking
        //     } : {})
        // }
      },
      include: {
        booking: true,
        user: true,
        // billDetail: true
      },
    });
    const count = this.prisma.bill.count();
    const [result, total] = await Promise.all([listBooking, count]);

    const lastPage = Math.ceil(total / items_per_page);
    const previousPage = page - 1 < 1 ? null : page - 1;
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const data = result.map((bill) => ({
      id: bill.id,
      paymentMethod: bill.paymentMethod,
      paymentStatus: bill.paymentStatus,
      amount: bill.amount,
      createdAt: this.convertDateTime(bill.createdAt).format(
        'YYYY-MM-DDTHH:mm:ss',
      ),
      updatedAt: this.convertDateTime(bill.updatedAt).format(
        'YYYY-MM-DDTHH:mm:ss',
      ),
      bookings: bill.booking.map((booking) => ({
        id: booking.id,
        startDate: booking.startDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        playTime: booking.playTime,
        cancelTime: booking.cancelTime,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        statusBooking: booking.statusBooking,
        totalPrice: booking.totalPrice,
        notes: booking.notes,
        createdAt: this.convertDateTime(booking.createdAt).format(
          'YYYY-MM-DDTHH:mm:ss',
        ),
        updatedAt: this.convertDateTime(booking.updatedAt).format(
          'YYYY-MM-DDTHH:mm:ss',
        ),
      })),
      user: {
        id: bill.user.id,
        avatar: bill.user.avatar,
        fullName: bill.user.fullName,
        email: bill.user.email,
        phoneNumber: bill.user.phoneNumber,
      },
    }));
    return {
      data,
      previousPage,
      nextPage,
      currentPage: page,
      totalData: total,
    };
  }

  async getBookingById(id: number): Promise<BookingData | any> {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            court: {
              include: {
                courtImages: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!bill) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: bill.id,
      paymentMethod: bill.paymentMethod,
      paymentStatus: bill.paymentStatus,
      amount: bill.amount,
      createdAt: this.convertDateTime(bill.createdAt).format(
        'YYYY-MM-DDTHH:mm:ss',
      ),
      updatedAt: this.convertDateTime(bill.updatedAt).format(
        'YYYY-MM-DDTHH:mm:ss',
      ),
      bookings: bill.booking.map((booking) => ({
        id: booking.id,
        startDate: booking.startDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        playTime: booking.playTime,
        cancelTime: booking.cancelTime,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        statusBooking: booking.statusBooking,
        totalPrice: booking.totalPrice,
        notes: booking.notes,
        createdAt: this.convertDateTime(booking.createdAt).format(
          'YYYY-MM-DDTHH:mm:ss',
        ),
        updatedAt: this.convertDateTime(booking.updatedAt).format(
          'YYYY-MM-DDTHH:mm:ss',
        ),
        court: {
          id: booking.court.id,
          isVip: booking.court.isVip,
          images: booking.court.courtImages.map((image) => ({
            imgageUrl: image.imageUrl,
            imageId: image.imageId,
          })),
        },
      })),
      user: {
        id: bill.user.id,
        avatar: bill.user.avatar,
        fullName: bill.user.fullName,
        email: bill.user.email,
        phoneNumber: bill.user.phoneNumber,
      },
      // billDetail: bill.billDetail,
    };
  }

  async getBookingByUserId(userId: number): Promise<BookingDataByUser | any> {
    const bills = await this.prisma.bill.findMany({
      where: {
        userId,
      },
      include: {
        booking: {
          include: {
            court: {
              include: {
                courtImages: true,
              },
            },
          },
        },
      },
    });
    const result = bills.map((bill) => ({
      id: bill.id,
      paymentMethod: bill.paymentMethod,
      paymentStatus: bill.paymentStatus,
      amount: bill.amount,
      createdAt: this.convertDateTime(bill.createdAt).format(
        'YYYY-MM-DDTHH:mm:ss',
      ),
      updatedAt: this.convertDateTime(bill.updatedAt).format(
        'YYYY-MM-DDTHH:mm:ss',
      ),
      bookings: bill.booking.map((booking) => ({
        id: booking.id,
        startDate: booking.startDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        playTime: booking.playTime,
        cancelTime: booking.cancelTime,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        statusBooking: booking.statusBooking,
        totalPrice: booking.totalPrice,
        notes: booking.notes,
        court: {
          id: booking.court.id,
          isVip: booking.court.isVip,
          images: booking.court.courtImages.map((image) => ({
            imageUrl: image.imageUrl,
            imageId: image.imageId,
          })),
        },
      })),
    }));
    return result;
  }
}
