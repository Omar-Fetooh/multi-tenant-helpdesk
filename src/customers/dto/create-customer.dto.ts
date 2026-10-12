import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  @MinLength(2)
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

// model Customer {
//   id         Int      @id @default(autoincrement())
//   first_name String
//   last_name  String
//   email      String
//   phone      String?
//   created_at DateTime @default(now())
//   updated_at DateTime @updatedAt

//   organization_customers OrganizationCustomer[]
//   tickets                Ticket[]
// }
