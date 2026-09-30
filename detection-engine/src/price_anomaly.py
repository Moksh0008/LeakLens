import pandas as pd


PRICE_ANOMALY_THRESHOLD = 0.20
MIN_HISTORICAL_COUNT = 3


def calculate_price_difference(
    actual_price: float,
    benchmark_price: float,
) -> tuple[float, float]:
    """
    Calculate absolute and percentage price difference.

    Returns:
        price_difference
        percentage_difference
    """

    if benchmark_price <= 0:
        raise ValueError(
            "Benchmark price must be greater than zero."
        )

    price_difference = actual_price - benchmark_price

    percentage_difference = (
        price_difference / benchmark_price
    )

    return price_difference, percentage_difference


def calculate_potential_leakage(
    actual_price: float,
    benchmark_price: float,
    quantity: float,
) -> float:
    """
    Calculate potential excess spend.

    Only positive price differences are considered
    potential leakage.

    Formula:

        (actual price - benchmark price) × quantity

    If actual price is below benchmark, leakage is zero.
    """

    price_difference = actual_price - benchmark_price

    if price_difference <= 0:
        return 0.0

    return price_difference * quantity


def generate_price_anomaly_reason(
    percentage_difference: float,
) -> str:
    """
    Generate an explainable reason for a price anomaly.
    """

    percentage = percentage_difference * 100

    return (
        f"Unit price is {percentage:.2f}% above "
        f"the historical benchmark."
    )


def detect_price_anomalies(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Detect transactions whose unit price is significantly
    above the historical product/category benchmark.

    Required columns:

        transactionId
        product
        supplier
        quantity
        unitPrice
        benchmarkPrice
        historicalCount

    Returns one row for every detected anomaly.
    """

    required_columns = [
        "transactionId",
        "product",
        "supplier",
        "quantity",
        "unitPrice",
        "benchmarkPrice",
        "historicalCount",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    candidates = df.copy()

    # Only transactions with enough historical evidence
    # should be evaluated.
    candidates = candidates[
        candidates["historicalCount"]
        >= MIN_HISTORICAL_COUNT
    ].copy()

    # Calculate percentage price difference.
    candidates["priceDifference"] = (
        candidates["unitPrice"]
        - candidates["benchmarkPrice"]
    )

    candidates["percentageDifference"] = (
        candidates["priceDifference"]
        / candidates["benchmarkPrice"]
    )

    # Keep only transactions above the threshold.
    anomalies = candidates[
        candidates["percentageDifference"]
        >= PRICE_ANOMALY_THRESHOLD
    ].copy()

    if anomalies.empty:
        return pd.DataFrame(
            columns=[
                "transactionId",
                "product",
                "supplier",
                "quantity",
                "actualPrice",
                "benchmarkPrice",
                "potentialLeakage",
                "detectionType",
                "reason",
            ]
        )

    anomalies["potentialLeakage"] = (
        anomalies.apply(
            lambda row: calculate_potential_leakage(
                row["unitPrice"],
                row["benchmarkPrice"],
                row["quantity"],
            ),
            axis=1,
        )
    )

    anomalies["detectionType"] = "PRICE_ANOMALY"

    anomalies["reason"] = (
        anomalies["percentageDifference"]
        .apply(generate_price_anomaly_reason)
    )

    result = anomalies[
        [
            "transactionId",
            "product",
            "supplier",
            "quantity",
            "unitPrice",
            "benchmarkPrice",
            "potentialLeakage",
            "detectionType",
            "reason",
        ]
    ].copy()

    result = result.rename(
        columns={
            "unitPrice": "actualPrice",
        }
    )

    return result