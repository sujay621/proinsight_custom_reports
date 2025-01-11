import boto3
from openai import OpenAI
from anthropic import Anthropic
#import google.generativeai as genai
import re
import ast
import sys

from utils.utils import read_yaml_config

# Load configurations
try:
    config = read_yaml_config("config/config.yaml")
    model_config = read_yaml_config("config/model.yaml")
except Exception as e:
    print(f"Error loading configuration: {str(e)}")
    raise

AWS_REGION = config["aws"]["region"]
SSM_PARAMS = config["aws"]["ssm_param_name"]


class LLMHelper:
    SUPPORTED_PROVIDERS = {"openai", "anthropic", "gemini"}

    def __init__(self):
        # Initialize credentials and clients as None
        self.openai_credential = None
        self.anthropic_credential = None
        self.gemini_credential = None
        self.openai_client = None
        self.anthropic_client = None
        self.gemini_client = None

    def _get_credential(self, provider):
        """Generic method to retrieve API keys from AWS Parameter Store"""
        if provider not in self.SUPPORTED_PROVIDERS:
            raise ValueError(f"Unsupported provider: {provider}")

        ssm_param_name = SSM_PARAMS.get(provider)
        if not ssm_param_name:
            raise ValueError(
                f"SSM parameter name not configured for provider: {provider}"
            )

        try:
            ssm = boto3.client("ssm", region_name=AWS_REGION)
            credential = ssm.get_parameter(Name=ssm_param_name, WithDecryption=True)[
                "Parameter"
            ]["Value"]
            return credential
        except (boto3.exceptions.BotoServerError, KeyError) as e:
            raise Exception(f"Failed to retrieve {provider} key: {str(e)}")

    def _initialize_client(self, provider):
        """Initialize the appropriate client based on provider"""
        if provider not in self.SUPPORTED_PROVIDERS:
            raise ValueError(
                f"Unsupported provider: {provider}. Available providers: {', '.join(self.SUPPORTED_PROVIDERS)}"
            )

        if provider == "openai":
            if not self.openai_client:
                self.openai_client = OpenAI(api_key=self._get_credential("openai"))
            return self.openai_client
        elif provider == "anthropic":
            if not self.anthropic_client:
                self.anthropic_client = Anthropic(
                    api_key=self._get_credential("anthropic")
                )
            return self.anthropic_client
        elif provider == "gemini":
            if not self.gemini_client:
                genai.configure(api_key=self._get_credential("gemini"))
                self.gemini_client = genai
            return self.gemini_client

    def ask_llm(self, llm_config,prompt):
        """Query the specified LLM with the transcript"""
        provider = llm_config.get("llmmodel", {}).get("modelby", "openai").lower()
        model = llm_config.get("llmmodel", {}).get("modelname", "gpt-4o")

        if provider not in self.SUPPORTED_PROVIDERS:
            raise ValueError(
                f"Unsupported provider: {provider}. Available providers: {', '.join(self.SUPPORTED_PROVIDERS)}"
            )

        client = self._initialize_client(provider)

        if provider == "openai":
            result = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": prompt},
                ],
            )
            return result.choices[0].message.content

        elif provider == "anthropic":
            result = client.messages.create(
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": f"{prompt}",
                    }
                ],
                max_tokens=1000,
            )
            return result.content[0].text

        elif provider == "gemini":
            model = client.GenerativeModel(model)
            chat = model.start_chat(history=[])
            response = chat.send_message(
                f"{prompt}"
            )
            return response.text

    def clean_sql_output(self, sql_text):
        sql_text = sql_text.replace("```sql", "").replace("```", "")
        sql_text = sql_text.strip()
        return sql_text


    def get_sql_query(self, llm_config, prompt):
        """Process a single call and return structured results"""
        llm_response = self.ask_llm(llm_config, prompt)
        clean_query=self.clean_sql_output(llm_response)
        return clean_query
        # print(llm_response)