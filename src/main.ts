// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common'; // Import the ValidationPipe module

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.useGlobalPipes(new ValidationPipe());
//   await app.listen(process.env.PORT);
//   console.log(`Application is running on: ${await app.getUrl()}`);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { setupSwagger } from './swaggerConfig'; // Update the path accordingly

import * as cluster from 'cluster';
import * as os from 'os';

async function bootstrap() {
  if ((cluster as any).isMaster) {
    const numCPUs = os.cpus().length;

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
      (cluster as any).fork();
    }

    (cluster as any).on('exit', (worker: any, code: any, signal: any) => {
      console.log(`Worker ${worker.process.pid} died`);
    });
  } else {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    // Set up Swagger documentation
    setupSwagger(app);

    await app.listen(process.env.PORT);
    console.log(
      `Worker ${
        process.pid
      } started. Application is running on: ${await app.getUrl()}`,
    );
  }
}

bootstrap();
