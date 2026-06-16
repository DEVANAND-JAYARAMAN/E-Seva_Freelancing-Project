import {
  EC2Client,
  StartInstancesCommand,
  StopInstancesCommand,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";

const ec2 = new EC2Client({ region: "ap-south-1" });
const dynamo = new DynamoDBClient({ region: "ap-south-1" });

const INSTANCE_ID = process.env.EC2_INSTANCE_ID || "i-0c3145fb3cf6049c4";
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "eseva-admin-2024";
const TABLE = "AppConfig";

async function getInstanceInfo() {
  const res = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [INSTANCE_ID] }));
  const inst = res.Reservations[0].Instances[0];
  return {
    state: inst.State.Name,
    publicIP: inst.PublicIpAddress || "",
  };
}

async function saveIPToDynamo(ip) {
  await dynamo.send(new PutItemCommand({
    TableName: TABLE,
    Item: {
      PK: { S: "CONFIG" },
      SK: { S: "EC2_IP" },
      value: { S: ip },
      updatedAt: { S: new Date().toISOString() },
    },
  }));
}

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "X-Admin-Key,Content-Type",
  };

  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const path = event.requestContext?.http?.path || "";

  // /ip is public - no auth needed
  if (path.endsWith("/ip")) {
    try {
      const res = await dynamo.send(new GetItemCommand({
        TableName: TABLE,
        Key: { PK: { S: "CONFIG" }, SK: { S: "EC2_IP" } },
      }));
      const ip = res.Item?.value?.S || "";
      return { statusCode: 200, headers, body: JSON.stringify({ public_ip: ip }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  const adminKey = event.headers?.["x-admin-key"] || event.headers?.["X-Admin-Key"];
  if (adminKey !== ADMIN_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "unauthorized" }) };
  }

  try {
    if (path.endsWith("/start")) {
      await ec2.send(new StartInstancesCommand({ InstanceIds: [INSTANCE_ID] }));

      // Poll for IP up to 60s
      let publicIP = "";
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const info = await getInstanceInfo();
        if (info.publicIP) {
          publicIP = info.publicIP;
          break;
        }
      }

      if (publicIP) await saveIPToDynamo(publicIP);

      return { statusCode: 200, headers, body: JSON.stringify({ status: "started", public_ip: publicIP }) };
    }

    if (path.endsWith("/stop")) {
      await ec2.send(new StopInstancesCommand({ InstanceIds: [INSTANCE_ID] }));
      await saveIPToDynamo("");
      return { statusCode: 200, headers, body: JSON.stringify({ status: "stopped" }) };
    }

    if (path.endsWith("/status")) {
      const info = await getInstanceInfo();
      return { statusCode: 200, headers, body: JSON.stringify({ state: info.state, public_ip: info.publicIP }) };
    }

    if (path.endsWith("/ip")) {
      const res = await dynamo.send(new GetItemCommand({
        TableName: TABLE,
        Key: { PK: { S: "CONFIG" }, SK: { S: "EC2_IP" } },
      }));
      const ip = res.Item?.value?.S || "";
      return { statusCode: 200, headers, body: JSON.stringify({ public_ip: ip }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: "not found" }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
