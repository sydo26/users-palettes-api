import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './api/app.module';
import { dataBaseProvider, getSetupQuery } from './services/db';

(async () => {
  await dataBaseProvider.useValue.query(await getSetupQuery());

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Palette Application')
    .setDescription(
      'Esse projeto permite salvar paleta de cores em um banco de dados. Feito como projeto final da disciplina de banco de dados, com o intuito de construir um banco de dados e acessá-lo por um app.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(3000);
})();
