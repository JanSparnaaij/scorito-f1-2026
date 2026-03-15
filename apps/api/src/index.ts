import Fastify from 'fastify';
import routes from './routes';

const fastify = Fastify({ logger: true });

fastify.register(routes);

const port = process.env.PORT || 3000;
fastify.listen({ port: Number(port), host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on port ${port}`);
});
