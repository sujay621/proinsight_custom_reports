import os
import sys
import re
import copy
import json
import time
import datetime
import pytz
import requests
from pprint import pprint

import pandas as pd

# Append necessary paths for module imports
sys.path.append("/home/jupyter/dailyninja/Ingestion/")
sys.path.append('/mnt/efs/homedirs/codekeeper/code/voice-core-backend/branch-master')

from get_dbclient import get_db
from reporting.scorecard_review_report import ScorecardReviewReport


def sanitize_sheet_name(sheet_name):
    """
    Sanitize the sheet name by removing special characters,
    trimming whitespace, and limiting length to 30 characters.
    """
    # Remove all non-alphanumeric characters
    sanitized = re.sub(r'[^\w]', '', sheet_name)
    # Normalize whitespace and truncate to 30 characters
    return ' '.join(sanitized.split())[:30]


def initialize_reporting(db, flag, scorecard_id):
    """
    Initialize the ScorecardReviewReport object based on the flag.
    """
    if flag == "previous day":
        return ScorecardReviewReport(db, _delta=1, weekly=False, monthly=False)
    elif flag == "weekly":
        return ScorecardReviewReport(db, _delta=1, weekly=True, monthly=False)
    elif flag == "monthly":
        return ScorecardReviewReport(db, _delta=1, weekly=False, monthly=True)
    else:
        raise ValueError(f"Unsupported flag value: {flag}")


def main(tenant, scorecard_name, flag):
    # Initialize database connection
    db = get_db(tenant)

    # Retrieve scorecard ID from DB
    scorecard_data = db.scorecard_templates.find_one({"name": scorecard_name})
    if not scorecard_data:
        raise ValueError(f"Scorecard with name '{scorecard_name}' not found.")
    scorecard_id = scorecard_data["_id"]

    # Create reporting instance based on flag
    reporting = initialize_reporting(db, flag, scorecard_id)

    # Prepare report filename
    start_date = datetime.datetime.now().strftime("%Y%m%d")
    sanitized_scorecard_name = sanitize_sheet_name(scorecard_name)
    report_name = f"{tenant}_Scorecard_Review_Report_{flag}_{sanitized_scorecard_name}_{start_date}.xlsx"
    print(f"Generating report: {report_name}")

    # Generate report DataFrame
    df = reporting.generate_review_scorecard_report(
        template_id=scorecard_id,
        _filter={},
        date_fields_to_use=['callTime']
    )

    # Save DataFrame to Excel using context manager
    with pd.ExcelWriter(report_name, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False)
        writer.save()

    print("Report generation complete.")