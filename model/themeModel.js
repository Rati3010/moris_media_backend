const mongoose = require('mongoose');

const themeModelSchema = new mongoose.Schema({
  userID: {type: String},
  backgroundColor: { type: String, default: '#f5f5f5' },
  primaryColor: { type: String, default: '#ff0000' },
  secondaryColor: { type: String, default: '#00ff00' },
  textColor: { type: String, default: '#000000' },
  fontSize: { type: Number, default: 16 },
});

const themeModel = mongoose.model('THEME_PREFERENCE', themeModelSchema);

module.exports = themeModel;