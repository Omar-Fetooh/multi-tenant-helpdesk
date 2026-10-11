import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateTeamDto) {
    return await this.prisma.team.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.team.findMany();
  }

  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException(
        `Team with id ${id} not found`,
      );
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const existingTeam = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!existingTeam) {
      throw new NotFoundException(
        `Team with id ${id} not found`,
      );
    }
    return await this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
    });
  }

  remove(id: number) {
    return this.prisma.team.delete({ where: { id } });
  }
}
