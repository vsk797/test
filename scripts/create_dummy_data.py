import pandas as pd
import os
from pathlib import Path

# Define the target directory and file
TARGET_DIR = Path("ux/public/data")
TARGET_FILE = TARGET_DIR / "household-balance-report.xlsx"


def create_dummy_excel():
    print(f"Ensuring directory exists: {TARGET_DIR}")
    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    data = [
        {
            "Transaction Date": "2024-01-15",
            "Account Number": "123456789",
            "Description": "Deposit",
            "Debit": 0,
            "Credit": 5000,
            "Category": "Income",
            "Household ID": "100001",
            "Household Name": "Smith Family",
            "Officer Code": "OFF001",
            "Officer Name": "Sarah Jenkins",
            "Current Month-end Deposit Balance": 150000,
            "Prior Month-end Deposit Balance": 145000,
            "Prior Year-end Deposit Balance": 120000,
        },
        {
            "Transaction Date": "2024-01-20",
            "Account Number": "987654321",
            "Description": "Utility Bill",
            "Debit": 200,
            "Credit": 0,
            "Category": "Utilities",
            "Household ID": "100002",
            "Household Name": "Jones Family",
            "Officer Code": "OFF002",
            "Officer Name": "Mike Ross",
            "Current Month-end Deposit Balance": 80000,
            "Prior Month-end Deposit Balance": 80200,
            "Prior Year-end Deposit Balance": 75000,
        },
    ]

    df = pd.DataFrame(data)

    print(f"Writing dummy data to {TARGET_FILE}...")
    try:
        df.to_excel(TARGET_FILE, index=False)
        print("Success!")
    except ImportError:
        print(
            "Error: 'openpyxl' library is missing. Please install it with: pip install openpyxl"
        )
    except Exception as e:
        print(f"Error creating Excel file: {e}")


if __name__ == "__main__":
    create_dummy_excel()
