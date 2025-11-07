const mongoose = require("mongoose");
//const mongoosePaginate = require("mongoose-paginate-v2");
// const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const Schema = mongoose.Schema(
  { _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  id: {
    type: String,
  }},
  { strict: false, collection: "Conversational_query", timestamps: true }
);

// Schema.plugin(aggregatePaginate);

//Schema.plugin(mongoosePaginate);

module.exports = mongoose.model("Conversational_query", Schema);
