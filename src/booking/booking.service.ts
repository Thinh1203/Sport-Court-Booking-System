import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListBooking } from './dto/booking.dto';
import { AppotapayService } from 'src/appotapay/appotapay.service';
import * as moment from 'moment-timezone';
import { BookingStatus } from './dto/booking-status.enum';

@Injectable()
export class BookingService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly appotapayService: AppotapayService
    ) {}

    private convertDateTime(dateTime: string): moment.Moment {
        return moment.tz(dateTime, 'Asia/Ho_Chi_Minh');
    } 
    async updateBookingBill(billId: number): Promise<any> {
        await this.prisma.bill.update({
            where: {
                id: billId
            },
            data: {
                paymentStatus: true
            }
        });
        return
    }
    
    async createdBooking(data: ListBooking, userId: number): Promise<any> {
        const existingUser = await this.prisma.user.findFirst({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true
            }
        });

        if (!existingUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const newBill = await this.prisma.bill.create({
            data: {
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                userId
            }
        });
        for (const element of data.bookingData) {
            const existingCourt = await this.prisma.court.findFirst({
                where: { id: element.courtId }
            });

            if (!existingCourt) {
                throw new HttpException(`Court with ID ${element.courtId} not found`, HttpStatus.NOT_FOUND);
            };

            const startDate = this.convertDateTime(element.startDate).format('YYYY-MM-DD');
            const startTime = this.convertDateTime(element.startTime).format('YYYY-MM-DDTHH:mm:ss');
            const endTime = this.convertDateTime(element.endTime).format('YYYY-MM-DDTHH:mm:ss');
            const timePlay = this.convertDateTime(element.endTime).diff(this.convertDateTime(element.startTime), 'minutes');
            const calculateCancelTime = this.convertDateTime(element.startTime).subtract(30, 'minutes');
            const timeCancel = calculateCancelTime.format('YYYY-MM-DDTHH:mm:ss');

            await this.prisma.booking.create({
                data: {
                    startDate,
                    startTime,
                    endTime,
                    playTime: timePlay,
                    cancelTime: timeCancel,
                    statusBooking: BookingStatus.Waiting,
                    totalPrice: element.totalPrice,
                    courtId: element.courtId,
                    billId: newBill.id                 
                }
            });
        }
        const billWithDetails = await this.prisma.bill.findUnique({
            where: { id: newBill.id },
            include: {
                user: {
                    select:{
                        id: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true
                    }
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
                        statusBooking: true
                    }
                }
            }
        });
        
        const dataPayment = await this.appotapayService.createTransaction(newBill);
        return {
            newBill,
            dataPayment
        };
    }
}
