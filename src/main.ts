import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v2')
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Elimina propiedades no definidas en el DTO
    forbidNonWhitelisted: true,  // Lanza un error si hay propiedades adicionales
    transform: true,  // Transforma los tipos de datos automáticamente
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
