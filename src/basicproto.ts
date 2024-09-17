import * as protobuf from 'protobufjs';
import * as path from 'path';


async function main() {
  const root = await protobuf.load(path.join(__dirname, 'proto', 'person.proto'));
  const Person = root.lookupType('Person');

  const payload = {
    name: 'John Doe',
    id: 1234,
    email: 'john.doe@example.com'
  };

  const errMsg = Person.verify(payload);
  if (errMsg) {
    throw Error(errMsg);
  }

  const message = Person.create(payload);
  const buffer = Person.encode(message).finish();

  console.log("Encoded buffer: ", buffer);

  const decodedMessage = Person.decode(buffer);
  console.log("Decoded message: ", decodedMessage);

  const object = Person.toObject(decodedMessage);

  console.log("Decoded object: ", object);

}

main().catch(err => console.error(err));
