const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const responseCode = {
  ok: "200",
  bad: "400",
  unauthorized: "401",
  forbidden: "403",
  notFound: "404",
  notAllowedmethod: "405",
};

const methodType = {
  delete: "DELETE",
  put: "PUT",
  get: "GET",
  post: "POST",
};

exports.handler = async (event, context) => {
  let statusCode;
  let body;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.httpMethod) {
      case methodType.get:
        body = await dynamo
          .scan({ TableName: event.queryStringParameters.TableName })
          .promise();
        return { statusCode, body, headers };
      case methodType.post:
        console.log(event.JSON);
        body = await dynamo.put(JSON.parse(event.body)).promise();
        return { statusCode, body, headers };
      case methodType.delete || methodType.put:
        statusCode = responseCode.notAllowedmethod;
        body = getUnsupMsg(event.httpMethod);
        return { statusCode, body, headers };
      default:
        statusCode = responseCode.notAllowedmethod;
        body = getUnsupMsg(event.httpMethod);
        return { statusCode, body, headers };
    }
  } catch (err) {
    statusCode = responseCode.bad;
    body = err.message;
    return { statusCode, body, headers };
  } finally {
    statusCode = responseCode.ok;
    body = JSON.stringify(body);
    return { statusCode, body, headers };
  }
};

const getUnsupMsg = (methodNm) =>
  JSON.stringify(`Unsupported method : ${methodNm}`);
