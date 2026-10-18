import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DevAppModule } from './app.module';

// Citește ai-map-notification/.env (ANTHROPIC_API_KEY etc.), dacă există.
try {
  process.loadEnvFile('.env');
} catch {
  // Fără .env: rămân variabilele din terminal.
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(DevAppModule);
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`ai-map-notification dev server: http://localhost:${port}`);
  const aiMode =
    process.env.AI_DISABLED === '1'
      ? 'dezactivat (AI_DISABLED=1) → mesaje-șablon'
      : process.env.ANTHROPIC_API_KEY
        ? 'Claude (cheie găsită)'
        : 'fără ANTHROPIC_API_KEY → mesaje-șablon';
  console.log(`AI: ${aiMode}`);
}

void bootstrap();
