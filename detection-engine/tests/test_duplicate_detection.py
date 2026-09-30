import pandas as pd

from src.duplicate_detection import (
    detect_possible_duplicates,
)


def create_duplicate_data():
    return pd.DataFrame(
        [
            {
                "transactionId": "TX5001",
                "date": "2026-01-10",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 10,
                "totalAmount": 500000,
            },
            {
                "transactionId": "TX5002",
                "date": "2026-01-11",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 10,
                "totalAmount": 500000,
            },
            {
                "transactionId": "TX5003",
                "date": "2026-01-20",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 10,
                "totalAmount": 500000,
            },
        ]
    )


def test_possible_duplicate_detection():
    df = create_duplicate_data()

    result = detect_possible_duplicates(df)

    assert len(result) == 2

    assert set(
        result["transactionId"]
    ) == {"TX5001", "TX5002"}

    assert all(
        result["detectionType"]
        == "POSSIBLE_DUPLICATE"
    )


def test_duplicate_reason():
    df = create_duplicate_data()

    result = detect_possible_duplicates(df)

    reason = result.iloc[0]["reason"]

    assert "highly similar" in reason
    assert "day(s) apart" in reason


def test_transactions_outside_window_not_flagged():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX6001",
                "date": "2026-01-01",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 10,
                "totalAmount": 500000,
            },
            {
                "transactionId": "TX6002",
                "date": "2026-01-20",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 10,
                "totalAmount": 500000,
            },
        ]
    )

    result = detect_possible_duplicates(df)

    assert result.empty


def test_different_supplier_not_flagged():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX7001",
                "date": "2026-01-10",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 10,
                "totalAmount": 500000,
            },
            {
                "transactionId": "TX7002",
                "date": "2026-01-11",
                "product": "LAPTOP",
                "supplier": "XYZ LTD",
                "quantity": 10,
                "totalAmount": 500000,
            },
        ]
    )

    result = detect_possible_duplicates(df)

    assert result.empty


def test_different_quantity_not_flagged():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX8001",
                "date": "2026-01-10",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 10,
                "totalAmount": 500000,
            },
            {
                "transactionId": "TX8002",
                "date": "2026-01-11",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 20,
                "totalAmount": 1000000,
            },
        ]
    )

    result = detect_possible_duplicates(df)

    assert result.empty