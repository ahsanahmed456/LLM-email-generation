const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    customer_id: {
      type: String,
    },
    organization_id: {
      type: String,
    },
    query_name: {
      type: String,
    },
    status: {
      type: String,
      // Values: JOB_INITIATED,JOB_CREATED,IN_PROGRESS,PARTIALLY_COMPLETED,COMPLETED
    },
    stageNo: {
      type: Number,
    },

    jobId: {
      type: String,
    },
    maxRecords: {
      type: String,
    },
    totalRecords: {
      type: Number,
    },
    totalRecordsProcessed: {
      type: Number,
    },
    recordsInserted: {
      type: Number,
      default: 0,
    },
    locator: {
      type: String,
    },
    log: {
      type: String,
    },
    error_log: {
      type: String,
    },
  },
  {
    collection: "bulk_query_status",
    timestamps: true,
    versionKey: false,
    strict: false,
  }
);

module.exports = mongoose.model("bulk_query_status", Schema);
