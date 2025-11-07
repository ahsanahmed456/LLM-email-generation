const mongoose = require('mongoose');

const Schema = mongoose.Schema(
  {},
  {
    strict: false,                 // allow any fields (sfid, name, text, etc.)
    collection: 'adaptive-sequence-CreateListRule-ChatHistory',
    timestamps: true,
    id: false
  }
);

module.exports = mongoose.model('adaptive-sequence-CreateListRule-ChatHistory', Schema);
