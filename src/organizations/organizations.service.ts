import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Prisma } from '@prisma/client';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateOrganizationDto) {
    try {
      return await this.prisma.organization.create({
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An organization with this slug already exists',
        );
      }

      throw error;
    }
  }
  findAll() {
    return this.prisma.organization.findMany();
  }

  async findOne(id: number) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${id} not found`,
      );
    }

    return organization;
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    try {
      const existingOrganization = await this.prisma.organization.findUnique({
        where: { id },
      });

      if (!existingOrganization) {
        throw new NotFoundException(
          `Organization with id ${id} not found`,
        );
      }

      return await this.prisma.organization.update({
        where: { id },
        data: updateOrganizationDto,
      });
    }
    catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An organization with this slug already exists',
        );
      }
      throw error;
    }

  }

  remove(id: number) {
    return this.prisma.organization.delete({ where: { id } });
  }
}
