from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from databricks import sql
from .config.Databricks_connection import (
    DATABRICKS_SERVER_HOSTNAME,
    DATABRICKS_ACCESS_TOKEN,
    HTTP_PATH,
)

app = FastAPI()


# Input model for the query
class QueryRequest(BaseModel):
    query: str


@app.post("/execute-query")
async def execute_query(query_request: QueryRequest):
    try:
        # Clean the query by removing extra whitespace
        query = " ".join(query_request.query.split())

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
