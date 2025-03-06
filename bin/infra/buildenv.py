import os
import sys
import boto3
import argparse

def fetch_ssm_parameters(service_name, environment):
    ssm_client = boto3.client('ssm')
    path_prefix = f"/{service_name}/{environment}/"
    parameters = []
    
    response = ssm_client.get_parameters_by_path(
        Path=path_prefix,
        Recursive=True,
        WithDecryption=True
    )

    parameters.extend(response['Parameters'])
    
    while 'NextToken' in response:
        response = ssm_client.get_parameters_by_path(
            Path=path_prefix,
            Recursive=True,
            WithDecryption=True,
            NextToken=response['NextToken']
        )
        parameters.extend(response['Parameters'])

    with open('.env', 'w') as env_file:
        env_file.write("# Generated .env file\n")
        
        for param in parameters:
            param_name = param['Name']
            param_value = param['Value']
            
            key = param_name.split('/')[-1]
            env_file.write(f"{key}={param_value}\n")
            print(f"Added {key} to .env")

def main():
    parser = argparse.ArgumentParser(description='Fetch SSM parameters and create a .env file.')
    parser.add_argument('service_name', help='The service name (e.g., network-portal)')
    parser.add_argument('environment', help='The environment (e.g., dev, staging, prod)')

    args = parser.parse_args()

    fetch_ssm_parameters(args.service_name, args.environment)

if __name__ == '__main__':
    main()