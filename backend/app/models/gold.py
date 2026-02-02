from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class KpiName(str, Enum):
    total_deposits = "total_deposits"
    net_flow_mom = "net_flow_mom"
    liquidity_ratio = "liquidity_ratio"


class DimensionType(str, Enum):
    Bank = "Bank"
    Team = "Team"
    Officer = "Officer"


class FactHouseholdMonthly(BaseModel):
    """
    Gold Layer: Monthly snapshots of household performance.
    """

    date_key: int = Field(..., description="Format YYYYMM")
    household_key: str
    officer_key: str
    team_key: str
    total_deposits: Decimal = Field(..., max_digits=18, decimal_places=2)
    net_flow_mom: Decimal = Field(..., max_digits=18, decimal_places=2)
    net_flow_ytd: Decimal = Field(..., max_digits=18, decimal_places=2)


class DimOfficer(BaseModel):
    """
    Gold Layer: Slowly Changing Dimension (Type 2) for officers.
    """

    officer_key: str
    current_team: str
    effective_date: date
    end_date: Optional[date] = None


class AggKpiDaily(BaseModel):
    """
    Gold Layer: Pre-calculated daily KPIs.
    """

    report_date: date
    kpi_name: KpiName
    dimension_type: DimensionType
    dimension_value: str
    value: Decimal = Field(..., max_digits=18, decimal_places=2)
