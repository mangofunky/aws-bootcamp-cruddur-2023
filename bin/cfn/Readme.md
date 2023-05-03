## Architecture Guide

Before you run any templates, make sure to create an S3 bucket to contain all of our artifacts fro Cloudformation

```
aws s3 mk s3://cfn-artifacts-mangofunky
export CFN_BUCKET="cfn-artifacts-mangofunky"
gp env CFN_BUCKET="cfn-artifacts-mangofunky"
```
Remember that buckets names are unique
