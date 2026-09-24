import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';

@Controller('users') // এই controller-এর সব route /users দিয়ে শুরু হবে
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/post")
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
findAll(@Query() query: QueryUserDto) {
  return this.userService.findAll(query);
}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateUserDto>,
  ) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}