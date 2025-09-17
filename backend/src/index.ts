import { app } from './app';

const PORT = process.env['PORT'] || 3000;

const startServer = (): void => {
  try {
    app.listen(PORT, () => {
      console.log(`server running ${PORT}`)
    });
  } catch (error) {
    console.log(error)
  }
};

process.on('uncaughtException', (error: Error) => {
  console.error({ error }, 'Uncaught Exception');;
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', { reason });
  process.exit(1);
});

startServer();