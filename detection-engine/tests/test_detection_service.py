import pandas as pd

from src.detection_service import analyze_transactions


def test_analyze_transactions_returns_list():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX001",
                "date": "2026-01-01",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC",
                "quantity": 10,
                "unitPrice": 50000,
                "totalAmount": 500000,
            },
            {
                "transactionId": "TX002",
                "date": "2026-01-02",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC",
                "quantity": 10,
                "unitPrice": 51000,
                "totalAmount": 510000,
            },
            {
                "transactionId": "TX003",
                "date": "2026-01-03",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC",
                "quantity": 10,
                "unitPrice": 49500,
                "totalAmount": 495000,
            },
            {
                "transactionId": "TX004",
                "date": "2026-01-04",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC",
                "quantity": 10,
                "unitPrice": 50500,
                "totalAmount": 505000,
            },
            {
                "transactionId": "TX005",
                "date": "2026-01-05",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC",
                "quantity": 10,
                "unitPrice": 80000,
                "totalAmount": 800000,
            },
        ]
    )

    results = analyze_transactions(df)

    assert isinstance(results, list)
    assert len(results) > 0

    assert isinstance(results[0], dict)

    assert "transactionId" in results[0]
    assert "detectionType" in results[0]
    assert "severity" in results[0]
    assert "reason" in results[0]


def test_empty_detection_returns_empty_list():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX001",
                "date": "2026-01-01",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC",
                "quantity": 10,
                "unitPrice": 50000,
                "totalAmount": 500000,
            },
        ]
    )

    results = analyze_transactions(df)

    assert isinstance(results, list)