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
  private calculatePlayTime(startTime: string, endTime: string): number {
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    return end.diff(start, 'minutes');
  }

  private calculateCourtCost(
    price: number,
    courtTime: number,
    playTime: number,
    discount?: number,
  ): number {
    const pricePerMinute = price / courtTime;
    let totalPrice = pricePerMinute * playTime;
    if (discount) {
      totalPrice -= (totalPrice * discount) / 100;
    }
    return totalPrice;
  }

  private async applyCoupons(
    coupons: number[],
    amount: number,
  ): Promise<number> {
    let totalDiscount = 0;

    if (coupons && coupons.length > 0) {
      for (const couponId of coupons) {
        const coupon = await this.prisma.coupon.findUnique({
          where: { id: couponId },
        });
        if (!coupon)
          throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);

        this.validateCoupon(coupon);

        const discount = this.calculateCouponDiscount(coupon, amount);
        totalDiscount += discount;
      }
    }

    return totalDiscount;
  }

  private validateCoupon(coupon: any) {
    const now = moment();
    if (now.isBefore(coupon.startDate) || now.isAfter(coupon.endDate)) {
      throw new HttpException(
        'Coupon expired or not in use',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (coupon.maxUsage <= (coupon.usedCount || 0)) {
      throw new HttpException(
        'Coupon usage limit exceeded',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private calculateCouponDiscount(coupon: any, amount: number): number {
    let discount = 0;
    if (coupon.isDynamic && coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
      if (
        coupon.maximumDiscountTotal &&
        discount > coupon.maximumDiscountTotal
      ) {
        discount = coupon.maximumDiscountTotal;
      }
    } else {
      discount = coupon.discountValue;
    }
    return discount;
  }

  private async createBookings(bookings: any[], billId: number) {
    for (const booking of bookings) {
      const court = await this.prisma.court.findUnique({
        where: { id: booking.courtId },
      });

      if (!court)
        throw new HttpException('Court not found', HttpStatus.NOT_FOUND);

      const playTime = this.calculatePlayTime(
        booking.startTime,
        booking.endTime,
      );
      const pricePerMinute = court.price / court.time;
      const totalPrice = pricePerMinute * playTime - (court.discount || 0);

      const startDate = moment(booking.startDate).format('YYYY-MM-DD');
      const cancelTime = moment(booking.startTime, 'HH:mm')
        .subtract(30, 'minutes')
        .format('HH:mm');

      await this.prisma.booking.create({
        data: {
          startDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          playTime,
          cancelTime,
          statusBooking: 'WAITING',
          totalPrice,
          courtId: booking.courtId,
          billId,
        },
      });
    }
  }

  private async updateCouponUsage(coupons: number[]) {
    for (const couponId of coupons) {
      await this.prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  private async getBillDetails(billId: number) {
    return await this.prisma.bill.findUnique({
      where: { id: billId },
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
  }

  private convertDateTime(dateTime: string | Date): moment.Moment {
    return moment.tz(dateTime, 'Asia/Ho_Chi_Minh');
  }

  async updateBookingBill(data: any): Promise<string | any> {
    try {
      const billId = data.partnerReference.order.id.slice(4);
      if (data.transaction.errorCode === 0) {
        const bill = await this.prisma.bill.update({
          where: {
            id: Number(billId),
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
            id: Number(billId),
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
    const existingUser = await this.prisma.user.findUnique({
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

    let totalAmount = 0;
    let totalDiscount = 0;

    for (const booking of data.bookingData) {
      const court = await this.prisma.court.findUnique({
        where: { id: booking.courtId },
      });

      if (!court) {
        throw new HttpException('Court not found', HttpStatus.NOT_FOUND);
      }

      const timePlayed = this.calculatePlayTime(
        booking.startTime,
        booking.endTime,
      );
      const amount = this.calculateCourtCost(
        court.price,
        court.time,
        timePlayed,
        court.discount,
      );

      totalAmount += amount;
    }

    totalDiscount = await this.applyCoupons(data.coupons, totalAmount);
    totalAmount -= totalDiscount;

    const newBill = await this.prisma.bill.create({
      data: {
        amount: totalAmount,
        paymentMethod: data.paymentMethod,
        userId: existingUser.id,
        paymentStatus: 'PENDING',
        totalDiscountAmount: totalDiscount,
      },
    });

    await this.createBookings(data.bookingData, newBill.id);

    if (data.coupons && data.coupons.length > 0) {
      await this.updateCouponUsage(data.coupons);
    }

    const billWithDetails = await this.getBillDetails(newBill.id);

    const dataPayment = await this.appotapayService.createTransaction(newBill);

    await this.prisma.bill.update({
      where: { id: newBill.id },
      data: {
        paymentUrl: dataPayment.payment.url,
      },
    });

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
            imageUrl: image.imageUrl,
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
      paymentUrl: bill.paymentUrl,
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
          name: booking.court.name,
          images: booking.court.courtImages.map((image) => ({
            imageUrl: image.imageUrl,
            imageId: image.imageId,
          })),
        },
      })),
    }));
    return result;
  }

  async updateBookingStatus(id: number, status: string) {
    const existingBooking = await this.prisma.booking.findFirst({
      where: { id },
    });
    if (!existingBooking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    if (status === 'ACTIVE') {
      return await this.prisma.booking.update({
        where: { id },
        data: {
          statusBooking: BookingStatus.Active,
          checkInTime: now,
        },
      });
    }
    if (status === 'SUCCESS') {
      return await this.prisma.booking.update({
        where: { id },
        data: {
          statusBooking: BookingStatus.Success,
          checkOutTime: now,
        },
      });
    }
    if (status === 'CANCELLED') {
      return await this.prisma.booking.update({
        where: {id},
        data: {
          statusBooking: BookingStatus.Cancelled,
          cancelBookingTime: now
        }
      })
    }
    return 'error';
  }
}
