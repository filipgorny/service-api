const {
  Controller,
  Get,
  ControllerParser,
} = require('./dist/index.js');

console.log('✓ Controller:', typeof Controller);
console.log('✓ Get:', typeof Get);
console.log('✓ ControllerParser:', typeof ControllerParser);
console.log('\n✅ All controller exports available!');
