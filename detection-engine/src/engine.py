"""
Unified detection engine for procurement leakage detection.
"""

import pandas as pd

from src.preprocessing import preprocess_transactions
from src.price_anomaly import detect_price_anomalies
from src.supplier_variance import detect_supplier_price_variance
from src.price_spike import detect_price_spikes
from src.duplicate_detection import detect_possible_duplicates
from src.quantity_anomaly import detect_quantity_anomalies
from src.severity import classify_severity


def prepare_detection_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare cleaned transaction data for detection.
    """

    cleaned_df, _ = preprocess_transactions(df)

    return cleaned_df


def add_price_benchmarks(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate historical product/category benchmarks.

    For each transaction, only transactions that occurred
    before the current transaction are used as historical data.

    This prevents the current transaction from influencing
    its own benchmark.
    """

    result = df.copy()

    result["benchmarkPrice"] = float("nan")
    result["historicalCount"] = 0

    result = result.sort_values(
        "date"
    ).reset_index(drop=True)

    for index, row in result.iterrows():

        historical = result[
            (result["date"] < row["date"])
            & (result["product"] == row["product"])
            & (result["category"] == row["category"])
            & (result["unitPrice"] > 0)
        ]

        if not historical.empty:
            result.loc[
                index,
                "benchmarkPrice"
            ] = historical["unitPrice"].median()

            result.loc[
                index,
                "historicalCount"
            ] = len(historical)

    return result

def add_price_anomaly_severity(
    findings: pd.DataFrame,
) -> pd.DataFrame:
    """
    Add severity to price anomaly findings.
    """

    if findings.empty:
        return findings

    findings = findings.copy()

    findings["percentageDeviation"] = (
        (
            findings["actualPrice"]
            - findings["benchmarkPrice"]
        )
        / findings["benchmarkPrice"]
        * 100
    )

    findings["severity"] = findings.apply(
        lambda row: classify_severity(
            row["percentageDeviation"],
            row["potentialLeakage"],
        ),
        axis=1,
    )

    return findings.drop(
        columns=["percentageDeviation"]
    )


def add_supplier_variance_severity(
    findings: pd.DataFrame,
) -> pd.DataFrame:
    """
    Add severity to supplier price variance findings.
    """

    if findings.empty:
        return findings

    findings = findings.copy()

    findings["percentageDeviation"] = (
        (
            findings["actualPrice"]
            - findings["benchmarkPrice"]
        )
        / findings["benchmarkPrice"]
        * 100
    )

    findings["severity"] = findings.apply(
        lambda row: classify_severity(
            row["percentageDeviation"],
            row["potentialLeakage"],
        ),
        axis=1,
    )

    return findings.drop(
        columns=["percentageDeviation"]
    )


def add_price_spike_severity(
    findings: pd.DataFrame,
) -> pd.DataFrame:
    """
    Add severity to price spike findings.
    """

    if findings.empty:
        return findings

    findings = findings.copy()

    findings["percentageDeviation"] = (
        (
            findings["actualPrice"]
            - findings["benchmarkPrice"]
        )
        / findings["benchmarkPrice"]
        * 100
    )

    findings["severity"] = findings.apply(
        lambda row: classify_severity(
            row["percentageDeviation"],
            row["potentialLeakage"],
        ),
        axis=1,
    )

    return findings.drop(
        columns=["percentageDeviation"]
    )


def add_quantity_severity(
    findings: pd.DataFrame,
) -> pd.DataFrame:
    """
    Add severity to unusual quantity findings.

    Quantity anomalies do not have a direct price
    deviation, so they are classified as MEDIUM
    when detected.
    """

    if findings.empty:
        return findings

    findings = findings.copy()

    findings["severity"] = "MEDIUM"

    return findings


def run_detection_engine(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Main entry point for the procurement detection engine.
    """

    # --------------------------------
    # 1. Preprocess input data
    # --------------------------------
    prepared_df = prepare_detection_data(df)

    # --------------------------------
    # 2. Prepare product benchmarks
    # --------------------------------
    detection_df = add_price_benchmarks(
        prepared_df
    )

    # --------------------------------
    # 3. Price anomaly detection
    # --------------------------------
    price_findings = detect_price_anomalies(
        detection_df
    )

    price_findings = add_price_anomaly_severity(
        price_findings
    )

    # --------------------------------
    # 4. Supplier price variance
    # --------------------------------
    supplier_findings = (
        detect_supplier_price_variance(
            detection_df
        )
    )

    supplier_findings = (
        add_supplier_variance_severity(
            supplier_findings
        )
    )

    # --------------------------------
    # 5. Prepare price spike history
    # --------------------------------
    spike_df = detection_df.copy()

    spike_df["historicalPrice"] = (
        spike_df.groupby(
            [
                "product",
                "category",
                "supplier",
            ]
        )["unitPrice"]
        .transform("median")
    )

    spike_df["historicalCount"] = (
        spike_df.groupby(
            [
                "product",
                "category",
                "supplier",
            ]
        )["unitPrice"]
        .transform("count")
    )

    # --------------------------------
    # 6. Price spike detection
    # --------------------------------
    spike_findings = detect_price_spikes(
        spike_df
    )

    spike_findings = add_price_spike_severity(
        spike_findings
    )

    # --------------------------------
    # 7. Possible duplicate detection
    # --------------------------------
    duplicate_findings = (
        detect_possible_duplicates(
            prepared_df
        )
    )

    # --------------------------------
    # 8. Unusual quantity detection
    # --------------------------------
    quantity_findings = (
        detect_quantity_anomalies(
            prepared_df
        )
    )

    quantity_findings = add_quantity_severity(
        quantity_findings
    )

    # --------------------------------
    # 9. Combine all findings
    # --------------------------------
    findings = pd.concat(
        [
            price_findings,
            supplier_findings,
            spike_findings,
            duplicate_findings,
            quantity_findings,
        ],
        ignore_index=True,
    )

    return findings