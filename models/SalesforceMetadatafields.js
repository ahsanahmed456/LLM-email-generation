const mongoose = require("mongoose");
//const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const Schema = mongoose.Schema(
  {},
  { strict: false, collection: "sf_metadata", timestamps: true }
);

Schema.plugin(aggregatePaginate);

//Schema.plugin(mongoosePaginate); 


module.exports = mongoose.model("sf_metadata", Schema);

   