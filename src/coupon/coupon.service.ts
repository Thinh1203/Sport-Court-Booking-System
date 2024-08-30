import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CouponDto } from './dto/coupon.dto';
import { CouponInterface } from './interfaces';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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
}
