import databricks.sql
import pandas as pd
import os
from datetime import datetime
import boto3
import json
import base64
import argparse  


AWS_LAMBDA_CLIENT = boto3.client("lambda", region_name="us-east-2")  # Replace with your region
LAMBDA_FUNCTION_NAME = "OhLambdaEmailHandler" # Replace with your Lambda function name

def SendEmail(
    *,
    EmailTos=[],
    EmailCcs=[],
    EmailBccs=[],
    EmailSubject="",
    EmailBodyContent="",
    EmailBodyType="plain",
    EmailAttachments=[],
    EmailReplyTo="mailer-reply@prodigaltech.com",
    MetaDataDict={}
):
    """
    Sends Email from a centralized Prodigaltech system.

        Parameters
        ----------
        EmailTos : list<str>, required
            List of Email ids that the email should be sent to as direct
            recipients.


        EmailCcs : list<str>, optional
            List of Email ids that the email should be sent to as carbon
            copy.


        EmailBccs : list<str>, optional
            List of Email ids that the email should be sent to as blind
            carbon copy.


        EmailSubject : list<str>, optional
            List of Email ids that the email should be sent to as carbon
            copy.


        EmailBodyContent : str, required
            Depending on the `EmailBodyType`, the corresponding email
            content.
            For `EmailBodyType=template_s3_plain` or
                `EmailBodyType=template_s3_html`, pass on the template name.


        EmailBodyType : str, required.
                        Options = plain, html,
                                    template_s3_plain, template_s3_html
                        Default = plain
            The corresponding type for `EmailBodyContent`.


        EmailAttachments : list<dict:attachment>, optional
            List of email attachments.
            Type: attachment
                Option 1: The data passed as a raw input
                    {   "type": "base64_encoded",
                        "filename": <Attachment-File-Name>,
                        "body": <Base64-Encoded-Raw-Data> }

                Option 2: Use a public URL that will then be added as an
                            attachment to the email.
                    {   "type": "url",
                        "filename": <Attachment-File-Name>,
                        "url": <Public-File-URL> }

                Option 3: Use asset already on S3 that will then be added
                            as an attachment to the email.
                    {   "type": "s3_object",
                        "filename": <Attachment-File-Name>,
                        "s3_path": <S3-Object-Absolute-Path> }

                            Note: The object should be accessable.

                Option 4: Use asset from local file system. Uploads the
                            data as `base64_encoded` to the tool
                    {   "type": "local_base64",
                        "filename": <Attachment-File-Name>,
                        "filepath": <Local-Absolute-Path> }


        EmailReplyTo : str, optional.
                        Default = prodigaltech@mailer.aws.prodigaltech.com
            The ReplyTo used on the email sent.


        MetaDataDict : dict, optional
            Key-Value pair of metadata that the email resource should
            be tagged against.


        Return
        ------
        Response Dictionary

            status : str. Values: "success", "failed"
                Gives the status of the request.


            error : str.
                If `status=failed`, tried to give more informative message
                about the potential error.

            job_id : str<UUID>.
                If `status=success`, the job id of the issued job of
                sending the email

            backup_location : dict<bucket, prefix>.
                If `status=success`, the location where the metadata
                was backed up.

    """

    # Verify the required attributes
    if (
        type(EmailTos) != list
        or type(EmailCcs) != list
        or type(EmailBccs) != list
        or len(EmailTos) == 0
        or len(EmailBodyContent) == 0
        or EmailBodyType.lower() not in ["plain", "html"]
    ):
        # TODO: Make this verbouse and break up error messages
        # TODO: Add check for valid emails being used

        return {
            "status": "failed",
            "error": "Invalid input parameter",
            "_debug": [
                type(EmailTos) != list,
                type(EmailCcs) != list,
                type(EmailBccs) != list,
                len(EmailTos) == 0,
                len(EmailBodyContent) == 0,
                EmailBodyType.lower() in ["plain", "html"],
            ],
        }

    EmailBodyType = EmailBodyType.lower()

    # Update Attachments and update the `type=local_base64`
    updatedEmailAttachments = []
    if len(EmailAttachments):
        for attachment in EmailAttachments:
            if attachment["type"] == "local_base64":
                tempData = None
                with open(attachment["filepath"], "rb") as f:
                    tempData = base64.b64encode(f.read()).decode("UTF-8")
                    updatedEmailAttachments.append(
                        {
                            "type": "base64_encoded",
                            "filename": attachment["filename"],
                            "body": tempData,
                        }
                    )

            else:
                updatedEmailAttachments.append(attachment)

    lambdaPayload = {
        "email": {
            "to": EmailTos,
            "cc": EmailCcs or [],
            "bcc": EmailBccs or [],
            "reply_to": EmailReplyTo,
            "subject": EmailSubject,
            "body": {
                "content": EmailBodyContent,
                "type": EmailBodyType,
            },
            "attachments": updatedEmailAttachments,
        },
        "metadata": MetaDataDict,
    }

    lambdaResp = AWS_LAMBDA_CLIENT.invoke(
        FunctionName=LAMBDA_FUNCTION_NAME,
        InvocationType="RequestResponse",
        Payload=json.dumps(lambdaPayload),
    )

    lambdaRespPayload = json.loads(lambdaResp["Payload"].read())

    return {"status": "success", **lambdaRespPayload}



