import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}