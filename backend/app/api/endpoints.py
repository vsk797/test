import duckdb
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from backend.etl.config import GOLD_PATH
import os

router = APIRouter()


def get_db_connection():
    """
    Creates a DuckDB connection and loads the Delta extension.
    """
    con = duckdb.connect(":memory:")
    # In a production environment, you ensure extensions are present.
    # For now, we try to load it.
    try:
        con.execute("INSTALL delta;")
        con.execute("LOAD delta;")
    except Exception as e:
        print(f"Warning: Could not load Delta extension. {e}")
    return con


def query_gold_table(table_name: str, query: str, params: list = None):
    """
    Helper to execute SQL against a Gold Delta table.
    """
    table_path = GOLD_PATH / table_name
    if not table_path.exists():
        # Fallback for development if table doesn't exist yet
        return []

    con = get_db_connection()
    try:
        # Replace the table placeholder with the actual delta_scan call
        # We assume the query uses {table} as placeholder
        formatted_query = query.format(table=f"delta_scan('{table_path}')")
        if params:
            result = con.execute(formatted_query, params).fetchall()
        else:
            result = con.execute(formatted_query).fetchall()

        # Convert to dictionary
        columns = [desc[0] for desc in con.description]
        return [dict(zip(columns, row)) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        con.close()


@router.get("/kpis")
def get_kpis(
    date: Optional[str] = None,
    team_id: Optional[str] = None,
    officer_id: Optional[str] = None,
):
    """
    Get high-level KPIs.
    Mapped to KPICard component.
    """
    # TODO: Add filtering logic based on team/officer
    # For now, return aggregate for the latest date if not specified

    query = """
    SELECT 
        kpi_name,
        value,
        dimension_type,
        dimension_value
    FROM {table}
    WHERE report_date = (SELECT MAX(report_date) FROM {table})
    """

    # In a real impl, we would construct the WHERE clause dynamically
    try:
        data = query_gold_table("agg_kpi_daily", query)

        # Transform to expected schema
        response = {
            "total_deposits": 0,
            "net_flow_mom": 0,
            "liquidity_ratio": 0,
            "trends": {},
        }

        for row in data:
            if row["dimension_type"] == "Bank" and row["dimension_value"] == "All":
                if row["kpi_name"] in response:
                    response[row["kpi_name"]] = row["value"]

        return response
    except Exception as e:
        # Graceful fallback if tables missing
        print(f"Error fetching KPIs: {e}")
        return {
            "total_deposits": 125000000,  # Mock fallback
            "net_flow_mom": 2500000,
            "liquidity_ratio": 1.2,
            "trends": {"total_deposits_pct": 5.2},
        }


@router.get("/analytics/waterfall")
def get_waterfall(start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Get waterfall chart data.
    """
    # Placeholder logic
    return {
        "start_balance": 100000000,
        "increases": 5000000,
        "decreases": -2000000,
        "end_balance": 103000000,
        "details": [
            {"category": "Deposits", "value": 4000000},
            {"category": "Interest", "value": 1000000},
            {"category": "Withdrawals", "value": -2000000},
        ],
    }


@router.get("/officers/leaderboard")
def get_officer_leaderboard(metric: str = "balance", sort: str = "desc"):
    """
    Get officer leaderboard.
    """
    # Placeholder logic
    return {
        "data": [
            {
                "officer_id": "OFF001",
                "name": "Sarah Jenkins",
                "team": "BB",
                "balance": 45000000,
                "growth_ytd": 1200000,
            },
            {
                "officer_id": "OFF002",
                "name": "Mike Ross",
                "team": "OCF",
                "balance": 32000000,
                "growth_ytd": -500000,
            },
        ]
    }


@router.get("/metadata/filters")
def get_filters():
    """
    Get filter metadata.
    """
    return {
        "teams": ["BB", "OCF", "PB"],
        "officers": [
            {"id": "OFF001", "name": "Sarah Jenkins", "team": "BB"},
            {"id": "OFF002", "name": "Mike Ross", "team": "OCF"},
        ],
        "balance_tiers": ["<1M", "1M-5M", ">5M"],
    }
