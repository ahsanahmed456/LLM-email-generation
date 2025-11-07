const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    sf_organization_id: { type: String, index: true },
    chatId: { type: String, index: true },
    messages: { type: Array, default: [] },

    // TTL field — MongoDB deletes the doc when this date passes
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
      index: { expires: 0 }, // expire exactly at the stored time
    },
  },
  { strict: false, collection: 'adaptivenurturecahthistory', timestamps: true }
);

module.exports = mongoose.model('adaptivenurturecahthistory', ChatSchema);
