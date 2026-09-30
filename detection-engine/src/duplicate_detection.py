import pandas as pd


DUPLICATE_WINDOW_DAYS = 7


def detect_possible_duplicates(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Detect highly similar procurement transactions
    occurring within a short time window.

    A transaction pair is considered potentially duplicated
    when supplier, product, quantity and total amount match,
    and the dates are within DUPLICATE_WINDOW_DAYS.

    This detector reports POSSIBLE_DUPLICATE only.
    It does not confirm that a transaction is actually a duplicate.
    """

    required_columns = [
        "transactionId",
        "date",
        "product",
        "supplier",
        "quantity",
        "totalAmount",
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

    transactions["date"] = pd.to_datetime(
        transactions["date"],
        errors="coerce",
    )

    transactions = transactions.dropna(
        subset=[
            "transactionId",
            "date",
            "product",
            "supplier",
            "quantity",
            "totalAmount",
        ]
    )

    results = []

    for i in range(len(transactions)):

        current = transactions.iloc[i]

        for j in range(i + 1, len(transactions)):

            comparison = transactions.iloc[j]

            if current["supplier"] != comparison["supplier"]:
                continue

            if current["product"] != comparison["product"]:
                continue

            if current["quantity"] != comparison["quantity"]:
                continue

            if current["totalAmount"] != comparison["totalAmount"]:
                continue

            date_difference = abs(
                (
                    current["date"]
                    - comparison["date"]
                ).days
            )

            if date_difference > DUPLICATE_WINDOW_DAYS:
                continue

            results.append(
                {
                    "transactionId": current["transactionId"],
                    "product": current["product"],
                    "supplier": current["supplier"],
                    "quantity": current["quantity"],
                    "actualPrice": current["totalAmount"],
                    "benchmarkPrice": None,
                    "potentialLeakage": 0.0,
                    "severity": "MEDIUM",
                    "detectionType": "POSSIBLE_DUPLICATE",
                    "reason": (
                        "Transaction is highly similar to "
                        f"{comparison['transactionId']} and occurred "
                        f"{date_difference} day(s) apart."
                    ),
                }
            )

            results.append(
                {
                    "transactionId": comparison["transactionId"],
                    "product": comparison["product"],
                    "supplier": comparison["supplier"],
                    "quantity": comparison["quantity"],
                    "actualPrice": comparison["totalAmount"],
                    "benchmarkPrice": None,
                    "potentialLeakage": 0.0,
                    "severity": "MEDIUM",
                    "detectionType": "POSSIBLE_DUPLICATE",
                    "reason": (
                        "Transaction is highly similar to "
                        f"{current['transactionId']} and occurred "
                        f"{date_difference} day(s) apart."
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
            "severity",
            "detectionType",
            "reason",
        ],
    )