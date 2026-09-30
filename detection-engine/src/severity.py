"""
Severity classification for procurement anomalies.

Severity is determined using:
1. Percentage price deviation
2. Potential financial leakage
"""

HIGH_PERCENTAGE_THRESHOLD = 50.0
MEDIUM_PERCENTAGE_THRESHOLD = 30.0

HIGH_LEAKAGE_THRESHOLD = 500000.0
MEDIUM_LEAKAGE_THRESHOLD = 100000.0


def classify_severity(
    percentage_deviation: float = 0.0,
    potential_leakage: float = 0.0,
) -> str:
    """
    Classify anomaly severity using deterministic thresholds.

    HIGH:
        - Percentage deviation >= 50%, OR
        - Potential leakage >= ₹500,000

    MEDIUM:
        - Percentage deviation >= 30%, OR
        - Potential leakage >= ₹100,000

    LOW:
        - Otherwise
    """

    percentage_deviation = float(percentage_deviation or 0.0)
    potential_leakage = float(potential_leakage or 0.0)

    if (
        percentage_deviation >= HIGH_PERCENTAGE_THRESHOLD
        or potential_leakage >= HIGH_LEAKAGE_THRESHOLD
    ):
        return "HIGH"

    if (
        percentage_deviation >= MEDIUM_PERCENTAGE_THRESHOLD
        or potential_leakage >= MEDIUM_LEAKAGE_THRESHOLD
    ):
        return "MEDIUM"

    return "LOW"