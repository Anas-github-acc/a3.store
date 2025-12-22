const client = require('../grpc_client.js');

// PUT operation
client.put('127.0.0.1:50052', 'check', 'tasmiya', (err, res) => {
  if (err) {
    console.error('PUT Error:', err.message);
    return;
  }
  console.log('PUT Success:', res);
  
});
// GET operation after PUT succeeds
client.get('127.0.0.1:50052', 'check', (err2, res2) => {
  if (err2) {
    console.error('GET Error:', err2.message);
    return;
  }
  console.log('GET Success:', res2);
});