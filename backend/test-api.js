const http = require('http');

async function testStatus(endpoint) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000/api/${endpoint}`, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve('error'));
  });
}

async function runTests() {
  const [docs, auth, plans] = await Promise.all([
    testStatus('docs'),
    testStatus('auth/google/callback'),
    testStatus('workout-plans')
  ]);
  console.log(`Docs: ${docs}, Auth: ${auth}, Plans: ${plans}`);
}
runTests();
