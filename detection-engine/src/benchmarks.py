import pandas as pd


def calculate_product_benchmarks(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Calculate historical median unit price for each
    product/category combination.

    The median is used because it is more robust to
    extreme price values than the mean.

    Returns a dataframe containing:
        product
        category
        benchmarkPrice
        historicalCount
    """

    required_columns = [
        "product",
        "category",
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

    valid_data = df[
        df["unitPrice"].notna()
        & (df["unitPrice"] > 0)
    ].copy()

    benchmarks = (
        valid_data
        .groupby(["product", "category"], as_index=False)
        .agg(
            benchmarkPrice=("unitPrice", "median"),
            historicalCount=("unitPrice", "count"),
        )
    )

    return benchmarks


def calculate_supplier_product_benchmarks(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Calculate historical median unit price for each
    supplier/product/category combination.

    This benchmark is useful for detecting sudden
    price changes from the same supplier.
    """

    required_columns = [
        "supplier",
        "product",
        "category",
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

    valid_data = df[
        df["unitPrice"].notna()
        & (df["unitPrice"] > 0)
    ].copy()

    benchmarks = (
        valid_data
        .groupby(
            ["supplier", "product", "category"],
            as_index=False,
        )
        .agg(
            supplierBenchmarkPrice=(
                "unitPrice",
                "median",
            ),
            historicalCount=("unitPrice", "count"),
        )
    )

    return benchmarks


def calculate_supplier_product_variance(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Calculate comparable supplier price statistics
    for each product/category combination.

    This allows transactions to be compared with
    prices from other suppliers.

    Returns:
        product
        category
        supplier
        supplierMedianPrice
        comparableSupplierCount
    """

    required_columns = [
        "supplier",
        "product",
        "category",
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

    valid_data = df[
        df["unitPrice"].notna()
        & (df["unitPrice"] > 0)
    ].copy()

    supplier_stats = (
        valid_data
        .groupby(
            ["product", "category", "supplier"],
            as_index=False,
        )
        .agg(
            supplierMedianPrice=(
                "unitPrice",
                "median",
            ),
        )
    )

    supplier_stats["comparableSupplierCount"] = (
        supplier_stats
        .groupby(["product", "category"])["supplier"]
        .transform("nunique")
    )

    return supplier_stats