from datetime import datetime
from typing import Any, Dict
from pydantic import BaseModel, Field


class RawHouseholdBalance(BaseModel):
    """
    Bronze Layer: Raw immutable snapshots from source systems.
    """

    ingestion_id: str = Field(..., description="UUID for the ingestion batch")
    raw_content: Dict[str, Any] = Field(..., description="Full row as JSON from Excel")
    source_filename: str
    ingestion_timestamp: datetime
