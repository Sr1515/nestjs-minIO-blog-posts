import { Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { SignInDTO, SignUpDTO } from './dtos/auth';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from 'generated/prisma';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private jwtService: JwtService
    ) { }

    async signUp(data: SignUpDTO) {

        const userAlreadyExists = await this.prismaService.user.findUnique({
            where: {
                email: data.email
            }
        })

        if (userAlreadyExists) {
            throw new UnauthorizedException("User already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await this.prismaService.user.create({
            data: {
                ...data,
                password: hashedPassword
            }
        });

        return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name
        }
    }

    async signIn(data: SignInDTO) {

        const user = await this.prismaService.user.findUnique({
            where: {
                email: data.email
            }
        })

        if (!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const passwordMatch = await bcrypt.compare(data.password, user.password);

        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = await this.jwtService.signAsync({
            id: user.id,
            name: user.name,
            email: user.email
        })

        return { accessToken };

    }

    async getAll(): Promise<User[] | null> {
        try {
            return await this.prismaService.user.findMany();
        } catch (error) {
            if (error instanceof Prisma.PrismaClientInitializationError) {
                throw new ServiceUnavailableException('Erro de conexão com o banco de dados');
            }
            console.error('Erro inesperado:', error);
            throw new InternalServerErrorException('Erro ao buscar usuários');
        }
    }

    async getById(id: string): Promise<User | null> {
        try {
            return await this.prismaService.user.findUnique({
                where: { id }
            });
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            throw new InternalServerErrorException('Erro ao buscar usuário');
        }
    }

    async deleteUser(id: string): Promise<User | null> {
        try {
            const deletedUser = await this.prismaService.$transaction(async (tx) => {
                await tx.post.deleteMany({ where: { userId: id } });
                return await tx.user.delete({ where: { id } });
            });

            return deletedUser;
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);

            if (error.code === 'P2025') {
                throw new NotFoundException(`Usuário não encontrado`);
            }

            throw new InternalServerErrorException('Erro ao deletar usuário');
        }
    }


}