def query_databricks_and_email(query, email_recipients, email_subject, server_hostname, http_path, access_token, reports_folder="reports", filename_prefix="smart_report"):
    """Queries Databricks, saves to CSV, and emails the report."""
    try:
        with databricks.sql.connect(
            server_hostname=server_hostname,
            http_path=http_path,
            access_token=access_token
        ) as connection: # Use a with statement for context management
            with connection.cursor() as cursor:
                cursor.execute(query)

                # Fetch data and column names
                rows = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]

        # Now create the DataFrame *outside* the Databricks connection
        df = pd.DataFrame(rows, columns=columns)

        if not os.path.exists(reports_folder):
            os.makedirs(reports_folder)

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{filename_prefix}_{timestamp}.csv"
        filepath = os.path.join(reports_folder, filename)

        df.to_csv(filepath, index=False)
        print(f"CSV report saved to: {filepath}")


        with open(filepath, "rb") as f:
            file_content_base64 = base64.b64encode(f.read()).decode("utf-8")

        email_attachments = [
            {"type": "base64_encoded", "filename": filename, "body": file_content_base64}
        ]

        email_response = SendEmail(
            EmailTos=email_recipients, EmailSubject=email_subject, EmailBodyContent="Dear Customer,\n\nPlease find the attached the report from ProInsight.\n\nThanks\nTeam Prodigal", EmailAttachments=email_attachments,
        )

        if email_response["status"] == "success":
            print("Email sent successfully!")
        else:
            print(f"Error sending email: {email_response.get('error', 'Unknown error')}")


    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if connection:
            connection.close()



server_hostname = os.getenv("DATABRICKS_SERVER_HOSTNAME")  # Replace with your server hostname
http_path = os.getenv("HTTP_PATH")  # Replace with your HTTP path
access_token = os.getenv("DATABRICKS_ACCESS_TOKEN")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Query Databricks and email results.")

    # Allow both --query and --query_file
    query_group = parser.add_mutually_exclusive_group(required=True) # Requires one of them
    query_group.add_argument("query", nargs="?", help="The SQL query to execute.")  # nargs="?" makes it optional within the group
    query_group.add_argument("--query_file", help="Path to the SQL query file")



    parser.add_argument("email", help="Comma-separated list of recipient email addresses.")
    parser.add_argument("--subject", help="Email subject", default="Scheduled Smart Report From ProInsight")

    args = parser.parse_args()

    email_recipients = [email.strip() for email in args.email.split(",")]


    if args.query_file:
         with open(args.query_file, 'r') as f:
             query = f.read()
    else:
        query = args.query


    query_databricks_and_email(
        query, email_recipients, args.subject, server_hostname, http_path, access_token
    )