"""
Service interface for the LeakLens detection engine.

This module provides a simple interface that the backend
can use without directly managing individual detection modules.
"""

import pandas as pd

from src.engine import run_detection_engine


def analyze_transactions(
    transactions: pd.DataFrame,
) -> list[dict]:
    """
    Analyze procurement transactions and return
    detection findings as JSON-compatible dictionaries.

    Parameters
    ----------
    transactions : pd.DataFrame
        Procurement transaction data.

    Returns
    -------
    list[dict]
        Detection findings.
    """

    findings = run_detection_engine(transactions)

    if findings.empty:
        return []

    # Replace NaN values with None so the result
    # can be safely converted to JSON.
    findings = findings.astype(object).where(
        pd.notna(findings),
        None,
    )

    return findings.to_dict(
        orient="records"
    )