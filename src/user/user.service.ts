import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';
import { QueryUserDto } from './dto/query-user.dto.js';




@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // CREATE
  async create(dto: CreateUserDto): Promise<User> {
  // চেক করি email আগে থেকে আছে কিনা (unique constraint এ ভরসা না করে আগেই বলে দেওয়া ভালো)
  const existing = await this.userRepository.findOneBy({ email: dto.email });
  if (existing) {
    throw new ConflictException('এই email দিয়ে আগেই একাউন্ট আছে');
  }

  // পাসওয়ার্ড হ্যাশ করা - 10 হলো "salt rounds", যত বেশি তত বেশি secure কিন্তু ধীর
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = this.userRepository.create({
    ...dto,
    password: hashedPassword,
  });
  return this.userRepository.save(user);
}

  // READ ALL
  async findAll(query: QueryUserDto) {
  const { page = 1, limit = 10, search } = query;

  const [data, total] = await this.userRepository.findAndCount({
    where: search ? { name: Like(`%${search}%`) } : {},
    skip: (page - 1) * limit, // কতগুলো বাদ দিয়ে শুরু করব
    take: limit,              // কতগুলো নেব
    order: { createdAt: 'DESC' }, // নতুন গুলো আগে
  });

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}

  // READ ONE
  async findOne(id: number): Promise<User> {
  const user = await this.userRepository.findOne({
    where: { id },
    // relations: ['posts'], // এটা না দিলে posts খালি আসবে
  });
  if (!user) throw new NotFoundException(`User with id ${id} পাওয়া যায়নি`);
  return user;
}

  // UPDATE
  async update(id: number, dto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id); // আগে চেক করি user আছে কিনা
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  // DELETE
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} পাওয়া যায়নি`);
    }
  }
}