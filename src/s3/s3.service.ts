import { Injectable, Logger } from "@nestjs/common";
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { ConfigService } from '@nestjs/config';


@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private readonly bucketName: string;
    private readonly s3: S3Client;

    constructor(private readonly configService: ConfigService) {
        this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') ?? 'posts';

        this.s3 = new S3Client({
            region: 'us-east-1',
            endpoint: this.configService.get<string>('MINIO_ENDPOINT') ?? 'http://localhost:9000',
            credentials: {
                accessKeyId: this.configService.get<string>('MINIO_ACCESS_KEY'),
                secretAccessKey: this.configService.get<string>('MINIO_SECRET_KEY'),
            },
            forcePathStyle: true,
        });
    }


    async setPublicBucketPolicy(): Promise<void> {
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: "*",
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${this.bucketName}/*`]
                }
            ]
        };

        await this.s3.send(new PutBucketPolicyCommand({
            Bucket: this.bucketName,
            Policy: JSON.stringify(policy),
        }));

        this.logger.log(`Política pública aplicada ao bucket "${this.bucketName}".`);
    }

    async createBucketIfNotExists(): Promise<void> {
        try {
            await this.s3.send(new HeadBucketCommand({ Bucket: this.bucketName }));
            this.logger.log(`Bucket "${this.bucketName}" já existe.`);
        } catch (err) {
            if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
                await this.s3.send(new CreateBucketCommand({ Bucket: this.bucketName }));
                this.logger.log(`Bucket "${this.bucketName}" criado.`);

                await this.setPublicBucketPolicy();
            } else {
                throw err;
            }
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {

        await this.createBucketIfNotExists();

        const key = `${randomUUID()}-${file.originalname}`;

        await this.s3.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));

        return `http://localhost:9000/${this.bucketName}/${key}`
    }

}

