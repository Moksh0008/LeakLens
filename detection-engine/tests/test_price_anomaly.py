import pandas as pd

from src.price_anomaly import (
    calculate_potential_leakage,
    calculate_price_difference,
    detect_price_anomalies,
)


def create_price_anomaly_data():
    return pd.DataFrame(
        [
            {
                "transactionId": "TX1005",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 20,
                "unitPrice": 75000,
                "benchmarkPrice": 50000,
                "historicalCount": 4,
            },
            {
                "transactionId": "TX1006",
                "product": "LAPTOP",
                "supplier": "XYZ LTD",
                "quantity": 10,
                "unitPrice": 52000,
                "benchmarkPrice": 50000,
                "historicalCount": 4,
            },
        ]
    )


def test_price_difference():
    difference, percentage = calculate_price_difference(
        75000,
        50000,
    )

    assert difference == 25000
    assert percentage == 0.50


def test_potential_leakage():
    leakage = calculate_potential_leakage(
        actual_price=75000,
        benchmark_price=50000,
        quantity=20,
    )

    assert leakage == 500000


def test_no_negative_leakage():
    leakage = calculate_potential_leakage(
        actual_price=45000,
        benchmark_price=50000,
        quantity=20,
    )

    assert leakage == 0


def test_price_anomaly_detection():
    df = create_price_anomaly_data()

    result = detect_price_anomalies(df)

    assert len(result) == 1

    anomaly = result.iloc[0]

    assert anomaly["transactionId"] == "TX1005"
    assert anomaly["actualPrice"] == 75000
    assert anomaly["benchmarkPrice"] == 50000
    assert anomaly["potentialLeakage"] == 500000
    assert anomaly["detectionType"] == "PRICE_ANOMALY"


def test_reason_generation():
    df = create_price_anomaly_data()

    result = detect_price_anomalies(df)

    reason = result.iloc[0]["reason"]

    assert "50.00%" in reason
    assert "historical benchmark" in reason


def test_insufficient_history_not_flagged():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX1007",
                "product": "LAPTOP",
                "supplier": "ABC LTD",
                "quantity": 20,
                "unitPrice": 75000,
                "benchmarkPrice": 50000,
                "historicalCount": 2,
            }
        ]
    )

    result = detect_price_anomalies(df)

    assert result.empty