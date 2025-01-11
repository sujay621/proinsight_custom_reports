import json
import os
from pathlib import Path
import yaml
from config.mongodb_connection import get_db


def read_yaml_config(file_path: str) -> dict:
    """Read YAML configuration file."""
    # Get the absolute path to the app directory
    app_dir = Path(__file__).parent.parent
    config_path = app_dir / file_path

    if not config_path.exists():
        raise FileNotFoundError(f"Configuration file not found: {config_path}")

    try:
        with open(config_path, "r") as file:
            return yaml.safe_load(file)
    except yaml.YAMLError as e:
        raise ValueError(f"Error parsing YAML configuration: {str(e)}")

def get_tag_list(tenant):
    db = get_db(tenant)
    tags = db['tags'].find()
    tag_list = [tag["_id"] for tag in tags]
    return tag_list

def get_llm_prompt(user_prompt, tenant):
    # Get the absolute path to the app directory
    app_dir = Path(__file__).parent.parent
    schema_path = app_dir / "Schemas" / tenant
    tag_list = get_tag_list(tenant)
    print(tag_list)

    try:
        # Define schema file paths
        call_data_schema_path = schema_path / f"{tenant}_call_data_schema.json"
        scorecard_responses_schema_path = schema_path / f"{tenant}_scorecard_responses_schema.json"
        scorecard_templates_schema_path = schema_path / f"{tenant}_scorecard_templates_schema.json"
        tags_schema_path = schema_path / f"{tenant}_tags_schema.json"

        # Verify all required schema files exist
        if not all(path.exists() for path in [
            call_data_schema_path,
            scorecard_responses_schema_path,
            scorecard_templates_schema_path,
            tags_schema_path
        ]):
            raise FileNotFoundError(
                f"One or more schema files missing for tenant {tenant} in {schema_path}"
            )

        # Load schemas
        with open(call_data_schema_path) as f:
            call_data_schema = json.load(f)
        with open(scorecard_responses_schema_path) as f:
            scorecard_responses_schema = json.load(f)
        with open(scorecard_templates_schema_path) as f:
            scorecard_templates_schema = json.load(f)
        with open(tags_schema_path) as f:
            tags_schema = json.load(f)

        # Define table names
        call_data_table = f"main.samudra_v2_silver.voice_mvp_{tenant}__call_data"
        scorecard_responses_table = f"main.samudra_v2_silver.voice_mvp_{tenant}__scorecard_responses"
        scorecard_templates_table = f"main.samudra_v2_silver.voice_mvp_{tenant}__scorecard_templates"
        tags_table = f"main.samudra_v2_silver.voice_mvp_{tenant}__tags"
        return f"""You are a SQL query expert. You are given three tables and their schema. You need to generate a SQL query that will return the data which is relevant to the USER QUERY.
        
        USER QUERY: {user_prompt}

        **Important Notes**:
        1. Use {call_data_table} to fetch the call level details. 
        2. Use {scorecard_responses_table} to fetch the scorecard level details. But note that the {scorecard_responses_table} only contains the answers for a scorecard and to find the questions use {scorecard_templates_table}.
        3. If you ever require to join {call_data_table} and {scorecard_responses_table} then you can join using '_id' field of {call_data_table} and 'callID' field of {scorecard_responses_table}.
        4. If you ever require to join {scorecard_responses_table} and {scorecard_templates_table} then you can join using 'scorecardTemplateId' field of {scorecard_responses_table} and  '_id' of {scorecard_templates_table}.
        5. If someone refers to a tag, you can query ‘tags’ field in the {call_data_table}.
        6. Many times user doesn’t know exact tag _id. So first you need a best guess to find the ‘_id’ from the list of tags {tag_list} for the tag names provided by the user. Then you can use these _id to query the tables. For example if user mentions ‘wrong party’ tag, then exact tag ‘_id’ should be ‘generic/Wrong Party’. Example2: ‘do not call’ tag, then exact tag ‘_id’ should be ‘generic/Do Not Call’. In case if you are able to find more than one tag then put or condition array_contains for all the relevant tags.
        7. When user mentions anything about a scorecard it means they are referring to scorecard responses. Scorecard templates is just a template of questions(it should just be used to fetch the questions). And scorecard responses are the answers to those questions.
        8. If there is a question about the sentiment then always use ‘scores’ field in the {call_data_table} to find the sentiment score.


        **Tables and Schemas**:
        {call_data_table}: {call_data_schema},
        {scorecard_responses_table}: {scorecard_responses_schema},
        {scorecard_templates_table}: {scorecard_templates_schema},
        {tags_table}: {tags_schema}

        **Output**: Just give the query, I don’t need any other information. Always re-ensure that the query is correct by validating the field from the schema and will return the data as per the user query. Also, ensure that the syntax is correct.
        """

    except FileNotFoundError as e:
        raise ValueError(f"Schema files for {tenant} not found: {str(e)}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in schema files for {tenant}: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error loading schema files for {tenant}: {str(e)}")



