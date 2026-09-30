import pandas as pd

from src.preprocessing import (
    preprocess_transactions,
)


def create_sample_dataframe():
    return pd.DataFrame(
        [
            {
                "transactionId": "TX1001",
                "date": "2026-01-10",
                "product": " Laptop ",
                "category": " Electronics ",
                "supplier": " abc ltd ",
                "quantity": "10",
                "unitPrice": "50000",
                "totalAmount": "500000",
            },
            {
                "transactionId": "TX1002",
                "date": "2026-01-11",
                "product": "Laptop",
                "category": "Electronics",
                "supplier": "ABC LTD",
                "quantity": "abc",
                "unitPrice": "55000",
                "totalAmount": "550000",
            },
        ]
    )


def test_text_cleaning():
    df = create_sample_dataframe()

    cleaned, _ = preprocess_transactions(df)

    assert cleaned.loc[0, "product"] == "LAPTOP"
    assert cleaned.loc[0, "category"] == "ELECTRONICS"
    assert cleaned.loc[0, "supplier"] == "ABC LTD"


def test_numeric_conversion():
    df = create_sample_dataframe()

    cleaned, _ = preprocess_transactions(df)

    assert cleaned.loc[0, "quantity"] == 10
    assert cleaned.loc[0, "unitPrice"] == 50000
    assert cleaned.loc[0, "totalAmount"] == 500000


def test_invalid_quantity_detection():
    df = create_sample_dataframe()

    cleaned, report = preprocess_transactions(df)

    assert pd.isna(cleaned.loc[1, "quantity"])
    assert cleaned.loc[1, "invalid_quantity"] ==True
    assert report["invalid_quantity_count"] == 1


def test_date_conversion():
    df = create_sample_dataframe()

    cleaned, _ = preprocess_transactions(df)

    assert pd.notna(cleaned.loc[0, "date"])
    assert isinstance(
        cleaned.loc[0, "date"],
        pd.Timestamp,
    )


def test_missing_column_detection():
    df = create_sample_dataframe()

    df = df.drop(columns=["supplier"])

    try:
        preprocess_transactions(df)
        assert False, "Expected ValueError"
    except ValueError as error:
        assert "supplier" in str(error)