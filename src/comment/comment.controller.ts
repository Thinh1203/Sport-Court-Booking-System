import { BadRequestException, Body, Controller, HttpStatus, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CommentDto } from './dto/comment.dto';
import { CommentService } from './comment.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createCommentApiBody } from './swagger';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
    constructor (
        private readonly commentService: CommentService
    ) {}

    @Post('')
    @UseGuards(AuthGuard)
    @ApiResponse({status: 201, description: 'Added comment successfully'})
    @ApiResponse({status: 404, description: 'User not found'})
    @ApiResponse({status: 400, description: 'Error'})
    @createCommentApiBody
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async createComment (
        @Res() res: Response,
        @Body() commentDto: CommentDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request
    ) {
        try {
            const user = req['user'];
            const data = await this.commentService.createComment(commentDto, file || null, Number(user.id));
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                data
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
            });  
        }
    }
}
