import pandas as pd

from src.engine import run_detection_engine


def test_full_detection_engine():
    """
    Test the complete detection engine using
    the sample procurement dataset.
    """

    df = pd.read_csv(
        "sample_data/procurement.csv"
    )

    findings = run_detection_engine(df)

    # Engine should return a DataFrame
    assert isinstance(findings, pd.DataFrame)

    # Required output columns
    required_columns = [
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
    ]

    for column in required_columns:
        assert column in findings.columns

    # At least one anomaly should be detected
    assert len(findings) > 0


def test_expected_detection_types():
    """
    Verify that the engine can produce
    the expected detection categories.
    """

    df = pd.read_csv(
        "sample_data/procurement.csv"
    )

    findings = run_detection_engine(df)

    detection_types = set(
        findings["detectionType"]
    )

    assert "PRICE_ANOMALY" in detection_types
    assert "SUPPLIER_PRICE_VARIANCE" in detection_types
    assert "PRICE_SPIKE" in detection_types
    assert "POSSIBLE_DUPLICATE" in detection_types
    assert "UNUSUAL_QUANTITY" in detection_types