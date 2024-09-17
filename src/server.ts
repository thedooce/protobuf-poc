import Fastify from 'fastify';
import * as protobuf from 'protobufjs';
import * as path from 'path';

// Load the compiled protobuf file (generated from person.proto)
//const root = await protobuf.load(path.join(__dirname, 'proto/person.proto'));
const root = protobuf.loadSync(path.join(__dirname, 'proto/person.proto'));
const Person = root.lookupType('Person');

const fastify = Fastify({ logger: true });

fastify.post('/person', async (request, reply) => {
  try {
    // Decode the protobuf message from the request body (Buffer)
    const message = Person.decode(request.body as Buffer);
    console.log('Decoded person message:', message);

    // Convert the protobuf message to a plain JavaScript object
    const personObject = Person.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
        defaults: true
      });
    console.log('Decoded person object:', personObject);

    reply.send(personObject); // Send back the decoded person object
  } catch (err) {
    reply.status(400).send({ error: 'Failed to decode protobuf message' });
  }
});

// Health check endpoint
fastify.get("/health", async (request, reply) => {
    reply.log.info('Health check passed');
    return reply.send({ status: "ok" });
  });

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server is running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
