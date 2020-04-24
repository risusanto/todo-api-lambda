'use strict';
const jwt = require("jwt-simple");

const generatePolicy = function(principalId, effect, resource, decodedToken) {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
        authResponse.context = decodedToken;
    }
    return authResponse;
};

module.exports = {
    authorizerFunc: (event,context,callback) => {
        let decoded = "";
        let userId = "";
        let token = "";
        let bearerToken = "";

        try{
            bearerToken = event.authorizationToken;
        } catch (error) {
            console.log("No Authorization token");
            return callback('Unauthorized');
        }

        try{
            token = bearerToken.split(" ")[1];
            decoded = jwt.decode(token, process.env.jwtKey);
            userId = decoded.userId;
        } catch (error) {
            console.log("Invalid Bearer format");
            return callback('Unauthorized');
        }

        try{
            decoded = jwt.decode(token, process.env.jwtKey);
            userId = decoded.userId;
        } catch (error) {
            console.log("Error decode token");
            return callback('Unauthorized');
        }

        // get user by userId
        callback(null, generatePolicy(userId, 'Allow', "*", decoded));
    }
};