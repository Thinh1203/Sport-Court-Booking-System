import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommentDto } from './dto/comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CommentService {
    constructor (
        private readonly prisma: PrismaService,
         private readonly cloudinaryService: CloudinaryService
    ) {}

    async createComment (commentDto: CommentDto, file: Express.Multer.File | null, userId: number): Promise<any> {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!existingUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const existingCourt = await this.prisma.court.findFirst({
            where: {
                id: commentDto.courtId
            }
        });

        if (!existingCourt) {
            throw new HttpException('Court not found', HttpStatus.NOT_FOUND);
        }
        if (file !== null) {
            const fileUpload = await this.cloudinaryService.uploadFile(file, 100, 100);
            return await this.prisma.comment.create({
                data: {
                    star: commentDto.star,
                    imageUrl: fileUpload.secure_url,
                    text: commentDto.text ? commentDto.text : null,
                    commentImageCloudinaryId: fileUpload.public_id,
                    courtId: commentDto.courtId,
                    userId: userId
                }
            });
        }
        return await this.prisma.comment.create({
            data: {
                star: commentDto.star,
                text: commentDto.text ? commentDto.text : null,
                courtId: commentDto.courtId,
                userId: userId
            }
        });
    } 
}
