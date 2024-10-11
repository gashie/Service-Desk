// In autoCreateEnrollment.js
const { sendResponse, sendCookie } = require("./utilfunc");
const { SimpleDecrypt } = require("../helper/devicefuncs");
const { getItemById } = require("../functions/dynamic");

const autoGenerateCookie = async (req, res, next, userIp) => {

    // Function implementation
    let { app_id, app_keys ,app_actor} = req.headers
        //decrypt license and check if it match the one in the db, if yes,
        // Search for user in db
        const tableName = "channels";
        const columnsToSelect = []; // Use string values for column names
        const conditions = [
          { column: "id", operator: "=", value: app_id },
        ];
        let results = await getItemById(tableName, columnsToSelect, conditions);
        let ObjectInfo = results.rows[0];

        if (!ObjectInfo) {
            //device mac not in db
            return sendResponse(res, 0, 401, "Unauthorized access, channel not found");
        }
        //----check device activation too

        //validate lince 
        let token = SimpleDecrypt(ObjectInfo.authentication_key, ObjectInfo.name);
        if (token !== app_keys) {
            //licensense does not match
            return sendResponse(res, 0, 401, "Unauthorized access");
        }
        
        let channelInfo = {
            name:ObjectInfo.name,
            actor:app_actor,
        }

        sendCookie(channelInfo, 1, 200, res, req);
        // Call next middleware
        req.channelInfo = channelInfo;
        return next();

};


module.exports = { autoGenerateCookie };