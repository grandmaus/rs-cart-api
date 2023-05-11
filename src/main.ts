import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  try {
    const app = await NestFactory.create(AppModule, {
      abortOnError: false,
    });

    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
  } catch (err) {
    console.log('err >>>>>>>>>', err);
  }
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  console.log('event', event);
  console.log('context', context);
  console.log('callback', callback);
  return server(event, context, callback);
};
