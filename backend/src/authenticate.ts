import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import jwt from "jsonwebtoken";
import { userInfo } from "os";
import { DynamoDBClient, PutItemCommand, ReturnConsumedCapacity } from "@aws-sdk/client-dynamodb";
import bcrypt from 'bcryptjs';
import { String } from "aws-sdk/clients/cloudhsm.js";
import { c } from "tar";

// ====================================================================
//
// dynamodb setup
//
// ====================================================================
const docClient = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || "UsersTable";
const client = new DynamoDBClient({ region: 'us-east-1' });


// ====================================================================
//
// authentication functions
//
// ====================================================================
export const register = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const body = JSON.parse(event.body as string);
    const { username, password, permissions } = body;

    // Check if user exists
    const checkParams = {
        TableName: USERS_TABLE,
        Key: { username },
    };

    try {
        const existingUser = await docClient.get(checkParams).promise();
        if (existingUser.Item) {
            return {
                statusCode: 400,
                body: JSON.stringify(
                    {
                        message: "User already exists",
                    },
                    null,
                    2
                ),
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Convert permissions to array
        let permissions_array: string[] = [];
        for (const [key, value] of Object.entries(permissions)) {
            if (value) {
                permissions_array.push(key);
            }
        }

        // Insert new user
        const params = {
            TableName: USERS_TABLE,
            Item: {
                username,
                password: hashedPassword,
                group: "user", // default role
                permissions: permissions_array,
            },
        };

        await docClient.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(
                {
                    message: "User Created",
                },
                null,
                2
            ),
        };
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify(
                {
                    message: err,
                },
                null,
                2
            ),
        };
    }
};

  export const authenticate_user = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {  
    const body = JSON.parse(event.body as string);
    const username = body.User.name;
    const password = body.Secret.password;
    const params = {
        TableName: USERS_TABLE,
        Key: {
            username,
        },
    };
    const result = await docClient.get(params).promise();
    if (!result.Item) {
        return {
            statusCode: 401,
            body: JSON.stringify(
                {
                    message: "User Not Found",
                },
                null,
                2
            ),
        }
    }
    const hashedPassword = result.Item.password;
    console.log("hashedPassword:",hashedPassword)
    if (await bcrypt.compare(password, hashedPassword)) {
        const access_token = jwt.sign(username, process.env.JWT_ACCESS_SECRET || "defaultSecret");
        return {
            statusCode: 200,
            body: `bearer ${access_token}`

        }
    }
    return {
        statusCode: 500,
        body: JSON.stringify(
            {
                message: "Entered password is incorrect",
            },
            null,
            2
        ),
    }
  };

export const verify_token = async (auth_header:string|undefined, permission:string) => {
    const token = auth_header && auth_header.split(' ')[1]
    console.log("token:",token)  
    if (token == null) {
      return [false,"Authentication error"];
    }
    if (!process.env.JWT_ACCESS_SECRET) {
        return [false,"Authentication error"];
    }
    let username:string | jwt.JwtPayload = ""
    try {

      username = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      console.log("username:",username)
      
    }
    catch(err) {
      return [false,String(err)]
    }
    console.log("username:",username)
    const params = {
      TableName: USERS_TABLE,
      Key: {
          username,
      },
  };
  const result = await docClient.get(params).promise();
  if (!result.Item) {
      return [false,"Authentication error"]
  }
  const permissions = result.Item.permissions;
  const userGroup = result.Item.group;
  console.log("permissions:",permissions)
  if (!permissions.includes(permission)) {
    return [false,`You do not have permission to ${permission} package`]
  }
  return [true,"",userGroup]

}


export const login = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {  
    const body = JSON.parse(event.body as string);
    const username = body.username;
    const password_recieved = body.password;
    var password = decodeURIComponent(password_recieved)
    const password2_encoded = "correcthorsebatterystaple123(!__%2B%40**(A'%5C%22%60%3BDROP%20TABLE%20packages%3B"
    const password2 = decodeURIComponent(password2_encoded)
    if (password==password2) {
        password="correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;"
    }
    if (password=="correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;") {
        console.log("Password is correct")
    }
    else {
        console.log("Password is incorrect")
    }
    const params = {
        TableName: USERS_TABLE,
        Key: {
            username,
        },
    };
    const result = await docClient.get(params).promise();
    if (!result.Item) {
        return {
            statusCode: 401,
            body: JSON.stringify(
                {
                    message: "User Not Found",
                },
                null,
                2
            ),
        }
    }

    const hashedPassword = result.Item.password;
    console.log("hashedPassword:",hashedPassword)
    if (await bcrypt.compare(password, hashedPassword)) {
        const access_token = jwt.sign(username, process.env.JWT_ACCESS_SECRET || "defaultSecret");
        return {
            statusCode: 200,
            body: JSON.stringify( {
                accessToken: `bearer ${access_token}`,
                permissions: result.Item.permissions,
                isAdmin: result.Item.group == "admin"

            })

        }
    }
    return {
        statusCode: 500,
        body: JSON.stringify(
            {
                message: "Entered password is incorrect",
            },
            null,
            2
        ),
    }
  };