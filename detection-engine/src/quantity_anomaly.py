import pandas as pd


IQR_MULTIPLIER = 1.5
MIN_HISTORICAL_COUNT = 4


def calculate_quantity_bounds(
    historical_quantities: pd.Series,
) -> tuple[float, float]:
    """
    Calculate IQR-based lower and upper bounds.

    Upper bound:
        Q3 + 1.5 * IQR
    """

    values = pd.to_numeric(
        historical_quantities,
        errors="coerce",
    ).dropna()

    values = values[values > 0]

    if len(values) < MIN_HISTORICAL_COUNT:
        raise ValueError(
            "Not enough historical quantities."
        )

    q1 = values.quantile(0.25)
    q3 = values.quantile(0.75)

    iqr = q3 - q1

    lower_bound = q1 - IQR_MULTIPLIER * iqr
    upper_bound = q3 + IQR_MULTIPLIER * iqr

    return float(lower_bound), float(upper_bound)


def generate_quantity_reason(
    quantity: float,
    upper_bound: float,
) -> str:
    """
    Generate an explainable quantity anomaly reason.
    """

    return (
        f"Quantity of {quantity:g} is above the "
        f"historical upper bound of {upper_bound:.2f}."
    )


def detect_quantity_anomalies(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Detect unusually high quantities using the IQR method.

    Historical comparison is performed for the same
    product/category combination.

    Required columns:

        transactionId
        product
        category
        supplier
        quantity
    """

    required_columns = [
        "transactionId",
        "product",
        "category",
        "supplier",
        "quantity",
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

    transactions = df.copy()

    transactions["quantity"] = pd.to_numeric(
        transactions["quantity"],
        errors="coerce",
    )

    results = []

    for index, row in transactions.iterrows():

        historical = transactions[
            (transactions["product"] == row["product"])
            & (
                transactions["category"]
                == row["category"]
            )
            & (transactions.index != index)
            & transactions["quantity"].notna()
            & (transactions["quantity"] > 0)
        ]["quantity"]

        if len(historical) < MIN_HISTORICAL_COUNT:
            continue

        _, upper_bound = calculate_quantity_bounds(
            historical
        )

        if row["quantity"] <= upper_bound:
            continue

        results.append(
            {
                "transactionId": row["transactionId"],
                "product": row["product"],
                "supplier": row["supplier"],
                "quantity": row["quantity"],
                "actualPrice": None,
                "benchmarkPrice": upper_bound,
                "potentialLeakage": 0.0,
                "detectionType": "UNUSUAL_QUANTITY",
                "reason": generate_quantity_reason(
                    row["quantity"],
                    upper_bound,
                ),
            }
        )

    return pd.DataFrame(
        results,
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
        ],
    )