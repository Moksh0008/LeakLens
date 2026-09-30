# LeakLens — Detection Engine

Member 4 module for the LeakLens Procurement Leakage Intelligence system.

The Detection Engine analyzes procurement transactions and identifies
potential procurement leakage patterns using deterministic and
explainable statistical rules.

---

## 1. Responsibilities

This module handles:

- Data preprocessing
- Data validation
- Historical price benchmarks
- Price anomaly detection
- Supplier price variance detection
- Price spike detection
- Possible duplicate detection
- Unusual quantity detection
- Potential leakage calculation
- Severity classification
- Detection reasons
- Automated tests

The engine does NOT determine fraud.

A detection indicates a transaction that requires further review.

---

# 2. Technology Stack

- Python
- pandas
- NumPy
- pytest

---

# 3. Project Structure

```text
detection-engine/
│
├── sample_data/
│   └── procurement.csv
│
├── src/
│   ├── __init__.py
│   ├── preprocessing.py
│   ├── benchmarks.py
│   ├── price_anomaly.py
│   ├── supplier_variance.py
│   ├── price_spike.py
│   ├── duplicate_detection.py
│   ├── quantity_anomaly.py
│   ├── severity.py
│   └── engine.py
│
├── tests/
│   ├── test_preprocessing.py
│   ├── test_benchmarks.py
│   ├── test_price_anomaly.py
│   ├── test_supplier_variance.py
│   ├── test_price_spike.py
│   ├── test_duplicate_detection.py
│   ├── test_quantity_anomaly.py
│   ├── test_severity.py
│   ├── test_engine.py
│   └── test_engine_integration.py
│
├── requirements.txt
├── .gitignore
└── README.md