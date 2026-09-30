import pandas as pd

from src.engine import prepare_detection_data, run_detection_engine


def create_test_data():
    return pd.DataFrame(
        [
            {
                "transactionId": "TX1001",
                "date": "2026-01-01",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC",
                "quantity": 10,
                "unitPrice": 50000,
                "totalAmount": 500000,
            },
            {
                "transactionId": "TX1002",
                "date": "2026-01-02",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC",
                "quantity": 5,
                "unitPrice": 51000,
                "totalAmount": 255000,
            },
            {
                "transactionId": "TX1003",
                "date": "2026-01-03",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "XYZ",
                "quantity": 8,
                "unitPrice": 49000,
                "totalAmount": 392000,
            },
            {
                "transactionId": "TX1004",
                "date": "2026-01-04",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC",
                "quantity": 10,
                "unitPrice": 80000,
                "totalAmount": 800000,
            },
        ]
    )


def test_prepare_detection_data():
    df = create_test_data()

    result = prepare_detection_data(df)

    assert len(result) == 4
    assert "transactionId" in result.columns
    assert "unitPrice" in result.columns
    assert "totalAmount" in result.columns


def test_run_detection_engine():
    df = create_test_data()

    result = run_detection_engine(df)

    assert isinstance(result, pd.DataFrame)
    assert len(result) >= 1

    assert "transactionId" in result.columns
    assert "severity" in result.columns
    assert "detectionType" in result.columns

    assert "TX1004" in result["transactionId"].values