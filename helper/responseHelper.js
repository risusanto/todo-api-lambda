module.exports = {
    createResponse: (statusCode, data, message) => {
        let status = (statusCode === 200) ? "SUCCESS" : "FAILED";

        return {
            statusCode,
            body: JSON.stringify({
                status,
                message,
                data,
            }),
        };
    }
};