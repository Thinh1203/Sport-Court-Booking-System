export interface CategoryInterface {
    id: number;
    type: string;
    description: string;
    imageUrl: string;
    categoryCloudinaryId: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}