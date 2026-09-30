// Mock API service for LeakLens
// Later, these functions can be replaced with real backend requests.

const mockDelay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const uploadProcurementFile = async (file) => {
  await mockDelay(1200);

  if (!file) {
    throw new Error("No file selected.");
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Please upload a CSV file.");
  }

  return {
    success: true,
    message: "Procurement data uploaded successfully.",
    fileName: file.name,
    records: 12486,
  };
};

export const analyzeProcurement = async () => {
  await mockDelay(2500);

  return {
    success: true,
    message: "Procurement analysis completed successfully.",
    transactionsAnalyzed: 12486,
    suspiciousTransactions: 147,
    potentialLeakage: 1842000,
  };
};

export const getTransactions = async () => {
  await mockDelay(500);

  return [
    {
      transactionId: "TX1045",
      date: "2026-01-10",
      product: "Laptop",
      category: "Electronics",
      supplier: "ABC Ltd",
      quantity: 20,
      unitPrice: 65000,
      totalAmount: 1300000,
      benchmarkPrice: 50000,
      potentialLeakage: 300000,
      severity: "HIGH",
      detectionType: "PRICE_ANOMALY",
      reason: "Unit price is 30% above the historical benchmark.",
    },
    {
      transactionId: "TX1021",
      date: "2026-01-08",
      product: "Office Chair",
      category: "Furniture",
      supplier: "Comfort Supplies",
      quantity: 15,
      unitPrice: 12500,
      totalAmount: 187500,
      benchmarkPrice: 10000,
      potentialLeakage: 37500,
      severity: "MEDIUM",
      detectionType: "SUPPLIER_PRICE_VARIANCE",
      reason: "Supplier price is higher than comparable historical purchases.",
    },
  ];
};

export const getLeakage = async () => {
  return getTransactions();
};

export const getLeakageByTransactionId = async (transactionId) => {
  const transactions = await getTransactions();

  return transactions.find(
    (transaction) => transaction.transactionId === transactionId
  );
};