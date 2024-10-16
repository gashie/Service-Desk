const uuidV4 = require("uuid");
const { generateApiKey } = require("generate-api-key");
const { SimpleEncrypt } = require("./devicefuncs");
const { addItem } = require("../functions/dynamic");
module.exports = {
  autoProcessAuthKey: async (req) => {
    let { name } = req.body;
    let generatekey = generateApiKey({
      method: "uuidv4",
      name: name.replace(/ /g, "_"),
      namespace: uuidV4.v4(),
      prefix: `jr_${name.replace(/ /g, "_")}`,
    });

    let token = SimpleEncrypt(generatekey, name);

    let enrollPayload = {
      api_key: token,
      name,
    };

    let results = await addItem("channels", enrollPayload);
    return { name, api_key: generatekey, app_id: results.rows[0].id, results };
  },
};
