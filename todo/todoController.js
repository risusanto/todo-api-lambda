const {Controller} = require("../core/controllerCore");
const {todoObj} = require("./todoModel");

class todoController extends Controller{
    constructor() {
        super();
    }

    async addTodo(event,context,callback) {
        let body = this.checkBody(event);
        if(body.status === "failed"){
            delete body.status;
            return callback(null, this.response.createResponse(400,body));
        }
        let bodyObj = body.payload;

        let insertResult = await todoObj.insertTodo(bodyObj);
        if(insertResult.status === "failed"){
            delete insertResult.status;
            return callback(null, this.response.createResponse(400,insertResult,"Failed to insert todo item"));
        }

        let todoData = insertResult.data;

        return callback(null, this.response.createResponse(200,todoData,"To do list updated"));
    }

    async fetchTodo(event,context,callback){
        let fetchResult = await todoObj.fetchTodo();

        return callback(null, this.response.createResponse(200,fetchResult));
    }

    async getTodo(event,context,callback){
        let id = event.pathParameters.id;

        let getResult = await todoObj.getTodoById(id);
        if(getResult.status === "failed"){
            return callback(null, this.response.createResponse(404,undefined,"No todo data"));
        }

        return callback(null, this.response.createResponse(200,getResult));
    }

    async updateTodo(event,context,callback) {
        let body = this.checkBody(event);
        if(body.status === "failed"){
            delete body.status;
            return callback(null, this.response.createResponse(400,body));
        }
        let bodyObj = body.payload;

        let unchangedFields = ["sortKey","partitionKey","id"];
        let getResult = await todoObj.getTodoById(bodyObj.id);
        if(getResult.status === "failed"){
            return callback(null, this.response.createResponse(404,undefined,"No todo data"));
        }
        for(let i = 0; i < unchangedFields.length; i++){
            delete bodyObj[unchangedFields[i]];
        }

        let updateFields = Object.getOwnPropertyNames(bodyObj);
        for(let i = 0; i < updateFields.length; i++){
            getResult[updateFields[i]] = bodyObj[updateFields[i]]
        }

        let updateResult = await todoObj.doDBPut(getResult);
        if(updateResult.status === "failed"){
            return callback(null, this.response.createResponse(400,undefined,"Failed to update todo data"));
        }

        return callback(null, this.response.createResponse(200,updateResult.data,"Todo data Updated"));
    }

    async deleteTodo(event,context,callback){
        let id = event.pathParameters.id;
        let deleteResult = await todoObj.deleteTodo(id);
        if(deleteResult.status === "failed"){
            delete deleteResult.status;
            return callback(null, this.response.createResponse(400,deleteResult,"Failed to delete todo data"));
        }

        return callback(null, this.response.createResponse(200, undefined,"Todo deleted"));
    }

    async getTodoByUser(event,context,callback){
        let userId = event.pathParameters.userId;

        let getResult = await todoObj.getTodoByUser(userId);

        return callback(null, this.response.createResponse(200,getResult));
    }

    async getAllTodoByDate(event, context, callback) {
        let data = {
            "date": new Date().toISOString(),
            "date": "hello"
        };
        return this.response.createResponse(400, data);
    }
}

const todo = new todoController();

module.exports = {
    todo
};