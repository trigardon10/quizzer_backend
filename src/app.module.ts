import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entities/User';
import { Category } from './Entities/Category';
import { Entry } from './Entities/Entry';
import { Result } from './Entities/Result';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppMiddleware } from './app.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'quizzer',
      entities: [User, Category, Entry, Result],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Category, Entry, Result]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
  .apply(AppMiddleware)
  .exclude(
    { path: 'login', method: RequestMethod.POST },
  )
  .forRoutes(AppController);
  }
}
