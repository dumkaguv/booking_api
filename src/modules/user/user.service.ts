import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { compareSync, hashSync } from 'bcrypt'

import { FindAllQueryDto } from '@/common/dtos'
import { paginate } from '@/common/utils'
import { PrismaService } from '@/prisma/prisma.service'

import { includeUserWithRelations } from './constants'

import { CreateUserDto, ResponseUserDto, UpdateUserDto } from './dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  public findAll(query: FindAllQueryDto<ResponseUserDto>) {
    return paginate({
      prisma: this.prisma,
      model: 'user',
      include: includeUserWithRelations,
      ...query
    })
  }

  public findOne(id: number) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: includeUserWithRelations
    })
  }

  public async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto

    const candidate = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    })

    if (candidate) {
      throw new BadRequestException(
        `User with such email or username already exist: (${email}, ${username})`
      )
    }

    const hashPassword = this.hashPassword(password)

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashPassword
      },
      include: includeUserWithRelations
    })
    // todo: email service

    return user
  }

  public async update(
    id: number,
    updateUserDto: UpdateUserDto & { password?: string }
  ) {
    await this.prisma.user.update({
      where: { id },
      data: updateUserDto
    })

    return this.findOne(id)
  }

  public remove(id: number) {
    return this.prisma.user.delete({ where: { id } })
  }

  public async comparePasswords(
    password: string,
    email?: string,
    userId?: number
  ) {
    const whereCondition = {
      OR: [] as Record<string, string | number>[]
    }

    if (email) {
      whereCondition.OR.push({ email })
    }

    if (userId) {
      whereCondition.OR.push({ id: userId })
    }

    if (whereCondition.OR.length === 0) {
      throw new BadRequestException('Email or userId must be provided')
    }

    const user = await this.prisma.user.findFirstOrThrow({
      include: includeUserWithRelations,
      where: whereCondition
    })

    const isValidPassword = compareSync(password, user.password)

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return user
  }

  public async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ) {
    await this.comparePasswords(oldPassword, undefined, userId)
    const hashedPassword = this.hashPassword(newPassword)

    return this.update(userId, { password: hashedPassword })
  }

  private hashPassword(password: string, rounds: number = 10) {
    return hashSync(password, rounds)
  }
}
