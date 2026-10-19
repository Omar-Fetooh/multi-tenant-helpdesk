import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Request } from "express";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

type AuthenticatedRequest = Request & {
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    };
};

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
        const user = await this.authService.register(registerDto);
        return { message: "user created successfully", user };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const result = await this.authService.login(loginDto);
        return { message: "user logged in successfully", ...result };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: AuthenticatedRequest) {
        return req.user;
    }
}