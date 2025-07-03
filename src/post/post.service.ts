import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class PostService {

    constructor(
        private prisma: PrismaService,
        private s3: S3Service
    ) { }

    async create(data: { content?: string; image?: Express.Multer.File; userId: string }) {

        let imageUrl: string | null = null;

        if (data.image) {
            imageUrl = await this.s3.uploadFile(data.image);
        }

        return this.prisma.post.create({
            data: {
                content: data.content,
                imageUrl,
                userId: data.userId
            }
        });
    }

    async getAll() {
        return this.prisma.post.findMany();
    }
}
