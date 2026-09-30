import pandas as pd

from src.quantity_anomaly import (
    calculate_quantity_bounds,
    detect_quantity_anomalies,
)


def create_quantity_data():
    return pd.DataFrame(
        [
            {
                "transactionId": "TX9001",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 10,
            },
            {
                "transactionId": "TX9002",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 11,
            },
            {
                "transactionId": "TX9003",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "XYZ LTD",
                "quantity": 12,
            },
            {
                "transactionId": "TX9004",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "XYZ LTD",
                "quantity": 10,
            },
            {
                "transactionId": "TX9005",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "PQR LTD",
                "quantity": 13,
            },
            {
                "transactionId": "TX9006",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 50,
            },
        ]
    )


def test_quantity_bounds():
    quantities = pd.Series(
        [10, 11, 12, 10, 13]
    )

    lower, upper = calculate_quantity_bounds(
        quantities
    )

    assert lower <= 10
    assert upper >= 13


def test_unusual_quantity_detection():
    df = create_quantity_data()

    result = detect_quantity_anomalies(df)

    assert len(result) == 1

    anomaly = result.iloc[0]

    assert anomaly["transactionId"] == "TX9006"
    assert anomaly["quantity"] == 50
    assert (
        anomaly["detectionType"]
        == "UNUSUAL_QUANTITY"
    )


def test_normal_quantities_not_flagged():
    df = create_quantity_data()

    result = detect_quantity_anomalies(df)

    assert "TX9001" not in result[
        "transactionId"
    ].values

    assert "TX9002" not in result[
        "transactionId"
    ].values


def test_insufficient_history():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX9101",
                "product": "PHONE",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 10,
            },
            {
                "transactionId": "TX9102",
                "product": "PHONE",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 100,
            },
        ]
    )

    result = detect_quantity_anomalies(df)

    assert result.empty


def test_different_product_not_compared():
    df = pd.DataFrame(
        [
            {
                "transactionId": "TX9201",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 10,
            },
            {
                "transactionId": "TX9202",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "XYZ LTD",
                "quantity": 11,
            },
            {
                "transactionId": "TX9203",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "PQR LTD",
                "quantity": 12,
            },
            {
                "transactionId": "TX9204",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "quantity": 10,
            },
            {
                "transactionId": "TX9205",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "XYZ LTD",
                "quantity": 13,
            },
            {
                "transactionId": "TX9206",
                "product": "CHAIR",
                "category": "FURNITURE",
                "supplier": "ABC LTD",
                "quantity": 100,
            },
        ]
    )

    result = detect_quantity_anomalies(df)

    assert "TX9206" not in result[
        "transactionId"
    ].values