import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Încredere în proxy (Cloudflare / Nginx) pentru extragerea corectă a IP-ului real
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // 2. Helmet - Protecție HTTP Headers avansată
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          scriptSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // 3. Cookie Parser pentru Refresh Token securizat în HttpOnly cookie
  app.use(cookieParser());

  // 4. CORS Restrictiv (Localhost + Cloudflare Pages & Workers)
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite cereri fără origine (ex. mobile apps sau curl intern)
      if (!origin) return callback(null, true);

      // Verifică originile permise sau domeniile Cloudflare (*.pages.dev)
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /\.pages\.dev$/.test(origin) ||
        /localhost:\d+$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocat pentru originea neautorizată: ${origin}`);
        callback(new Error('Origine blocată de politica CORS SaveBite.'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });

  // 5. Conductă Globală de Validare & Protecție Anti-Mass-Assignment
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Șterge automat câmpurile necunoscute din request
      forbidNonWhitelisted: true,   // Aruncă eroare 400 dacă un atacator trimite proprietăți neautorizate
      transform: true,              // Convertește automat tipurile conform DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 6. Filtre de Excepție & Interceptori Uniformi
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // 7. Prefix global API
  app.setGlobalPrefix('api');

  // 8. Pornire server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Serverul SaveBite Backend rulează securizat pe portul ${port} (API: http://localhost:${port}/api)`);
}

bootstrap();
