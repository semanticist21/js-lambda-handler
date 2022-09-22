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
        // DataPkg :: UserId, UserNm, Token, JsonData
        // pv(JsonData) :: PvId, GenKw, Hz, Temp, ModuleTemp, Time

        // User table :: UserId, UserNm
        // Pv table :: UserId, PvId
        // PvData table :: PvId, GenKw, Hz, Temp, ModuleTemp, Time

        const jsonBody = JSON.parse(event.body);

        var userDbObj = new Object();
        var pvDbObj = new Object();
        var dataDbObj = new Object();

        var userObj = new Object();
        var pvObj = new Object();
        var dataObj = new Object();

        const userId = event.pathParameters.id;

        userObj.Id = userId;
        userObj.Name = jsonBody.UserNm;

        const jsonPvData = JSON.parse(JSON.stringify(jsonBody.JsonData));

        pvObj.UserId = userId;
        pvObj.PvId = jsonPvData.Id;

        dataObj.PvId = jsonPvData.PvId;
        dataObj.Genkw = jsonPvData.GenKw;
        dataObj.Hz = jsonPvData.Hz;
        dataObj.Temp = jsonPvData.Temp;
        dataObj.ModuleTemp = jsonPvData.ModuleTemp;
        dataObj.Time = jsonPvData.Time;

        userDbObj.TableName = "User";
        userDbObj.Item = userObj;

        pvDbObj.TableName = "Pv";
        pvDbObj.Item = pvObj;

        dataDbObj.TableName = "PvData";
        dataDbObj.Item = dataObj;

        await dynamo.put(userDbObj).promise();
        await dynamo.put(pvDbObj).promise();
        await dynamo.put(dataDbObj).promise();

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
