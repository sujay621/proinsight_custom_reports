import boto3
import os
import argparse
import base64
import time

def create_ssm_command(instance_id, commands):
    """Creates an SSM run command and sends to the instance.
    Args:
        instance_id (str): The ID of the target EC2 instance.
        commands (list): List of commands to execute on the instance.
    Returns:
        str: Command ID of the sent SSM command.
    """
    ssm_client = boto3.client('ssm')
    response = ssm_client.send_command(
        InstanceIds=[instance_id],
        DocumentName='AWS-RunShellScript',
        Parameters={'commands': commands}
    )
    command_id = response['Command']['CommandId']
    return command_id

def wait_for_command_completion(command_id, instance_id):
    """Waits until the SSM command is completed.
    Args:
        command_id (str): ID of the command being executed.
        instance_id (str): The ID of the target EC2 instance.
    """
    ssm_client = boto3.client('ssm')
    while True:
        response = ssm_client.get_command_invocation(
            CommandId=command_id,
            InstanceId=instance_id
        )
        status = response['Status']
        if status in ['Success', 'Failed', 'TimedOut', 'Cancelled']:
            #print(f'Command execution status: {status}')
            break
        print("Waiting for command to complete...")
        time.sleep(5)


def main():
    parser = argparse.ArgumentParser(description='Wrapper script to manage cron jobs and SQL files on EC2')
    parser.add_argument('--cron_expression', required=True, help='Cron expression for the job')
    parser.add_argument('--query_file', required=True, help='Path to the SQL query file')
    parser.add_argument('--email_list', required=True, help='List of comma-separated email addresses')
    parser.add_argument('--instance_id', default='i-0e69e35e7a1bb1d25', help='EC2 instance ID')
    parser.add_argument('--target_path', default='/home/prashant', help='Target path for files')
    args = parser.parse_args()

    cron_expression = args.cron_expression
    query_file = args.query_file
    email_list = args.email_list
    instance_id = args.instance_id
    target_path = args.target_path

    # 1.  Encode the SQL file and copy using SSM
    remote_query_path = f"{target_path}/smart-report-queries/{os.path.basename(query_file)}"
    try:
        with open(query_file, 'rb') as f:
             file_content = f.read()
             encoded_content = base64.b64encode(file_content).decode('utf-8')
    except Exception as e:
         print (f'Error reading file : {e}')
         return

    commands = [
        f'sudo mkdir -p {target_path}/smart-report-queries',
        f'echo "{encoded_content}" | base64 -d > {remote_query_path}',
        f'sudo chown prashant:prashant {remote_query_path}'
        ]

    command_id = create_ssm_command(instance_id, commands)
    wait_for_command_completion(command_id, instance_id)
    print("SQL File copied to EC2 instance successfully")

    # 2. Schedule the cron job using SSM
    cron_command = f'{cron_expression} /home/prashant/env/python-demo-env/bin/python3 /home/prashant/scripts/smart_report_cron_template.py --query_file {remote_query_path} {email_list}'
    commands = [
        f'(crontab -u prashant -l ; echo "{cron_command}") | crontab -u prashant -',
        f'sudo chmod 600 /var/spool/cron/prashant' # ensure permissions for crontab
    ]
    command_id = create_ssm_command(instance_id, commands)
    wait_for_command_completion(command_id, instance_id)
    print("Cron job scheduled successfully")

if __name__ == '__main__':
    main()