import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PostModule } from './post/post.module';


@Module({
  imports: [AuthModule, PostModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
