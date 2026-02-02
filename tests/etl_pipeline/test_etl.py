import pytest
import polars as pl
from backend.etl.transform import clean_currency


def test_clean_currency():
    df = pl.DataFrame({"raw_money": ["$1,000.50", "(500.00)", "200", None]})

    result = df.select(clean_currency(pl.col("raw_money")).alias("clean"))

    assert result["clean"][0] == 1000.50
    assert result["clean"][1] == -500.00
    assert result["clean"][2] == 200.00
    assert result["clean"][3] is None
