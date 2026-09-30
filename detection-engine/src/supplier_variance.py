import pandas as pd


SUPPLIER_VARIANCE_THRESHOLD = 0.20
MIN_COMPARABLE_SUPPLIERS = 2


def calculate_comparable_supplier_median(
    df: pd.DataFrame,
    product: str,
    category: str,
    current_supplier: str,
) -> tuple[float | None, int]:
    """
    Calculate the median unit price among suppliers other
    than the current supplier for the same product/category.

    Returns:
        comparable median price
        number of comparable suppliers
    """

    comparable = df[
        (df["product"] == product)
        & (df["category"] == category)
        & (df["supplier"] != current_supplier)
        & df["unitPrice"].notna()
        & (df["unitPrice"] > 0)
    ].copy()

    if comparable.empty:
        return None, 0

    supplier_medians = (
        comparable
        .groupby("supplier")["unitPrice"]
        .median()
    )

    if len(supplier_medians) < MIN_COMPARABLE_SUPPLIERS:
        return None, len(supplier_medians)

    benchmark = float(supplier_medians.median())

    return benchmark, len(supplier_medians)


def calculate_supplier_variance(
    actual_price: float,
    comparable_price: float,
) -> tuple[float, float]:
    """
    Calculate absolute and percentage price variance.
    """

    if comparable_price <= 0:
        raise ValueError(
            "Comparable price must be greater than zero."
        )

    difference = actual_price - comparable_price

    percentage_difference = (
        difference / comparable_price
    )

    return difference, percentage_difference


def calculate_supplier_potential_leakage(
    actual_price: float,
    comparable_price: float,
    quantity: float,
) -> float:
    """
    Calculate potential excess spend based on the
    comparable supplier benchmark.

    Only positive differences are treated as potential
    leakage.
    """

    difference = actual_price - comparable_price

    if difference <= 0:
        return 0.0

    return difference * quantity


def generate_supplier_variance_reason(
    percentage_difference: float,
) -> str:
    """
    Generate an explainable supplier variance reason.
    """

    percentage = percentage_difference * 100

    return (
        f"Unit price is {percentage:.2f}% above "
        f"the comparable supplier median."
    )


def detect_supplier_price_variance(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Detect transactions whose price is substantially higher
    than prices observed from comparable suppliers.

    Required columns:

        transactionId
        product
        category
        supplier
        quantity
        unitPrice
    """

    required_columns = [
        "transactionId",
        "product",
        "category",
        "supplier",
        "quantity",
        "unitPrice",
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

    results = []

    for _, row in df.iterrows():

        benchmark, supplier_count = (
            calculate_comparable_supplier_median(
                df=df,
                product=row["product"],
                category=row["category"],
                current_supplier=row["supplier"],
            )
        )

        if benchmark is None:
            continue

        difference, percentage = (
            calculate_supplier_variance(
                actual_price=row["unitPrice"],
                comparable_price=benchmark,
            )
        )

        if percentage < SUPPLIER_VARIANCE_THRESHOLD:
            continue

        leakage = calculate_supplier_potential_leakage(
            actual_price=row["unitPrice"],
            comparable_price=benchmark,
            quantity=row["quantity"],
        )

        results.append(
            {
                "transactionId": row["transactionId"],
                "product": row["product"],
                "supplier": row["supplier"],
                "quantity": row["quantity"],
                "actualPrice": row["unitPrice"],
                "benchmarkPrice": benchmark,
                "potentialLeakage": leakage,
                "detectionType": "SUPPLIER_PRICE_VARIANCE",
                "reason": generate_supplier_variance_reason(
                    percentage
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