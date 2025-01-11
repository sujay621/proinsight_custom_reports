import boto3
import pymongo
from dotenv import load_dotenv
import os

load_dotenv()

DB_IP = os.getenv("MONGODB_HOST", "ip-172-31-6-248.us-east-2.compute.internal")
AWS_REGION = os.getenv("AWS_REGION", "us-east-2")


def get_params(parameter, region=AWS_REGION, source=None, tenant=None):
    """Get parameters from AWS Parameter Store"""
    ssm = boto3.client("ssm", region_name=region)

    if source:
        name = f"/source/{source}/integration/{parameter}"
    else:
        name = f"/voice/{tenant}/db/read-write/{parameter}"

    try:
        credential = ssm.get_parameter(Name=name, WithDecryption=True)["Parameter"][
            "Value"
        ]
        return credential
    except Exception as e:
        print(f"Error getting parameter {name}: {str(e)}")
        return None


def get_db(tenant_name):
    """Get MongoDB connection"""
    try:
        db_name = "voice_mvp_" + tenant_name
        # db_username = os.getenv("MONGODB_USERNAME") | 'alliancerevcycle_rw'
        # db_password = os.getenv("MONGODB_PASSWORD") | 'zZnzXLhC'
        ssm = boto3.client("ssm", region_name=AWS_REGION)
        db_username = ssm.get_parameter(Name=f"/hackathon25/smartreports/prod/db/read/username", WithDecryption=True)["Parameter"]["Value"]
        db_password = ssm.get_parameter(Name=f"/hackathon25/smartreports/prod/db/read/password", WithDecryption=True)["Parameter"]["Value"]
        print(db_username, db_password, tenant_name)

        if not db_username or not db_password:
            raise Exception("Could not get database credentials")

        client = pymongo.MongoClient(
            host=DB_IP,
            port=27017,
            username=db_username,
            password=db_password,
            authSource='admin',
        )

        return client[db_name]
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        return None
