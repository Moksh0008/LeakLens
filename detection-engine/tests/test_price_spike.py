import pandas as pd

from src.price_spike import (
    calculate_price_spike,
    calculate_spike_leakage,
    detect_price_spikes,
)


def create_spike_data():
    return pd.DataFrame(
        [
            {
                "transactionId": "TX4001",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 20,
                "unitPrice": 65000,
                "historicalPrice": 50000,
                "historicalCount": 4,
            },
            {
                "transactionId": "TX4002",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "XYZ LTD",
                "quantity": 10,
                "unitPrice": 52000,
                "historicalPrice": 50000,
                "historicalCount": 4,
            },
        ]
    )


def test_price_spike_calculation():
    difference, percentage = calculate_price_spike(
        actual_price=65000,
        historical_price=50000,
    )

    assert difference == 15000
    assert percentage == 0.30


def test_spike_leakage():
    leakage = calculate_spike_leakage(
        actual_price=65000,
        historical_price=50000,
        quantity=20,
    )

    assert leakage == 300000


def test_no_negative_spike_leakage():
    leakage = calculate_spike_leakage(
        actual_price=48000,
        historical_price=50000,
        quantity=20,
    )

    assert leakage == 0


def test_price_spike_detection():
    df = create_spike_data()

    result = detect_price_spikes(df)

    assert len(result) == 1

    anomaly = result.iloc[0]

    assert anomaly["transactionId"] == "TX4001"
    assert anomaly["actualPrice"] == 65000
    assert anomaly["benchmarkPrice"] == 50000
    assert anomaly["potentialLeakage"] == 300000
    assert anomaly["detectionType"] == "PRICE_SPIKE"


def test_normal_price_not_flagged():
    df = create_spike_data()

    result = detect_price_spikes(df)

    assert "TX4002" not in result["transactionId"].values


def test_insufficient_history_not_flagged():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX4003",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 20,
                "unitPrice": 65000,
                "historicalPrice": 50000,
                "historicalCount": 2,
            }
        ]
    )

    result = detect_price_spikes(df)

    assert result.empty