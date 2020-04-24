'use strict';

const jwt = require("jwt-simple");

class Controller {
    constructor() {
        this.response = require("../helper/responseHelper");
    }

    checkBody(event) {
        // check if request body is available
        console.log(JSON.stringify(event.body));
        if (event.body == null){
            return {
                status: 'failed',
                message: "Payload not found"
            }
        }
        // check if body is encoded with base64 if true, then decode
        if (event.isBase64Encoded === true){
            let buff = new Buffer(event.body, 'base64');
            event.body = buff.toString('utf8');
        }
        // try parsing request body, if request body is not JSON formated object, return error response
        let bodyObj = {};
        try {
            bodyObj = JSON.parse(event.body)
        } catch (error) {
            return {
                status: 'failed',
                message: error
            }
        }

        return {
            status: "success",
            payload: bodyObj
        }
    }

    base64Decode(base64String){
        let buff = new Buffer(base64String, 'base64');
        return buff.toString('utf8');
    }

    encodeJwt(payload){
        return jwt.encode(payload,process.env.jwtKey);
    }
}

// export class
module.exports ={
    Controller
};