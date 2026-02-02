from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TeamId(str, Enum):
    BB = "BB"
    OCF = "OCF"
    PB = "PB"


class OfficerStatus(str, Enum):
    Active = "Active"
    Inactive = "Inactive"


class Household(BaseModel):
    """
    Silver Layer: Cleaned, validated, and typed data.
    """

    household_id: str = Field(..., pattern=r"^\d{6,10}$")
    household_name: str
    officer_code: str
    balance_current: Decimal = Field(..., max_digits=18, decimal_places=2)
    balance_prior_month: Decimal = Field(..., max_digits=18, decimal_places=2)
    balance_ytd_start: Decimal = Field(..., max_digits=18, decimal_places=2)
    as_of_date: date


class Officer(BaseModel):
    officer_code: str
    officer_name: str
    team_id: Optional[TeamId] = None
    status: OfficerStatus


class Team(BaseModel):
    team_id: TeamId
    team_name: str
