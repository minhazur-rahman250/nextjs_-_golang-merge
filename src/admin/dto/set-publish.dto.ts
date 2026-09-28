import { IsBoolean } from 'class-validator';

export class SetPublishDto {
  @IsBoolean()
  isPublished: boolean;
}