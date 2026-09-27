import { CreateCourseDto } from "./create-course.dto.js";

export class UpdateCourseDto extends (CreateCourseDto) {}

function PartialType(CreateCourseDto: any) {
    throw new Error("Function not implemented.");
}
