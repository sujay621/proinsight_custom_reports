from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from databricks import sql
from .config.Databricks_connection import (
    DATABRICKS_SERVER_HOSTNAME,
    DATABRICKS_ACCESS_TOKEN,
    HTTP_PATH,
)
from fastapi.middleware.cors import CORSMiddleware
from .config.mongodb_connection import get_db
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
    query: str


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


@app.get("/current-tenant", response_model=TenantResponse)
async def get_current_tenant():
    """Get the currently selected tenant."""
    return {"tenant": current_tenant["name"]}


@app.post("/current-tenant")
async def set_current_tenant(tenant: str):
    """Update the currently selected tenant."""
    current_tenant["name"] = tenant
    return {"message": f"Current tenant set to: {tenant}"}


@app.get("/scorecards/{tenant_id}")
async def get_scorecards(tenant_id: str):
    """Get scorecards for a specific tenant."""
    try:
        db = get_db(tenant_id)
        if not db:
            raise HTTPException(status_code=500, detail="Could not connect to database")

        # Get all scorecard names from MongoDB
        scorecards = []
        for scorecard in db.scorecard_templates.find({}, {"name": 1}):
            if scorecard.get("name"):
                scorecards.append(scorecard["name"])

        return {"scorecards": scorecards}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching scorecards: {str(e)}"
        )


@app.get("/scorecard/{tenant_id}/{scorecard_name}")
async def get_scorecard_details(tenant_id: str, scorecard_name: str):
    """Get specific scorecard details."""
    try:
        db = get_db(tenant_id)
        if not db:
            raise HTTPException(status_code=500, detail="Could not connect to database")

        scorecard = db.scorecard_templates.find_one({"name": scorecard_name})
        if not scorecard:
            raise HTTPException(
                status_code=404, detail=f"Scorecard {scorecard_name} not found"
            )

        return {
            "id": str(scorecard["_id"]),
            "name": scorecard["name"],
            "details": scorecard,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching scorecard details: {str(e)}"
        )


class QuickReportRequest(BaseModel):
    report_type: str
    frequency: str
    tenant: str
    scorecard_name: str | None = None
    selected_tags: List[str] | None = None


@app.post("/quick-report")
async def generate_quick_report(request: QuickReportRequest):
    """Generate report based on selected options"""
    try:
        print(f"Generating {request.report_type} report")
        print(f"Frequency: {request.frequency}")
        print(f"Tenant: {request.tenant}")

        if request.report_type == "Scorecard review report":
            print(f"Selected scorecard: {request.scorecard_name}")
            # Add scorecard report logic here
            return {
                "message": "Scorecard report generated",
                "details": {
                    "type": request.report_type,
                    "frequency": request.frequency,
                    "scorecard": request.scorecard_name,
                },
            }

        elif request.report_type == "Tag based report":
            print(f"Selected tags: {request.selected_tags}")
            # Add tag report logic here
            return {
                "message": "Tag report generated",
                "details": {
                    "type": request.report_type,
                    "frequency": request.frequency,
                    "tags": request.selected_tags,
                },
            }

        return {"message": "Unknown report type"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating report: {str(e)}"
        )
