const client = require('../grpc_client.js');

// Your 3 distributed nodes
const NODES = [
  '127.0.0.1:50051',
  '127.0.0.1:50052',
  '127.0.0.1:50053'
];

// Helper to promisify callbacks
const putAsync = (addr, key, value) => new Promise((resolve, reject) => {
  client.put(addr, key, value, (err, res) => err ? reject(err) : resolve(res));
});

const getAsync = (addr, key) => new Promise((resolve, reject) => {
  client.get(addr, key, (err, res) => err ? reject(err) : resolve(res));
});

async function testDistributedDB() {
  console.log('========================================');
  console.log('   Distributed Database Test Suite');
  console.log('========================================\n');

  const testKey = `test_key_${Date.now()}`;
  const testValue = `test_value_${Math.random().toString(36).substring(7)}`;

  // Test 1: Write to Node 1
  console.log('TEST 1: Write to Node 1');
  console.log(`  Key: ${testKey}`);
  console.log(`  Value: ${testValue}`);
  try {
    const putRes = await putAsync(NODES[0], testKey, testValue);
    console.log(`  ✅ PUT response: ${JSON.stringify(putRes)}\n`);
  } catch (err) {
    console.log(`  ❌ PUT failed: ${err.message}\n`);
    return;
  }

  // Wait a moment for replication
  console.log('  ⏳ Waiting 1 second for replication...\n');
  await new Promise(r => setTimeout(r, 1000));

  // Test 2: Read from ALL nodes to verify replication
  console.log('TEST 2: Read from ALL nodes (verify replication)');
  let successCount = 0;
  
  for (let i = 0; i < NODES.length; i++) {
    const node = NODES[i];
    try {
      const getRes = await getAsync(node, testKey);
      if (getRes.found && getRes.value === testValue) {
        console.log(`  ✅ Node ${i + 1} (${node}): Found correct value`);
        successCount++;
      } else if (getRes.found) {
        console.log(`  ⚠️  Node ${i + 1} (${node}): Found but wrong value: "${getRes.value}"`);
      } else {
        console.log(`  ❌ Node ${i + 1} (${node}): Key not found (replication may have failed)`);
      }
    } catch (err) {
      console.log(`  ❌ Node ${i + 1} (${node}): Error - ${err.message}`);
    }
  }

  // Test 3: Write to different node, read from others
  console.log('\nTEST 3: Write to Node 2, read from Node 3');
  const testKey2 = `cross_node_${Date.now()}`;
  const testValue2 = 'cross_node_value';
  
  try {
    await putAsync(NODES[1], testKey2, testValue2);
    console.log(`  ✅ PUT to Node 2 successful`);
    
    await new Promise(r => setTimeout(r, 1000));
    
    const getRes = await getAsync(NODES[2], testKey2);
    if (getRes.found && getRes.value === testValue2) {
      console.log(`  ✅ GET from Node 3: Found correct value - Replication works!`);
      successCount++;
    } else {
      console.log(`  ❌ GET from Node 3: ${getRes.found ? 'Wrong value' : 'Not found'}`);
    }
  } catch (err) {
    console.log(`  ❌ Cross-node test failed: ${err.message}`);
  }

  // Summary
  console.log('\n========================================');
  console.log('   Test Summary');
  console.log('========================================');
  if (successCount >= 3) {
    console.log('✅ Distributed database is working correctly!');
    console.log('   - Writes are successful');
    console.log('   - Replication across nodes is working');
  } else if (successCount > 0) {
    console.log('⚠️  Partial success - some replication may be failing');
  } else {
    console.log('❌ Distributed database test failed');
  }
}

testDistributedDB().catch(console.error);
