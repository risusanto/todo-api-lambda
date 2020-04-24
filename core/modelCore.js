'use strict';

const AWS = require("aws-sdk");

class Model {
    constructor(documentName,requiredColumns) {
        this.tableName = process.env.Table;
        this.dbClient = new AWS.DynamoDB.DocumentClient();
        this.documentName = documentName;
        this.columns = requiredColumns;
        this._ = require("lodash");
    }

    dataValidation(data,field){
        let missing = [];
        for(let i = 0; i < field.length; i++){
            if(typeof data[field[i]] === "undefined"){
                missing.push(field[i]);
            }
        }
        let status = (missing.length === 0) ? 'success' : 'failed';
        return {
            status,
            data,
            missing
        }
    }

    async doDBDelete(params){
        params.ReturnConsumedCapacity = "TOTAL";
        let consumedCapacity = 0;
        try {
            let result = await this.dbClient.delete(params).promise();
            if(typeof result.ConsumedCapacity !== "undefined"){
                consumedCapacity += (typeof result.ConsumedCapacity.CapacityUnits !== "undefined") ? result.ConsumedCapacity.CapacityUnits : 0;
            }
        } catch (e) {
            let errorData = {
                message: "error performing delete to dynamoDb",
                parameters: params,
                errorData: e
            };
            console.log(errorData);
            return {
                status: "failed",
                ...errorData
            }
        }

        return {
            status: "success",
            message: "cart deleted",
            consumedCapacity
        }
    }

    async doDBQuery(params){
        params.ReturnConsumedCapacity = "TOTAL";
        let isScanningCompleted = false;
        let items = [];
        let lastEvaluatedKey;
        let result;
        let consumedCapacity = 0;

        try {
            while (!isScanningCompleted) {
                params.ExclusiveStartKey = lastEvaluatedKey;
                result = await this.dbClient.query(params).promise();

                if(typeof result.ConsumedCapacity !== "undefined"){
                    consumedCapacity += (typeof result.ConsumedCapacity.CapacityUnits !== "undefined") ? result.ConsumedCapacity.CapacityUnits : 0;
                }

                items = this._.concat(items, result.Items);
                lastEvaluatedKey = result.LastEvaluatedKey;
                isScanningCompleted = !lastEvaluatedKey || lastEvaluatedKey.length == 0;
            }
        } catch (e) {
            let errorData = {
                message: "error performing query to dynamoDb",
                parameters: params,
                errorData: e
            };
            console.log(errorData);
        }

        return {
            status: "success",
            items,
            consumedCapacity
        }
    }

    async doDBPut(data){
        let dateNow = new Date();
        data.modifiedOn = dateNow.toISOString();
        data.dataIndex = dateNow.getTime();

        let putParams = {
            TableName: this.tableName,
            Item: data,
            ReturnConsumedCapacity: "TOTAL"
        };

        let consumedCapacity = 0;
        let putResponse = {};
        try{
            putResponse =  await this.dbClient.put(putParams).promise();
            if(typeof putResponse.ConsumedCapacity !== "undefined"){
                consumedCapacity += (typeof putResponse.ConsumedCapacity.CapacityUnits !== "undefined") ? putResponse.ConsumedCapacity.CapacityUnits : 0;
            }
        } catch (e) {
            let errorData = {
                message: "error performing put to dynamoDb",
                parameters: putParams,
                errorData: e
            };
            console.log(errorData);
            return {
                status: "failed",
                message: "error on the server side"
            }
        }

        return {
            status: 'success',
            putParams,
            putResponse,
            data,
            consumedCapacity
        }
    }

    async doDBScan(params) {
        params.ReturnConsumedCapacity = "TOTAL";
        let isScanningCompleted = false;
        let items = [];
        let lastEvaluatedKey;
        let result;
        let consumedCapacity = 0;

        try {
            while (!isScanningCompleted) {
                params.ExclusiveStartKey = lastEvaluatedKey;
                result = await this.dbClient.scan(params).promise();

                if(typeof result.ConsumedCapacity !== "undefined"){
                    consumedCapacity += (typeof result.ConsumedCapacity.CapacityUnits !== "undefined") ? result.ConsumedCapacity.CapacityUnits : 0;
                }

                items = this._.concat(items, result.Items);
                lastEvaluatedKey = result.LastEvaluatedKey;
                isScanningCompleted = !lastEvaluatedKey || lastEvaluatedKey.length == 0;
            }
        } catch (e) {
            let errorData = {
                message: "error performing scan to dynamoDb",
                parameters: params,
                errorData: e
            };
            console.log(errorData);
        }

        return {
            status: "success",
            items,
            consumedCapacity
        }
    }

}

module.exports = {
    Model
};