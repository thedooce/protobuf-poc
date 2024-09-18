//this script creates a binary file with a valid person object, which can be used as input for the POST endpoint via Postman
const fs = require('fs');
const protobuf = require('protobufjs');

protobuf.load('dist/proto/person.proto', (err, root) => {
  if (err) throw err;

  const Person = root.lookupType('Person');
  const payload = { id: 123, name: 'John Doe', email: 'JohnDoe@example.com'};

  const errMsg = Person.verify(payload);
  if (errMsg) throw Error(errMsg);

  const message = Person.create(payload);
  const buffer = Person.encode(message).finish();

  fs.writeFileSync('personValid.bin', buffer);
});