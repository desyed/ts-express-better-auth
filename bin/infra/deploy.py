#!/usr/bin/env python3

import os
import re
import sys
import json
import boto3

cluster_prefix = 'galaxy'
version_placeholder = 'VERSION_PLACEHOLDER'
ecs = boto3.client('ecs')

def list_templates(app, env):
    response = ecs.list_task_definition_families(
        familyPrefix=f'{app}-{env}',
    )

    return [f for f in response['families'] if 'template' in f]

def list_services(app, env):
    cluster = f'{cluster_prefix}-{env}'
    response = ecs.list_services(
        cluster=cluster,
    )

    return [re.sub(fr'^arn[^/]+/{cluster}/', '', arn) for arn in response['serviceArns'] if app in arn]

def get_task_definition_template(template):
    response = ecs.describe_task_definition(
        taskDefinition=template,
    )

    return response['taskDefinition']

def deploy(app, env, service, version):
    # print(f'Deploying {service} to {env} with version {version}')
    template = get_task_definition_template(f'{service}-template')
    # print(f'template {template}')
    container_definitions = re.sub(fr'{version_placeholder}', version, json.dumps(template['containerDefinitions'], default=str))
    # print(f'container_definitions {container_definitions}')
    

    response = ecs.register_task_definition(
        family=service,
        taskRoleArn=template['taskRoleArn'],
        executionRoleArn=template['executionRoleArn'],
        networkMode=template['networkMode'],
        requiresCompatibilities=template['requiresCompatibilities'],
        cpu=template['cpu'],
        memory=template['memory'],
        containerDefinitions=json.loads(container_definitions),
    )

    # print(f'response {response}')


    response = ecs.update_service(
        cluster=f'{cluster_prefix}-{env}',
        service=service,
        taskDefinition=response['taskDefinition']['taskDefinitionArn'],
    )

    # print(f'response2 {response2}')



def handle(event, context):
    for service in list_services(event['app'], event['env']):

        # TEMPORARY: Skip cron services
        # if 'cron' in service and os.environ.get('DEPLOY_CRON', 'false') != 'true':
        #     print('skipping cron service {service}')
        #     continue

        deploy(event['app'], event['env'], service, event['version'])

if __name__ == "__main__":
    handle({
        'app': sys.argv[1],
        'env': sys.argv[2],
        'version': sys.argv[3],
    }, {})



