import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Lambda } from 'aws-cdk-lib/aws-ses-actions';
import { Construct } from 'constructs';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import * as dotenv from 'dotenv';

//Load env variables
dotenv.config();

export class ThumbingServerlessCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //The code that defines your stack goes here
    const bucketName: string = process.env.THUMBING_BUCKET_NAME as string;
    const folderInput: string = process.env.THUMBING_S3_FOLDER_INPUT as string;
    const folderOutput: string = process.env.THUMBING_S3_FOLDER_OUTPUT as string;
    const webhookUrl: string = process.env.THUMBING_WEBHOOK_URL as string;
    const topicName: string = process.env.THUMBING_TOPIC_NAME as string;
    const functionPath: string = process.env.THUMBING_FUNCTION_PATH as string;
    const width: string = process.env.PROCESS_WIDTH as string;
    const height: string = process.env.PROCESS_HEIGTH as string;
    console.log('bucketName',bucketName)
    console.log('folderInput',folderInput)
    console.log('folderOutput',folderOutput)
    console.log('webhookUrl',webhookUrl)
    console.log('topicName',topicName)
    console.log('functionPath',functionPath)

    const bucket = this.createBucket(bucketName);
    const lambda = this.createLambda(functionPath, bucketName, folderInput, folderOutput, width, height);
  } 
    createBucket(bucketName: string): s3.IBucket {
      const bucket = new s3.Bucket(this, 'ThumbingBucket', {
      bucketName: bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY
      });
      return bucket;
    }
    createLambda(functionPath: string, bucketName: string, folderInput: string, folderOutput: string, width: string, height: string ): lambda.IFunction {
      const lambdaFunction = new lambda.Function(this, 'ThumbLambda', {
        code: lambda.Code.fromAsset(functionPath),
        handler: 'index.handler',
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          DEST_BUCKET_NAME: bucketName,
          FOLDER_INPUT: folderInput,
          FOLDER_OUTPUT: folderOutput,
          PROCESS_WIDTH: width,
          PROCESS_HEIGTH: height
        }
      });
      return lambdaFunction;
    }
  }
