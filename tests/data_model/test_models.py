from datetime import date
from decimal import Decimal
import pytest
from pydantic import ValidationError
from backend.app.models.silver import Household


def test_household_valid_data():
    data = {
        "household_id": "123456",
        "household_name": "Smith Family",
        "officer_code": "OFF001",
        "balance_current": 100.50,
        "balance_prior_month": 90.00,
        "balance_ytd_start": 80.00,
        "as_of_date": date(2024, 1, 15),
    }
    household = Household(**data)
    assert household.household_id == "123456"
    assert household.balance_current == Decimal("100.50")


def test_household_invalid_id_pattern():
    data = {
        "household_id": "123",  # Too short
        "household_name": "Smith Family",
        "officer_code": "OFF001",
        "balance_current": 100.50,
        "balance_prior_month": 90.00,
        "balance_ytd_start": 80.00,
        "as_of_date": date(2024, 1, 15),
    }
    with pytest.raises(ValidationError):
        Household(**data)


def test_household_invalid_decimal():
    data = {
        "household_id": "123456",
        "household_name": "Smith Family",
        "officer_code": "OFF001",
        "balance_current": "not a number",  # Invalid
        "balance_prior_month": 90.00,
        "balance_ytd_start": 80.00,
        "as_of_date": date(2024, 1, 15),
    }
    with pytest.raises(ValidationError):
        Household(**data)
