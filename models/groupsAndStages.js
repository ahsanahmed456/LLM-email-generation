const mongoose = require("mongoose");
//const mongoosePaginate = require("mongoose-paginate-v2");
// const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const Schema = mongoose.Schema(
  {},
  { strict: false, collection: "Groups_and_maps", timestamps: true }
);

// Schema.plugin(aggregatePaginate);

//Schema.plugin(mongoosePaginate);

module.exports = mongoose.model("Groups_and_maps", Schema);
