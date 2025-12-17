const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDef = protoLoader.loadSync('../proto/kv.proto', {});
const kvProto = grpc.loadPackageDefinition(packageDef).kv;

function makeClient(address) {
  return new kvProto.KeyValue(address, grpc.credentials.createInsecure());
}

function put(address, key, value, cb) {
  const client = makeClient(address);
  client.Put({ key, value, modified_at: Date.now() }, (err, resp) => cb(err, resp));
}

function get(address, key, cb) {
  const client = makeClient(address);
  client.Get({ key }, (err, resp) => cb(err, resp));
}

module.exports = { put, get };
