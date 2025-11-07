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
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    instanceUrl: {
      type: String,
    },
    expiry: {
      type: Date,
    },
  },
  {
    collection: "salesforce_token",
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("salesforce_token", Schema);
