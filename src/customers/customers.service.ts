import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateCustomerDto, organizationId: number) {
    //  check if the org exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }

    return await this.prisma.customer.create({
      data: {
        ...dto,
        organization_customers: {
          create: {
            organization_id: organizationId,
          },
        },
      },
    });
  }

  async getAllCustomersOfOrganization(organizationId: number) {
    // check if org exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }

    return await this.prisma.customer.findMany({
      where: {
        organization_customers: {
          some: {
            organization_id: organizationId,
          },
        },
      },
    });
  }


  async getCustomerInOrganization(organizationId: number, customerId: number) {
    // check if org exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }

    // check if customer exists in the org
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        organization_customers: {
          some: {
            organization_id: organizationId,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with id ${customerId} not found in organization ${organizationId}`,
      );
    }

    return customer;
  }

  async updateCustomer(organizationId: number, customerId: number, updateCustomerDto: UpdateCustomerDto) {
    // check if org exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }

    // check if customer exists in the org
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        organization_customers: {
          some: {
            organization_id: organizationId,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with id ${customerId} not found in organization ${organizationId}`,
      );
    }
    return await this.prisma.customer.update({
      where: { id: customerId },
      data: updateCustomerDto,
    });
  }

  // remove(id: number) {
  //   return this.prisma.team.delete({ where: { id } });
  // }
}
