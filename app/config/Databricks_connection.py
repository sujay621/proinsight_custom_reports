import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DATABRICKS_SERVER_HOSTNAME = os.getenv("DATABRICKS_SERVER_HOSTNAME")
DATABRICKS_ACCESS_TOKEN = os.getenv("DATABRICKS_ACCESS_TOKEN")
HTTP_PATH = os.getenv("HTTP_PATH")
