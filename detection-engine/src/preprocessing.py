import pandas as pd


REQUIRED_COLUMNS = [
    "transactionId",
    "date",
    "product",
    "category",
    "supplier",
    "quantity",
    "unitPrice",
    "totalAmount",
]

NUMERIC_COLUMNS = [
    "quantity",
    "unitPrice",
    "totalAmount",
]

TEXT_COLUMNS = [
    "transactionId",
    "product",
    "category",
    "supplier",
]


def validate_columns(df: pd.DataFrame) -> None:
    """
    Validate that all required procurement columns are present.
    """
    missing_columns = [
        column for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )


def clean_text_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove leading/trailing whitespace and normalize text fields.
    """
    cleaned = df.copy()

    for column in TEXT_COLUMNS:
        if column in cleaned.columns:
            cleaned[column] = (
                cleaned[column]
                .astype("string")
                .str.strip()
            )

    # Normalize supplier, product and category names.
    for column in ["supplier", "product", "category"]:
        if column in cleaned.columns:
            cleaned[column] = (
                cleaned[column]
                .str.replace(r"\s+", " ", regex=True)
                .str.upper()
            )

    return cleaned


def convert_numeric_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Convert quantity, unitPrice and totalAmount to numeric values.

    Invalid numeric values become NaN so they can be reported
    instead of silently producing incorrect calculations.
    """
    cleaned = df.copy()

    for column in NUMERIC_COLUMNS:
        cleaned[column] = pd.to_numeric(
            cleaned[column],
            errors="coerce"
        )

    return cleaned


def convert_date_column(df: pd.DataFrame) -> pd.DataFrame:
    """
    Convert transaction dates into pandas datetime values.

    Invalid dates become NaT and are reported later.
    """
    cleaned = df.copy()

    cleaned["date"] = pd.to_datetime(
        cleaned["date"],
        errors="coerce"
    )

    return cleaned


def remove_exact_duplicates(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, int]:
    """
    Remove completely identical rows.

    Returns:
        cleaned dataframe
        number of removed duplicate rows
    """
    before = len(df)

    cleaned = df.drop_duplicates().copy()

    removed = before - len(cleaned)

    return cleaned, removed


def validate_transaction_values(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Mark invalid procurement transaction values.

    Invalid:
    - quantity <= 0
    - unitPrice <= 0
    - totalAmount <= 0
    """
    cleaned = df.copy()

    cleaned["invalid_quantity"] = (
        cleaned["quantity"].isna()
        | (cleaned["quantity"] <= 0)
    )

    cleaned["invalid_unit_price"] = (
        cleaned["unitPrice"].isna()
        | (cleaned["unitPrice"] <= 0)
    )

    cleaned["invalid_total_amount"] = (
        cleaned["totalAmount"].isna()
        | (cleaned["totalAmount"] <= 0)
    )

    cleaned["invalid_date"] = cleaned["date"].isna()

    return cleaned


def preprocess_transactions(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, dict]:
    """
    Main preprocessing pipeline for LeakLens procurement data.

    Returns:
        cleaned dataframe
        cleaning report
    """
    if not isinstance(df, pd.DataFrame):
        raise TypeError("Input must be a pandas DataFrame.")

    # Work on a copy so the original dataframe is not modified.
    cleaned = df.copy()

    # Normalize column names.
    cleaned.columns = (
        cleaned.columns
        .astype(str)
        .str.strip()
    )

    validate_columns(cleaned)

    original_rows = len(cleaned)

    # Clean text fields.
    cleaned = clean_text_columns(cleaned)

    # Convert numeric fields.
    cleaned = convert_numeric_columns(cleaned)

    # Convert dates.
    cleaned = convert_date_column(cleaned)

    # Remove exact duplicate rows.
    cleaned, duplicates_removed = remove_exact_duplicates(cleaned)

    # Identify invalid values.
    cleaned = validate_transaction_values(cleaned)

    # Count invalid records.
    invalid_quantity_count = int(
        cleaned["invalid_quantity"].sum()
    )

    invalid_unit_price_count = int(
        cleaned["invalid_unit_price"].sum()
    )

    invalid_total_amount_count = int(
        cleaned["invalid_total_amount"].sum()
    )

    invalid_date_count = int(
        cleaned["invalid_date"].sum()
    )

    missing_required_values = int(
        cleaned[REQUIRED_COLUMNS].isna().any(axis=1).sum()
    )

    report = {
        "original_rows": original_rows,
        "final_rows": len(cleaned),
        "duplicates_removed": duplicates_removed,
        "invalid_quantity_count": invalid_quantity_count,
        "invalid_unit_price_count": invalid_unit_price_count,
        "invalid_total_amount_count": invalid_total_amount_count,
        "invalid_date_count": invalid_date_count,
        "rows_with_missing_required_values": missing_required_values,
    }

    return cleaned, report