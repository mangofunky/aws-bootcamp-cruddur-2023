# Week 10 — CloudFormation Part 1

## DISCLAIMER

I've been trying to work with Gitpod but for the last few weeks and for some unknown reasons I'm not able to connect to AWS despite hundreds of attempts also issuing new keys and with several tickets to the support team and discord channel chats without any luck so everything here is based on memory, going through the videos again and looking at other peoples journals (not copying - everything here is my own words and work).
In particular I consulted https://github.com/beiciliang/aws-bootcamp-cruddur-2023/blob/main/journal/week10.md, https://github.com/Rietta1/aws-bootcamp-cruddur-2023/blob/main/journal/week10.md
So I wasn't able to carry out some further of the functionality implementation or debugging of the frontend. Please take this into account. 
I realised though in the last few days that the work around would have been to manually download the images from AWS and upload them Gitpod but this come to my mind too late to get on with it which is a shame! By this time I wasted so much time with trying to figure out the problem stopping me with everything else

When I try to login to ECR I always get:

```html
gitpod /workspace/aws-bootcamp-cruddur-2023 (main) $ ./bin/ecr/login 

An error occurred (404) when calling the GetAuthorizationToken operation: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
  <title>Page Not Found</title>
</head>
<body>Page Not Found</body>
</html>
Error: Cannot perform an interactive login from a non TTY device
gitpod /workspace/aws-bootcamp-cruddur-2023 (main) $ 
```
or when calling

```python
gitpod /workspace/aws-bootcamp-cruddur-2023 (main) $ aws sts get-caller-identity

An error occurred (Unknown) when calling the GetCallerIdentity operation: Unknown
gitpod /workspace/aws-bootcamp-cruddur-2023 (main) $ 
```
with no chance to get access to the logs

On this week we worked on CI/CD Pipeline using AWS Cloudformation

##Index of work done

Diagram available [here](https://drive.google.com/file/d/1RVzjeaFi76a1buCIZ8vapRjh_isMxNjf/view?usp=sharing)


Networking Stack - CFN Network Template

We created the networking directory *aws/cfn/networking* with the *config.toml* and the *template.yaml* files

Run *./bin/cfn/networking* command to generate the *CrdNet* stack

The template creates a /16 CIDR VPC with 6 subnets for each private and public, IGW and RT, RT associations and Outputs to be used by other CFN templates.

Can be seen [here](aws/cfn/networking/template.yaml)

Then run the following command *./bin/cfn/networking* to create the *CrdNet* stack



##CI/CD

We created CI/CD directory *aws/cfn/cicd* for the *config.toml* and the *template.yaml* files

Run *./bin/cfn/cicd* command to generate the *CrdCicd* stack

```bash
#! /usr/bin/env bash
#set -e # stop the execution of the script if it fails

CFN_PATH="/workspace/aws-bootcamp-cruddur-2023/aws/cfn/cicd/template.yaml"
CONFIG_PATH="/workspace/aws-bootcamp-cruddur-2023/aws/cfn/cicd/config.toml"
PACKAGED_PATH="/workspace/aws-bootcamp-cruddur-2023/tmp/packaged-template.yaml"
PARAMETERS=$(cfn-toml params v2 -t $CONFIG_PATH)
echo $CFN_PATH

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)

# package
# -----------------
echo "== packaging CFN to S3..."
aws cloudformation package \
  --template-file $CFN_PATH \
  --s3-bucket $BUCKET \
  --s3-prefix cicd-package \
  --region $REGION \
  --output-template-file "$PACKAGED_PATH"

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix cicd \
  --region $REGION \
  --template-file "$PACKAGED_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-cicd \
  --parameter-overrides $PARAMETERS \
  --capabilities CAPABILITY_NAMED_IAM
```


##Cluster 

We created *cluster* directory *aws/cfn/cluster* for the *config.toml* and the *template.yaml* files

Run *./bin/cfn/cluster* command to generate the *CrdCluster* stack

```bash
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

CFN_PATH="/workspace/aws-bootcamp-cruddur-2023/aws/cfn/cluster/template.yaml"
CONFIG_PATH="/workspace/aws-bootcamp-cruddur-2023/aws/cfn/cluster/config.toml"
echo $CFN_PATH

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)
PARAMETERS=$(cfn-toml params v2 -t $CONFIG_PATH)

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-cluster \
  --parameter-overrides $PARAMETERS \
  --s3-prefix "cluster" \
  --capabilities CAPABILITY_NAMED_IAM
```