"""
Example showing how the LeakLens backend can use
the detection engine.
"""

import pandas as pd

from src.detection_service import analyze_transactions


def main():
    # Load procurement transactions
    transactions = pd.read_csv(
        "sample_data/procurement.csv"
    )

    # Run detection engine
    findings = analyze_transactions(
        transactions
    )

    # Display results
    print("\nDetection Results")
    print("=================")

    for finding in findings:
        print(
            f"Transaction: {finding['transactionId']}"
        )
        print(
            f"Detection: {finding['detectionType']}"
        )
        print(
            f"Severity: {finding['severity']}"
        )
        print(
            f"Potential Leakage: "
            f"{finding['potentialLeakage']}"
        )
        print(
            f"Reason: {finding['reason']}"
        )
        print("-" * 50)


if __name__ == "__main__":
    main()