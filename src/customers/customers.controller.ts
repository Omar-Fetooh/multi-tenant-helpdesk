import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('organizations/:organizationId/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @Post()
  create(
    @Body() createCustomerDto: CreateCustomerDto, 
    @Param('organizationId', ParseIntPipe) organizationId: number
  ) {
    return this.customersService.create(createCustomerDto, organizationId);
  }

  @Get()
  getAllCustomersOfOrganization(
    @Param('organizationId', ParseIntPipe) organizationId: number
  ) {
    return this.customersService.getAllCustomersOfOrganization(organizationId);
  }


  @Get(':customerId')
  getCustomerInOrganization(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.customersService.getCustomerInOrganization(organizationId, customerId);
  }

  @Patch(':customerId')
  updateCustomer(
   @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(organizationId, customerId, updateCustomerDto);
  }

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.customersService.remove(id);
  // }
}
