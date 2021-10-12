const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const zuriTrainingSchema = Schema({
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  track: {
    type: String,
    required: true
  },
  level: {
    type: String,
    default: 'beginner'
  },
  achievement: {
    type: String,
    required: false
  },
  eduLevel: {
    type: String,
    required: false
  },
  employmentStatus: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: false
  },
  referredFrom: {
    type: String,
    required: false
  }
},
{
  timestamps: true
});

zuriTrainingSchema.plugin(uniqueValidator);
module.exports = mongoose.model('ZuriTraining', zuriTrainingSchema);
