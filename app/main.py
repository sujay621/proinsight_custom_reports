from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from databricks import sql
from Databricks_connection import (
    DATABRICKS_SERVER_HOSTNAME,
    DATABRICKS_ACCESS_TOKEN,
    HTTP_PATH,
)
from llm_helpers import LLMHelper
from fastapi.middleware.cors import CORSMiddleware
from utils.utils import get_llm_prompt
from typing import Dict, Any
import yaml
from pathlib import Path
from utils.PTEmailHandler import SendEmail
from fastapi import UploadFile, File, Form
import json
import pandas as pd
from io import StringIO
import os
from datetime import datetime
import base64
from typing import List

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Input model for the query
class QueryRequest(BaseModel):
    prompt: str
    tenant: str | None = None


@app.post("/execute-query")
async def execute_query(request: QueryRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        # Clean the query by removing extra whitespace
        query = " ".join(request.query.split())

        # Connect to Databricks and execute the query
        with sql.connect(
            server_hostname=DATABRICKS_SERVER_HOSTNAME,
            access_token=DATABRICKS_ACCESS_TOKEN,
            http_path=HTTP_PATH,
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute(query)
                # Get column names
                columns = (
                    [col[0] for col in cursor.description] if cursor.description else []
                )
                # Fetch all rows
                rows = cursor.fetchall() if cursor.description else []
                # Convert to list of dictionaries
                results = [dict(zip(columns, row)) for row in rows]

                return {"results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing query: {str(e)}")


@app.get("/test-connection")
async def test_connection():
    try:
        with sql.connect(
            server_hostname=DATABRICKS_SERVER_HOSTNAME,
            access_token=DATABRICKS_ACCESS_TOKEN,
            http_path=HTTP_PATH,
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                return {
                    "status": "success",
                    "message": "Connected to Databricks",
                    "test_query": result[0],
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(e)}")


# Add this class for tenant response
class TenantResponse(BaseModel):
    tenant: str | None = None


# Global variable to store current tenant
current_tenant = {"name": None}


# convert prompt to sql query
@app.post("/fetch-query")
async def fetch_query(request: QueryRequest):
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    # Get current tenant context
    if not request.tenant:
        raise HTTPException(status_code=400, detail="Tenant must be specified")
    tenant = request.tenant

    try:
        # Load prompt config
        config_path = Path("config/model.yaml")
        if not config_path.exists():
            raise HTTPException(
                status_code=500, detail="Model configuration file not found"
            )

        try:
            with open(config_path, "r") as f:
                prompt_config = yaml.safe_load(f)
        except yaml.YAMLError as e:
            raise HTTPException(
                status_code=500, detail=f"Error parsing model configuration: {str(e)}"
            )

        # Generate LLM prompt and SQL query
        try:
            llm_prompt = get_llm_prompt(request.prompt, request.tenant)
        except (FileNotFoundError, ValueError) as e:
            raise HTTPException(
                status_code=400, detail=f"Error generating prompt: {str(e)}"
            )

        try:
            llm_helper = LLMHelper()
            sql_query = llm_helper.get_sql_query(prompt_config, llm_prompt)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error generating SQL query with LLM: {str(e)}"
            )

        return {
            "original_prompt": request.prompt,
            "generated_sql": sql_query,
            "tenant": request.tenant,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating SQL query: {str(e)}"
        )


@app.get("/current-tenant", response_model=TenantResponse)
async def get_current_tenant():
    """Get the currently selected tenant."""
    return {"tenant": current_tenant["name"]}


@app.post("/current-tenant")
async def set_current_tenant(tenant: str):
    """Update the currently selected tenant."""
    current_tenant["name"] = tenant
    return {"message": f"Current tenant set to: {tenant}"}


class SendEmailRequest(BaseModel):
    emails: List[str]
    results: dict


@app.post("/send-report")
async def send_report(
    file: UploadFile = File(...),
    emails: str = Form(...),
):
    try:
        # Parse the emails JSON string back to a list
        email_list = json.loads(emails)

        # Read the file content
        contents = await file.read()

        # Create base64 encoded content
        file_content_base64 = base64.b64encode(contents).decode("utf-8")

        # Prepare email attachment
        email_attachments = [
            {
                "type": "base64_encoded",
                "filename": file.filename,
                "body": file_content_base64,
            }
        ]

        # Send email using PTEmailHandler
        email_response = SendEmail(
            EmailTos=email_list,
            EmailSubject="ProInsight Custom Report",
            EmailBodyContent="Dear Customer,\n\nPlease find attached the report from ProInsight.\n\nThanks\nTeam Prodigal",
            EmailAttachments=email_attachments,
            EmailBodyType="plain",
        )

        if email_response.get("status") == "success":
            return {
                "message": "Report sent successfully",
                "recipients": email_list,
                "filename": file.filename,
                "email_response": email_response,
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Error sending email: {email_response.get('error', 'Unknown error')}",
            )

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid email list format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending report: {str(e)}")


class ScheduleRequest(BaseModel):
    tenant: str
    email: list[str]
    time: str
    frequency: str


@app.post("/schedule-report")
async def schedule_report(request: ScheduleRequest):
    try:
        # Here you would typically:
        # 1. Validate the schedule request
        # 2. Store the schedule in your database
        # 3. Set up the actual scheduling mechanism (e.g., using celery, airflow, etc.)

        # For now, we'll just return a success response
        return {
            "message": "Report scheduled successfully",
            "schedule": {
                "tenant": request.tenant,
                "email": request.email,
                "time": request.time,
                "frequency": request.frequency,
            },
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error scheduling report: {str(e)}"
        )
