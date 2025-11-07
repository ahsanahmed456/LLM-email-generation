const mongoose = require('mongoose');

const Schema = mongoose.Schema(
  {},
  {
    strict: false,                 // allow any fields (sfid, name, text, etc.)
    collection: 'adaptive-sequence-CreateListRule',
    timestamps: true,
    id: false
  }
);

module.exports = mongoose.model('adaptive-sequence-CreateListRule', Schema);
