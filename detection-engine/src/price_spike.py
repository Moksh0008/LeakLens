import pandas as pd


PRICE_SPIKE_THRESHOLD = 0.20
MIN_HISTORICAL_COUNT = 3


def calculate_price_spike(
    actual_price: float,
    historical_price: float,
) -> tuple[float, float]:
    """
    Calculate the absolute and percentage increase
    from historical price to current price.
    """

    if historical_price <= 0:
        raise ValueError(
            "Historical price must be greater than zero."
        )

    difference = actual_price - historical_price

    percentage_increase = (
        difference / historical_price
    )

    return difference, percentage_increase


def calculate_spike_leakage(
    actual_price: float,
    historical_price: float,
    quantity: float,
) -> float:
    """
    Calculate potential excess spend caused by a
    positive price increase.
    """

    difference = actual_price - historical_price

    if difference <= 0:
        return 0.0

    return difference * quantity


def generate_price_spike_reason(
    percentage_increase: float,
) -> str:
    """
    Generate an explainable reason for a price spike.
    """

    percentage = percentage_increase * 100

    return (
        f"Current unit price increased by "
        f"{percentage:.2f}% above the supplier's "
        f"historical median."
    )


def detect_price_spikes(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Detect sudden price increases for the same
    supplier/product/category combination.

    Required columns:

        transactionId
        product
        category
        supplier
        quantity
        unitPrice
        historicalPrice
        historicalCount
    """

    required_columns = [
        "transactionId",
        "product",
        "category",
        "supplier",
        "quantity",
        "unitPrice",
        "historicalPrice",
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

    candidates = df[
        (df["historicalCount"] >= MIN_HISTORICAL_COUNT)
        & df["historicalPrice"].notna()
        & (df["historicalPrice"] > 0)
        & df["unitPrice"].notna()
        & (df["unitPrice"] > 0)
    ].copy()

    if candidates.empty:
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

    spike_values = candidates.apply(
        lambda row: calculate_price_spike(
            row["unitPrice"],
            row["historicalPrice"],
        ),
        axis=1,
    )

    candidates["priceDifference"] = [
        value[0] for value in spike_values
    ]

    candidates["percentageIncrease"] = [
        value[1] for value in spike_values
    ]

    anomalies = candidates[
        candidates["percentageIncrease"]
        >= PRICE_SPIKE_THRESHOLD
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

    anomalies["potentialLeakage"] = anomalies.apply(
        lambda row: calculate_spike_leakage(
            row["unitPrice"],
            row["historicalPrice"],
            row["quantity"],
        ),
        axis=1,
    )

    anomalies["detectionType"] = "PRICE_SPIKE"

    anomalies["reason"] = (
        anomalies["percentageIncrease"]
        .apply(generate_price_spike_reason)
    )

    result = anomalies[
        [
            "transactionId",
            "product",
            "supplier",
            "quantity",
            "unitPrice",
            "historicalPrice",
            "potentialLeakage",
            "detectionType",
            "reason",
        ]
    ].copy()

    result = result.rename(
        columns={
            "unitPrice": "actualPrice",
            "historicalPrice": "benchmarkPrice",
        }
    )

    return result