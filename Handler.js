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

  console.log("Requested received.");

  try {
    switch (event.requestContext.http.method) {
      case methodType.get:
        body = await dynamo
          .scan({ TableName: event.queryStringParameters.TableName })
          .promise();
        break;
      case methodType.post:
        // pv(JsonData) :: PvId, GenKw, Hz, Temp, ModuleTemp, Time
        const token = event.queryStringParameters.token;
        if (token == undefined || token != "test") {
          console.log("auth token is not correct");
          throw new Error();
        }

        const jsonBody = JSON.parse(event.body);

        var dbObj = new Object();
        var item = new Object();

        item.PvId = jsonBody.PvId;
        item.Date = jsonBody.Date;
        item.GenkW = jsonBody.GenKw;
        item.Hz = jsonBody.Hz;
        item.Temp = jsonBody.Temp;
        item.ModuleTemp = jsonBody.ModuleTemp;

        dbObj.TableName = "PvData";
        dbObj.Item = item;

        await dynamo.put(dbObj).promise();

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
    console.log(err.message);
  } finally {
    statusCode = responseCode.ok;
    body = JSON.stringify(body);
    return { statusCode, body, headers };
  }
};
