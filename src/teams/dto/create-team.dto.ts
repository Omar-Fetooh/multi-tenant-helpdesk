import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  description?: string;

  @IsInt()
  @IsNotEmpty()
  organization_id: number;
}
