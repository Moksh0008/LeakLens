from src.severity import classify_severity


def test_high_severity_by_percentage():
    assert classify_severity(
        percentage_deviation=55,
        potential_leakage=10000,
    ) == "HIGH"


def test_high_severity_by_leakage():
    assert classify_severity(
        percentage_deviation=10,
        potential_leakage=600000,
    ) == "HIGH"


def test_medium_severity_by_percentage():
    assert classify_severity(
        percentage_deviation=35,
        potential_leakage=10000,
    ) == "MEDIUM"


def test_medium_severity_by_leakage():
    assert classify_severity(
        percentage_deviation=10,
        potential_leakage=150000,
    ) == "MEDIUM"


def test_low_severity():
    assert classify_severity(
        percentage_deviation=25,
        potential_leakage=50000,
    ) == "LOW"


def test_boundary_high_percentage():
    assert classify_severity(
        percentage_deviation=50,
        potential_leakage=0,
    ) == "HIGH"


def test_boundary_medium_percentage():
    assert classify_severity(
        percentage_deviation=30,
        potential_leakage=0,
    ) == "MEDIUM"