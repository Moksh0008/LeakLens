import pandas as pd

from src.supplier_variance import (
    calculate_comparable_supplier_median,
    calculate_supplier_potential_leakage,
    calculate_supplier_variance,
    detect_supplier_price_variance,
)


def create_supplier_data():
    return pd.DataFrame(
        [
            {
                "transactionId": "TX2001",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 10,
                "unitPrice": 50000,
            },
            {
                "transactionId": "TX2002",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "XYZ LTD",
                "quantity": 10,
                "unitPrice": 52000,
            },
            {
                "transactionId": "TX2003",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "PQR LTD",
                "quantity": 20,
                "unitPrice": 75000,
            },
        ]
    )


def test_comparable_supplier_median():
    df = create_supplier_data()

    benchmark, supplier_count = (
        calculate_comparable_supplier_median(
            df,
            "LAPTOP",
            "ELECTRONICS",
            "PQR LTD",
        )
    )

    assert benchmark == 51000
    assert supplier_count == 2


def test_supplier_variance_calculation():
    difference, percentage = calculate_supplier_variance(
        actual_price=75000,
        comparable_price=51000,
    )

    assert difference == 24000
    assert round(percentage, 4) == round(
        24000 / 51000,
        4,
    )


def test_supplier_leakage():
    leakage = calculate_supplier_potential_leakage(
        actual_price=75000,
        comparable_price=51000,
        quantity=20,
    )

    assert leakage == 480000


def test_supplier_variance_detection():
    df = create_supplier_data()

    result = detect_supplier_price_variance(df)

    assert len(result) == 1

    anomaly = result.iloc[0]

    assert anomaly["transactionId"] == "TX2003"
    assert anomaly["actualPrice"] == 75000
    assert anomaly["benchmarkPrice"] == 51000
    assert anomaly["potentialLeakage"] == 480000
    assert (
        anomaly["detectionType"]
        == "SUPPLIER_PRICE_VARIANCE"
    )


def test_normal_supplier_price_not_flagged():
    df = create_supplier_data()

    result = detect_supplier_price_variance(df)

    assert "TX2001" not in result["transactionId"].values
    assert "TX2002" not in result["transactionId"].values


def test_insufficient_supplier_comparison():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX3001",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 10,
                "unitPrice": 75000,
            },
            {
                "transactionId": "TX3002",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "XYZ LTD",
                "quantity": 10,
                "unitPrice": 50000,
            },
        ]
    )

    result = detect_supplier_price_variance(df)

    assert result.empty