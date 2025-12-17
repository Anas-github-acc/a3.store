const client = require('../grpc_client.js');
// client.put('127.0.0.1:50052', 'check', 'tasmiya', (err, res) => {
//   if (err) return console.error(err);
//   console.log('PUT OK', res);
// });


client.get('127.0.0.1:50052', 'name', (err2, res2) => {
  console.log('GET', res2);
});