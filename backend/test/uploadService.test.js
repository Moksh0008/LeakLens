const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { validateAndTransformRows } = require('../src/services/uploadService');

test('flags duplicate transaction IDs in the uploaded CSV', () => {
  const rows = [
    {
      transactionId: 'TX1001',
      date: '2026-01-10',
      product: 'Laptop',
      category: 'Electronics',
      supplier: 'ABC Ltd',
      quantity: '10',
      unitPrice: '50000',
      totalAmount: '500000'
    },
    {
      transactionId: 'TX1001',
      date: '2026-01-11',
      product: 'Laptop',
      category: 'Electronics',
      supplier: 'ABC Ltd',
      quantity: '12',
      unitPrice: '52000',
      totalAmount: '624000'
    }
  ];

  const { errors } = validateAndTransformRows(rows);

  assert.ok(
    errors.some((error) => error.includes('Duplicate transaction IDs found')),
    'Duplicate transaction IDs should be detected before upload.'
  );
});
