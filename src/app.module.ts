import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { mongooseConfig } from './database/mongoose.config';
import { AnyExceptionFilter } from './http-exception.filter';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { CastErrorFilter } from './cast-error.filter';
import { UserModule } from './user/user.module';
import { AddressModule } from './address/address.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { OrderModule } from './order/order.module';
// import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //  Make the configuration module available globally
    }),
    CloudinaryModule,  
    AuthModule,
    mongooseConfig(),
    UserModule,
    AddressModule,
    CategoryModule,
    ProductModule,
    OrderModule,
   // Register MulterModule with your configuration
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AnyExceptionFilter,
    },

    {
      provide: APP_FILTER,
      useClass: CastErrorFilter,
    },
    AppService,
    CloudinaryProvider
  ],
})
export class AppModule {}
