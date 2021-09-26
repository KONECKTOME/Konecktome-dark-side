const { model, Schema } = require("mongoose");

const mailListSchema = new Schema({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true },
});

const mailistModel = model("mail-list", mailListSchema);

module.exports = mailistModel;
