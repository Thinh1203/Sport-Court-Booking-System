export class SportsCenterFilterDto {
    page: string;
    items_per_page: number;
    search?: string;
    isBlocked?: boolean;
    latitude?: number; 
    longtitude?: number;
    categoryId?: number;
    fromPrice?: number;
    toPrice?: number;
    amenitiesIds?: number[] | string;
}

export class FilterByCommentDto {
    isImage?: boolean;
    createdAt?: boolean;
    isYou?: number;
}