const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDef = protoLoader.loadSync('./proto/kv.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const kvProto = grpc.loadPackageDefinition(packageDef).kv;

// Cache clients to reuse connections
const clients = new Map();

function makeClient(address) {
  if (!clients.has(address)) {
    clients.set(address, new kvProto.KeyValue(address, grpc.credentials.createInsecure()));
  }
  return clients.get(address);
}

function put(address, key, value, cb) {
  const client = makeClient(address);
  const request = {
    key,
    value,
    modified_at: Date.now().toString()
  };
  client.Put(request, (err, resp) => {
    if (err) return cb(err, null);
    cb(null, resp);
  });
}

function get(address, key, cb) {
  const client = makeClient(address);
  client.Get({ key }, (err, resp) => {
    if (err) return cb(err, null);
    cb(null, resp);
  });
}

module.exports = { put, get };
