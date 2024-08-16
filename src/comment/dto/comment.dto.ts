import { IsIn, IsInt, IsNotEmpty, Max, Min } from "class-validator";

export class CommentDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(5)
    star: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    courtId: number;
    text: string;
}