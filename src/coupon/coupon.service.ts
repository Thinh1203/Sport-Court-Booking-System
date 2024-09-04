import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CouponDto } from './dto/coupon.dto';
import { CouponInterface } from './interfaces';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';

@Injectable()
export class CouponService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudService: CloudinaryService,
  ) {}

  async createCoupon(
    couponDto: CouponDto,
    file: Express.Multer.File,
  ): Promise<CouponInterface> {
    const existingCoupon = await this.prisma.coupon.findFirst({
      where: {
        code: couponDto.code,
      },
    });

    if (existingCoupon) {
      throw new HttpException('Coupon already exists', HttpStatus.CONFLICT);
    }

    const existingTheSportsCenter = await this.prisma.theSportsCenter.findFirst(
      {
        where: {
          id: couponDto.theSportsCenterId,
        },
      },
    );

    if (!existingTheSportsCenter) {
      throw new HttpException(
        'The Sports center not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const image = await this.cloudService.uploadFile(file, 240, 240);

    return await this.prisma.coupon.create({
      data: {
        code: couponDto.code,
        description: couponDto.description,
        isDynamic: couponDto.isDynamic,
        discountType: couponDto.discountType,
        discountValue: couponDto.discountValue,
        startDate: couponDto.startDate,
        endDate: couponDto.endDate,
        maxUsage: couponDto.maxUsage,
        minTotalAmount: couponDto.minTotalAmount,
        status: couponDto.status,
        MaximumDiscountTotal: couponDto.MaximumDiscountTotal
          ? couponDto.MaximumDiscountTotal
          : null,
        metaData: couponDto.metaData ? couponDto.metaData : null,
        theSportsCenterId: couponDto.theSportsCenterId,
        ImageUrl: image.secure_url,
        imageCloudId: image.public_id,
      },
    });
  }

  async getAll(): Promise<CouponInterface[]> {
    return await this.prisma.coupon.findMany();
  }

  async getOneById(id: number): Promise<CouponInterface> {
    const existingCoupon = await this.prisma.coupon.findFirst({
      where: {
        id,
      },
    });

    if (!existingCoupon) {
      throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);
    }

    return existingCoupon;
  }

  async updateOneById(
    id: number,
    data: UpdateCouponDto,
    file: Express.Multer.File | null,
  ): Promise<CouponInterface> {
    const existingCoupon = await this.prisma.coupon.findFirst({
      where: { id },
    });
    if (!existingCoupon) {
      throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);
    }

    if (file !== null) {
      await this.cloudService.deleteFile(existingCoupon.imageCloudId);
      const newFile = await this.cloudService.uploadFile(file, 240, 240);
      return await this.prisma.coupon.update({
        where: {
          id,
        },
        data: {
          status: data.status ?? existingCoupon.status,
          code: data.code ?? existingCoupon.code,
          description: data.description ?? existingCoupon.description,
          discountValue: data.discountValue ?? existingCoupon.discountValue,
          discountType: data.discountType ?? existingCoupon.discountType,
          maxUsage: data.maxUsage ?? existingCoupon.maxUsage,
          startDate: data.startDate ?? existingCoupon.startDate,
          endDate: data.endDate ?? existingCoupon.endDate,
          isDynamic: data.isDynamic ?? existingCoupon.isDynamic,
          metaData: data.metaData ?? existingCoupon.metaData,
          minTotalAmount: data.minTotalAmount ?? existingCoupon.minTotalAmount,
          MaximumDiscountTotal:
            data.MaximumDiscountTotal ?? existingCoupon.MaximumDiscountTotal,
          imageCloudId: newFile.public_id,
          ImageUrl: newFile.secure_url,
        },
      });
    }
    return await this.prisma.coupon.update({
      where: {
        id,
      },
      data: {
        status: data.status ?? existingCoupon.status,
        code: data.code ?? existingCoupon.code,
        description: data.description ?? existingCoupon.description,
        discountValue: data.discountValue ?? existingCoupon.discountValue,
        discountType: data.discountType ?? existingCoupon.discountType,
        maxUsage: data.maxUsage ?? existingCoupon.maxUsage,
        startDate: data.startDate ?? existingCoupon.startDate,
        endDate: data.endDate ?? existingCoupon.endDate,
        isDynamic: data.isDynamic ?? existingCoupon.isDynamic,
        metaData: data.metaData ?? existingCoupon.metaData,
        minTotalAmount: data.minTotalAmount ?? existingCoupon.minTotalAmount,
        MaximumDiscountTotal:
          data.MaximumDiscountTotal ?? existingCoupon.MaximumDiscountTotal,
      },
    });
  }

  async getAllByTheSportsCenterId(id: number) {
    const existingTheSportsCenter = await this.prisma.theSportsCenter.findFirst(
      {
        where: { id },
      },
    );
    if (!existingTheSportsCenter) {
      throw new HttpException(
        'The sports center not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.prisma.coupon.findMany({
      where: {
        theSportsCenterId: id,
      },
    });
  }

  @Cron('0 0 12 * * *')
  async updateExpiredCoupons() {
    const now = moment().format('YYYY-MM-DDTHH:mm:ss');
    
    await this.prisma.coupon.updateMany({
      where: {
        endDate: {
          lt: now,
        },
        status: 'published',
      },
      data: {
        status: 'expired', 
      },
    });
  }
}
