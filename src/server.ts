import Fastify from 'fastify';
import * as protobuf from 'protobufjs';
import * as path from 'path';

// Load the compiled protobuf file (generated from person.proto)
//const root = await protobuf.load(path.join(__dirname, 'proto/person.proto'));
const root = protobuf.loadSync(path.join(__dirname, 'proto/person.proto'));
const Person = root.lookupType('Person');

const fastify = Fastify({ logger: true });

// custom content type parser for application/octet-stream
fastify.addContentTypeParser('application/octet-stream', { parseAs: 'buffer' }, (req, body, done) => {
    done(null, body);
  });

// POST /person endpoint
fastify.post('/person', async (request, reply) => {
  try {
    // Decode the protobuf message from the request body (Buffer)
    const message = Person.decode(request.body as Buffer);
    console.log('Decoded person message:', message);
    
     // Verify the decoded message against the protobuf schema
     const error = Person.verify(message);
     if (error) {
       reply.status(400).send({ error: `Invalid protobuf message: ${error}` });
       return;
     }

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

fastify.get('/person', async (request, reply) => {
    try {
      const personObject = {
        id: 789,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      };
  
      // Verify that the object conforms to the protobuf schema
      const error = Person.verify(personObject);
      if (error) {
        reply.status(400).send({ error: `Invalid object: ${error}` });
        return;
      }
  
      // Encode the plain JavaScript object into a protobuf binary message
      const message = Person.create(personObject); // Create a protobuf message from the object
      const encodedMessage = Person.encode(message).finish(); // Encode the message to binary format
  
      // Send the encoded protobuf message
      reply
        .header('Content-Type', 'application/octet-stream') // Set the content type to binary
        .send(encodedMessage);
    } catch (err) {
      reply.status(400).send({ error: 'Failed to encode protobuf message' });
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
