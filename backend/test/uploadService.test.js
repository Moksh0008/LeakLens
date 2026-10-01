const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

// The test only exercises CSV validation (pure functions), so stub the
// Supabase env before uploadService pulls in the real client. The service
// module is never called over the network in this suite.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || 'test-key';

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
