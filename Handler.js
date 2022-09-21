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
    switch (event.requestContext.http.method) {
      case methodType.get:
        body = await dynamo
          .scan({ TableName: event.queryStringParameters.TableName })
          .promise();
        break;
      case methodType.post:
        // DataPkg :: UserId, UserNm, Token, JsonData
        // pv :: Id, GenkW, Hz, Temp, ModuleTemp, Time

        // user table :: UserId,
        const jsonBody = JSON.parse(event.body);

        var userObj = new Object();
        var pvObj = new Object();
        var dtaObj = new Object();

        break;
      // body = await dynamo.put(JSON.parse(event.body)).promise();
      case methodType.delete || methodType.put:
        statusCode = responseCode.notAllowedmethod;
        body = JSON.stringify(`Unsupported method : ${event.httpMethod}`);
        break;
      default:
        statusCode = responseCode.bad;
        body = JSON.stringify(
          `Unknown Method? ${event.requestContext.http.method}`
        );
        break;
    }
  } catch (err) {
    statusCode = responseCode.bad;
    body = err.message;
  } finally {
    statusCode = responseCode.ok;
    body = JSON.stringify(body);
    return { statusCode, body, headers };
  }
};
