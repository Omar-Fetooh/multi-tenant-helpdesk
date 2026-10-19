import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async register(registerDto: RegisterDto) {

        let { email } = registerDto;

        email = email.toLowerCase().trim();


        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        })


        if (existingUser) {
            throw new ConflictException('Email already taken');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, Number(process.env.BCRYPT_SALT_ROUNDS));

        const user = await this.prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                first_name: registerDto.first_name,
                last_name: registerDto.last_name,
            },
        });
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login(loginDto: LoginDto) {
        let { email, password } = loginDto;
        email = email.toLowerCase().trim();

        const user = await this.prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.is_active) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload);

        const { password_hash, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken
        };
    }

}
