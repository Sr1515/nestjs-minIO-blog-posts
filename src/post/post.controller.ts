import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { get } from 'http';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) { }

    @UseGuards(AuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async createPost(
        @UploadedFile() image: Express.Multer.File,
        @Body('content') content: string,
        @Request() req: any,
    ) {
        return this.postService.create({
            content,
            image,
            userId: req.user.id,
        });
    }

    @UseGuards(AuthGuard)
    @Get()
    async getAllPosts() {
        return this.postService.getAll()
    }
}
