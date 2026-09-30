import pandas as pd

from src.benchmarks import (
    calculate_product_benchmarks,
    calculate_supplier_product_benchmarks,
    calculate_supplier_product_variance,
)


def create_benchmark_data():
    return pd.DataFrame(
        [
            {
                "transactionId": "TX1001",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "unitPrice": 48000,
            },
            {
                "transactionId": "TX1002",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "ABC LTD",
                "unitPrice": 50000,
            },
            {
                "transactionId": "TX1003",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "XYZ LTD",
                "unitPrice": 52000,
            },
            {
                "transactionId": "TX1004",
                "product": "LAPTOP",
                "category": "ELECTRONICS",
                "supplier": "XYZ LTD",
                "unitPrice": 51000,
            },
            {
                "transactionId": "TX1005",
                "product": "CHAIR",
                "category": "FURNITURE",
                "supplier": "ABC LTD",
                "unitPrice": 5000,
            },
        ]
    )


def test_product_median_benchmark():
    df = create_benchmark_data()

    result = calculate_product_benchmarks(df)

    laptop = result[
        result["product"] == "LAPTOP"
    ].iloc[0]

    assert laptop["benchmarkPrice"] == 50500
    assert laptop["historicalCount"] == 4


def test_supplier_product_benchmark():
    df = create_benchmark_data()

    result = calculate_supplier_product_benchmarks(df)

    abc_laptop = result[
        (result["supplier"] == "ABC LTD")
        & (result["product"] == "LAPTOP")
    ].iloc[0]

    assert abc_laptop["supplierBenchmarkPrice"] == 49000
    assert abc_laptop["historicalCount"] == 2


def test_supplier_variance():
    df = create_benchmark_data()

    result = calculate_supplier_product_variance(df)

    laptop = result[
        result["product"] == "LAPTOP"
    ]

    assert len(laptop) == 2

    assert all(
        laptop["comparableSupplierCount"] == 2
    )