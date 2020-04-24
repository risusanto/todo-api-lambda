const {Model} = require("../core/modelCore");
const {v4} = require("uuid");

class todoModel extends Model{
    constructor() {
        super("todo-list");
    }

    async insertTodo(data) {
        let insertData = {...data};
        let id = v4();

        insertData['partitionKey'] = this.documentName;
        insertData['sortKey'] = `${this.documentName}::${id}`;
        insertData['id'] = id;

        let dateNow = new Date();
        insertData['createdOn'] = dateNow.toISOString();

        return await this.doDBPut(insertData);
    }

    async fetchTodo(){
        let query = {
            TableName: this.tableName,
            KeyConditionExpression: "partitionKey = :partitionKey",
            ExpressionAttributeValues: {
                ":partitionKey": `${this.documentName}`,
            }
        };

        let getResult = await this.doDBQuery(query);

        return getResult.items;
    }

    async getTodoById(id){
        let query = {
            TableName: this.tableName,
            KeyConditionExpression: "partitionKey = :partitionKey and sortKey = :sortKey",
            ExpressionAttributeValues: {
                ":partitionKey": `${this.documentName}`,
                ":sortKey": `${this.documentName}::${id}`
            }
        };

        let getResult = await this.doDBQuery(query);
        let items = getResult.items;
        if(items.length < 1){
            return {
                status: "failed",
                message: "no todo data"
            }
        }

        return items[0];
    }

    async deleteTodo(id){
        let deleteParams = {
            TableName: this.tableName,
            Key: {
                partitionKey: this.documentName,
                sortKey: `${this.documentName}::${id}`
            }
        };
        return await this.doDBDelete(deleteParams);
    }

    async getTodoByUser(userId){
        let query = {
            TableName: this.tableName,
            KeyConditionExpression: "partitionKey = :partitionKey",
            FilterExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":partitionKey": `${this.documentName}`,
            }
        };

        let getResult = await this.doDBQuery(query);

        return getResult.items;
    }
}

const todoObj = new todoModel();

module.exports = {
    todoObj
};