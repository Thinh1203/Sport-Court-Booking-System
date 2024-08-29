import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CategoryUpdateData } from './dto/update/data-update.dto';
import { CategoryInterface } from './interfaces';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createCategory(
    categoryDto: CategoryDto,
    file: Express.Multer.File,
  ): Promise<CategoryInterface> {
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        type: categoryDto.type,
      },
    });
    if (existingCategory) {
      throw new HttpException('Category already exists', HttpStatus.CONFLICT);
    }
    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      100,
      100,
    );
    return await this.prisma.category.create({
      data: {
        type: categoryDto.type,
        description: categoryDto.description,
        imageUrl: uploadResult.secure_url,
        categoryCloudinaryId: uploadResult.public_id,
      },
    });
  }

  async getAllCategory(): Promise<CategoryInterface[]> {
    return await this.prisma.category.findMany({
      where: {
        isDeleted: false,
      },
    });
  }

  async getCategoryById(id: number): Promise<CategoryInterface> {
    const existingCategory = await this.prisma.category.findFirst({
      where: { id },
    });
    if (!existingCategory) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return existingCategory;
  }

  async updateCategoryById(
    id: number,
    categoryData: CategoryUpdateData,
    file: Express.Multer.File | null,
  ): Promise<CategoryInterface> {
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        id,
      },
    });
    if (!existingCategory) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    if (file !== null) {
      await this.cloudinaryService.deleteFile(
        existingCategory.categoryCloudinaryId,
      );
      const uploadResult = await this.cloudinaryService.uploadFile(
        file,
        100,
        100,
      );

      return await this.prisma.category.update({
        where: {
          id,
        },
        data: {
          type: categoryData.type ?? existingCategory.type,
          description: categoryData.description ?? existingCategory.description,
          isDeleted: categoryData.isDeleted ?? existingCategory.isDeleted,
          imageUrl: uploadResult.secure_url,
          categoryCloudinaryId: uploadResult.public_id,
        },
      });
    }

    return await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        isDeleted: categoryData.isDeleted ?? existingCategory.isDeleted,
        type: categoryData.type ?? existingCategory.type,
        description: categoryData.description ?? existingCategory.description,
      },
    });
  }

  async deleteCategoryById(id: number): Promise<CategoryInterface>{
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        id,
      },
    });
    if (!existingCategory) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
  }
}
