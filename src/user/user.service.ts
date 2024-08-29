import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getAllUser(query: UserFilterDto): Promise<any> {
    const items_per_page = Number(query.items_per_page) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * items_per_page;

    const searchCondition: any = query.search
      ? {
          fullName: {
            contains: query.search,
            mode: 'insensitive',
          },
        }
      : {};

    const listUser = this.prisma.user.findMany({
      take: items_per_page,
      skip,
      where: {
        role: 'USER',
        ...searchCondition,
      },
    });
    const count = this.prisma.user.count();

    const [data, total] = await Promise.all([listUser, count]);
    const lastPage = Math.ceil(total / items_per_page);
    const previousPage = page - 1 < 1 ? null : page - 1;
    const nextPage = page + 1 > lastPage ? null : page + 1;
    return {
      data: data.map((e) => ({
        id: e.id,
        email: e.email,
        phoneNumber: e.phoneNumber,
        fullName: e.fullName,
        role: e.role,
        avatar: e.avatar,
        background: e.background,
        avatarCloudinaryId: e.avatarCloudinaryId,
        backgroundCloudinaryId: e.backgroundCloudinaryId,
        isBlocked: e.isBlocked,
        googleId: e.googleId,
        facebookId: e.facebookId,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
      currentPage: page,
      lastPage,
      previousPage,
      nextPage,
      total,
    };
  }

  async getUserByToken(id: number): Promise<any> {
    const userDetail = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!userDetail) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return {
      id: userDetail.id,
      email: userDetail.email,
      phoneNumber: userDetail.phoneNumber,
      fullName: userDetail.fullName,
      // role: userDetail.role,
      avatar: userDetail.avatar,
      background: userDetail.background,
      avatarCloudinaryId: userDetail.avatarCloudinaryId,
      backgroundCloudinaryId: userDetail.backgroundCloudinaryId,
      isBlocked: userDetail.isBlocked,
      googleId: userDetail.googleId,
      facebookId: userDetail.facebookId,
      createdAt: userDetail.createdAt,
      updatedAt: userDetail.updatedAt,
    };
  }

  async getUserById(id: number): Promise<any> {
    const userDetail = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!userDetail) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    return {
      id: userDetail.id,
      email: userDetail.email,
      phoneNumber: userDetail.phoneNumber,
      fullName: userDetail.fullName,
      role: userDetail.role,
      avatar: userDetail.avatar,
      background: userDetail.background,
      avatarCloudinaryId: userDetail.avatarCloudinaryId,
      backgroundCloudinaryId: userDetail.backgroundCloudinaryId,
      isBlocked: userDetail.isBlocked,
      googleId: userDetail.googleId,
      facebookId: userDetail.facebookId,
      createdAt: userDetail.createdAt,
      updatedAt: userDetail.updatedAt,
    };
  }

  async updateUserById(id: number, data: UpdateUserDto): Promise<any> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    let newRole: any = existingUser.role;

    if (data.role && data.role === 'ADMIN') {
      newRole = Role.ADMIN;
    }
    if (data.role && data.role === 'USER') {
      newRole = Role.USER;
    }
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        email: existingUser.email,
        avatar: existingUser.avatar,
        background: existingUser.background,
        fullName: data.fullName ?? existingUser.fullName,
        isBlocked: data.isBlocked ?? existingUser.isBlocked,
        password: existingUser.password,
        phoneNumber: data.phoneNumber ?? existingUser.password,
        facebookId: existingUser.facebookId,
        googleId: existingUser.googleId,
        role: newRole,
      },
    });
  }

  async deleteUserById(id: number): Promise<any> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isBlocked: true,
      },
    });
  }

  async uploadAvatarById(id: number, file: Express.Multer.File): Promise<any> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (existingUser.avatar !== null && existingUser.avatar.length > 0) {
      await this.cloudinaryService.deleteFile(existingUser.avatarCloudinaryId);
    }

    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      300,
      300,
    );
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        avatar: uploadResult.secure_url,
        avatarCloudinaryId: uploadResult.public_id,
      },
    });
  }

  async uploadBackgroundById(
    id: number,
    file: Express.Multer.File,
  ): Promise<any> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (
      existingUser.background !== null &&
      existingUser.background.length > 0
    ) {
      await this.cloudinaryService.deleteFile(
        existingUser.backgroundCloudinaryId,
      );
    }

    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      500,
      500,
    );

    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        background: uploadResult.secure_url,
        backgroundCloudinaryId: uploadResult.public_id,
      },
    });
  }
}
