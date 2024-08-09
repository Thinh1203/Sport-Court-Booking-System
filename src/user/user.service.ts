import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
    constructor (
        private prisma: PrismaService,
        private cloudinaryService: CloudinaryService
    ) {}

    async getAllUser () : Promise<any> {
        const listUser = this.prisma.user.findMany({
            where: {
                role: 'USER'
            }
        })
        return listUser;
    }

    async getUserById (id: number) : Promise<any> {
        const userDetail = this.prisma.user.findUnique({
            where: {
                id
            }
        });
        if (!userDetail) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST)
        }
        return userDetail;
    }

    async updateUserById (id: number, data: UpdateUserDto) : Promise<any> {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id
            }
        });
        if (!existingUser) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST)
        } 
        return await this.prisma.user.update({
            where: {
                id
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
                role: existingUser.role
            }
        })
    } 

    async deleteUserById (id: number): Promise<any> {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id
            }
        });
        if (!existingUser) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST)
        } 
        return await this.prisma.user.update({
            where: {
                id
            },
            data: {
                isBlocked: true
            }
        })
    }

    async uploadAvatarById(id: number, file: Express.Multer.File): Promise<any> {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id
            }
        });
        if (!existingUser) {    
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST)
        }
        if (existingUser.avatar !== null && existingUser.avatar.length > 0) {
            await this.cloudinaryService.deleteFile(existingUser.avatarCloudinaryId);
        } 
        
        const uploadResult = await this.cloudinaryService.uploadFile(file, 300, 300);
        return await this.prisma.user.update({
            where: {
                id
            },
            data: {
                avatar: uploadResult.secure_url,
                avatarCloudinaryId: uploadResult.public_id
            }
        })
    }

    async uploadBackgroundById(id: number, file: Express.Multer.File): Promise<any> {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id
            }
        });
        if (!existingUser) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST)
        } 
        
        if (existingUser.background !== null && existingUser.background.length > 0) {
            await this.cloudinaryService.deleteFile(existingUser.backgroundCloudinaryId);
        } 
       console.log('123');
        
        const uploadResult = await this.cloudinaryService.uploadFile(file, 500, 500);
       
        return await this.prisma.user.update({
            where: {
                id
            },
            data: {
                background: uploadResult.secure_url,
                backgroundCloudinaryId: uploadResult.public_id
            }
        })
    }
}
