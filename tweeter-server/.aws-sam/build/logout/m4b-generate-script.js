"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" }));
async function main() {
    console.log("🚀 Starting data generation...");
    console.log("👤 Creating Super User...");
    await writeSuperUser();
    console.log("👥 Batch writing 10,000 users and follows...");
    const start = Date.now();
    await batchWriteUsers(10000);
    const duration = (Date.now() - start) / 1000;
    console.log(`✅ Success! Completed in ${duration} seconds.`);
}
async function writeSuperUser() {
    try {
        const userParams = {
            TableName: "users",
            Item: {
                firstName: "Chance",
                lastName: "Carr",
                alias: "@Chance",
                imageUrl: "https://chance-340.s3.us-east-1.amazonaws.com/image/@test1.jpg",
                followeeCount: 0,
                followerCount: 10000,
            },
        };
        const loginParams = {
            TableName: "logins",
            Item: {
                alias: "@Chance",
                hash: "$2b$10$VbQYwGkKy1NeRtqh0sP1SOx4AQa8Uvg9h2eyTS4yq5sR1Oaibdf3C",
            },
        };
        await client.send(new lib_dynamodb_1.PutCommand(userParams));
        await client.send(new lib_dynamodb_1.PutCommand(loginParams));
    }
    catch (error) {
        console.error("Error creating super user:", error);
    }
}
async function batchWriteUsers(n) {
    let userBatch = [];
    let loginBatch = [];
    let followBatch = [];
    for (let i = 1; i <= n; i++) {
        const alias = `@${i}`;
        userBatch.push({
            PutRequest: {
                Item: {
                    firstName: String(i),
                    lastName: String(i),
                    alias: alias,
                    imageUrl: "https://chance-340.s3.us-east-1.amazonaws.com/image/@test1.jpg",
                    followeeCount: 1,
                    followerCount: 0,
                },
            },
        });
        loginBatch.push({
            PutRequest: {
                Item: {
                    alias: alias,
                    hash: "$2b$10$VbQYwGkKy1NeRtqh0sP1SOx4AQa8Uvg9h2eyTS4yq5sR1Oaibdf3C",
                },
            },
        });
        followBatch.push({
            PutRequest: {
                Item: {
                    follower_handle: alias,
                    followee_handle: "@Chance",
                },
            },
        });
        if (i % 8 === 0 || i === n) {
            await sendBatch(userBatch, loginBatch, followBatch);
            if (i % 800 === 0)
                console.log(`...processed ${i} users`);
            userBatch = [];
            loginBatch = [];
            followBatch = [];
        }
    }
}
async function sendBatch(users, logins, follows) {
    const params = {
        RequestItems: {
            users: users,
            logins: logins,
            follows: follows,
        },
    };
    try {
        const data = await client.send(new lib_dynamodb_1.BatchWriteCommand(params));
        if (data.UnprocessedItems &&
            Object.keys(data.UnprocessedItems).length > 0) {
            console.log("Some items were not processed:", data.UnprocessedItems);
        }
    }
    catch (error) {
        console.error("Error batch writing:", error);
    }
}
main().catch((err) => {
    console.error("Fatal error in main:", err);
    process.exit(1);
});
