
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
// import * as dotenv from 'dotenv';
// dotenv.config();
import { execSync } from 'child_process';
import AWS from "aws-sdk";
import * as path from 'path';
import * as fs from 'fs';
import { BinaryLike, createHash } from 'crypto';
import { CodeartifactClient, PackageFormat, PublishPackageVersionCommand,GetPackageVersionAssetCommand} from "@aws-sdk/client-codeartifact";
import axios from "axios";
import { Readable } from "stream";
import JSZip from "jszip";
import { DynamoDBClient, PutItemCommand, ReturnConsumedCapacity,GetItemCommand} from "@aws-sdk/client-dynamodb";
import { zipStreamToBase64 } from "./helpers.js";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import jwt from 'jsonwebtoken';
import { verify_token } from "./authenticate.js";

const USERS_TABLE = process.env.USERS_TABLE || "UsersTable";
const tableName = "PackagesTable";
const codeartifact_client = new CodeartifactClient({ region: 'us-east-2' });
const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient();


export const package_version_exists = async (package_name:string,version:string) => {
  const input = {
    "ExpressionAttributeValues": {
      ":v1": {"S":package_name},
      ":v2": {"S":version}
    },
    "TableName": tableName,
    "KeyConditionExpression": "packageName = :v1 AND version = :v2",
    "ProjectionExpression": "productID"
  };
  const db_command = new QueryCommand(input)
  const db_response = await client.send(db_command)
  // console.log(db_response)
  // console.log(db_response)
  if (db_response.Items && db_response.Items.length== 0) {  
    return false
  }
  return true;

}

/**
 * Retrieves metadata and content for a specific package version from AWS CodeArtifact.
 *
 * @param {APIGatewayProxyEvent} event - The API Gateway event containing the package ID in path parameters.
 * @returns {Promise<APIGatewayProxyResult>} - A promise that resolves to the package metadata and base64-encoded content if found, or an error response.
 */
export const get_package = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => { 
  try {
    console.log("Entering Section 0")
    console.log(event.pathParameters)
    const id = event.pathParameters?.id as string
    if (!id) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          {
            Error: "Missing package ID"
          })
      }
    }
    // const body = JSON.parse(event.body as string);
    // console.log(body)
    const auth_header = event.headers['x-authorization']
    const [success,message,userGroup] = await verify_token(auth_header,"download") || [];
    if (!success) {
      return {
        statusCode: 403,
        body: JSON.stringify(
          {
            message: message
          })
      }
    }
      //check if id has a -
      console.log("Entering this section 1")
      if (!id.includes("....")) {
          return {
              statusCode: 404,
              headers: { "Content-Type": "application/json" },
              body: "Invalid Package ID"
          }
      }
      const package_name = id.split("....")[0]
      const version = id.split("....")[1]
      console.log("Entering this section 2")
      if (!(await package_version_exists(package_name,version))) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              Error: "Package not found"
            })
        }
      }
      console.log("Entering this section 3")
      const db_input = {
        "ExpressionAttributeValues": {
          ":v1": {"S":package_name},
          ":v2": {"S":version}
        },
        "TableName": tableName,
        "KeyConditionExpression": "packageName = :v1 AND version = :v2"
      };
      const db_command = new QueryCommand(db_input)
      const db_response = await client.send(db_command)
      console.log("Entering this section 4")
      if (!db_response.Items) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              Error: "Package not found"
            })
        }
      }
      console.log("Entering this section 5")
      if (db_response.Items.length== 0) {  
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
          {
            Error: "Package Not Found"
          })
        };
      }
      const isSecret = db_response.Items[0].isSecret.S
      console.log("Is secret is",isSecret)
      if (isSecret=='true') {
        console.log(isSecret)
        if (userGroup!=db_response.Items[0].group.S && userGroup!="admin") {
          console.log(userGroup)
          console.log(db_response.Items[0].group.S)
          return {
            statusCode: 403,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
            {
              Error: "You do not have permission to download this package"
            })
          };
        }
      }

      console.log("Entering this section 6")
      const input = { // GetPackageVersionAssetRequest
          domain: "group15", // required
          repository: "SecurePackageRegistry", // required
          format: PackageFormat.GENERIC,
          namespace: "my-ns",
          package: package_name, // required
          packageVersion: version, // required
          asset: `${package_name}-${version}.zip` // required   
        };
      let response;
      try {
        const command = new GetPackageVersionAssetCommand(input);
        response = await codeartifact_client.send(command);
      }

      catch {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify(
            {
              Error: "Package not found"
            })
          }
      }
      const base64String = await zipStreamToBase64(response.asset as Readable);

      type Response = {
          metadata: {
            Name: string, 
            Version: string, 
            ID: string}, 
          data: {
            Content: string, 
            JSProgram: string
          }
        }
        const api_response:Response  = 
        {
          "metadata": {
            "Name": package_name,
            "Version": version,
            "ID": id
          },
          "data": {
            "Content": base64String,
            "JSProgram": ''
          }
        }
      console.log(api_response)
      console.log(api_response)
      return {
          statusCode: 200,
          headers: {
              "contentType": 'application/json', 
          },
          body: JSON.stringify(api_response)
      } 

  }
      catch (err) {
          return {
              statusCode: 200,
              body: JSON.stringify(
                {
                  message: err
                }
              )
            };

      }

  
  };

  /**
 * Serves a package file for download by providing a ZIP file response.
 *
 * @param {APIGatewayProxyEvent} event - The API Gateway event containing the package name, version, and content in the request body.
 * @returns {Promise<APIGatewayProxyResult>} - A promise that resolves to a response containing the ZIP file as a base64-encoded string with appropriate headers.
 */
  export const download_package = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {  
    

    try {

    const body = JSON.parse(event.body as string);
    
    return {
      statusCode: 200,
      headers: {
        "contentType": "application/zip",
        "Content-Disposition": `attachment; filename=${body.name}-${body.version}.zip`
        },
      
      body: body.content,
      isBase64Encoded: true
  };

}

catch (err) {
    return {
        statusCode: 200,
        body: JSON.stringify(
          {
            message: err,
          }
        )
      };
}
}