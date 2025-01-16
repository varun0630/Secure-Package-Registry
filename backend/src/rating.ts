import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand, ReturnConsumedCapacity,GetItemCommand,QueryCommand} from "@aws-sdk/client-dynamodb";
import { analyzeURL } from "./rating/main.js";
import { RateParameters } from "./interfaces.js";
import { package_version_exists } from "./download.js";
import { verify_token } from "./authenticate.js";

const client = new DynamoDBClient({ region: 'us-east-1' });
const tableName = "PackagesTable";


/**
 * Lambda function to retrieve the rating of a specific package version.
 * 
 * @param {APIGatewayProxyEvent} event - The event containing the request information.
 * @returns {Promise<APIGatewayProxyResult>} The result of the API call, including the package rating or an error.
 */
export const get_rating= async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const auth_header = event.headers['x-authorization']
      const [success,message,userGroup] = await verify_token(auth_header,"search") || [];
      if (!success) {
        return {
          statusCode: 403,
          body: JSON.stringify(
            {
              message: message
            })
        }
      }
      
      const id = event.pathParameters?.id as string
      if(!(id.includes("...."))){
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              Error: "Invalid Package ID"
            })
        }
      }

      const package_name = id.split("....")[0]
      const version = id.split("....")[1]
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
      console.log(id);


      const input = {
        "ExpressionAttributeValues": {
          ":v1": {"S":package_name},
          ":v2": {"S":version}
        },
        "TableName": tableName,
        "KeyConditionExpression": "packageName = :v1 AND version = :v2"
      };
      const db_command = new QueryCommand(input)
      const db_response = await client.send(db_command)

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
              Error: "You do not have permission to view this package"
            })
          };
        }
      }

      const rating = db_response.Items[0].rating.S
      if (!db_response) {
        throw new Error("Database error")
      }
      
      if (!rating) {
        return {
          statusCode: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              Error: "There is missing field(s) in the PackageID"
            })
        };
      }
      const rating_object:RateParameters = JSON.parse(rating)
      console.log(rating_object)
      if (rating_object.BusFactor==-1 || rating_object.BusFactorLatency==-1 || rating_object.ResponsiveMaintainer==-1 || rating_object.ResponsiveMaintainerLatency==-1 || rating_object.RampUp==-1 || rating_object.RampUpLatency==-1 || rating_object.Correctness==-1 || rating_object.CorrectnessLatency==-1 || rating_object.LicenseScore==-1 || rating_object.LicenseScoreLatency==-1 || rating_object.GoodPinningPractice==-1 || rating_object.GoodPinningPracticeLatency==-1 || rating_object.PullRequest==-1 || rating_object.PullRequestLatency==-1 || rating_object.NetScore==-1 || rating_object.NetScoreLatency==-1) {
        return {
          statusCode: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              Error: "The package rating system choked on at least one of the metrics"
            })
        };
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rating_object)
      };
    
  
    } 
    catch (error) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          {
            Error: String(error)
          })
      };
    }
  };
  
  