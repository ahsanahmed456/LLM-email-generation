const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    id: {
      type: String,
    },
    operation: {
      type: String,
    },
    object: {
      type: String,
    },
    createdById: {
      type: String,
    },

    createdDate: {
      type: String,
    },
    systemModstamp: {
      type: String,
    },
    state: {
      type: String,
    },
    concurrencyMode: {
      type: String,
    },
    contentType: {
      type: String,
    },
    apiVersion: {
      type: Number,
    },
    lineEnding: {
      type: String,
    },
    columnDelimiter: {
      type: String,
    },
    organization_id: {
      type: String,
    },
    customer_id: {
      type: String,
    },
  },
  {
    collection: "bulk_query_job",
    timestamps: true,
    versionKey: false,
    strict: false,
  }
);

module.exports = mongoose.model("bulk_query_job", Schema);
