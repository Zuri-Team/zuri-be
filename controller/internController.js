/* eslint-disable no-unused-vars */
const { body, validationResult } = require('express-validator');
const Intern = require('../models/ZuriTraining-InternModel');
const { responseHandler } = require('../utils/responseHandler');
const sendEmail = require('../utils/email/send-email');
const { message } = require('../utils/email/template/zuriTrainingWelcome');

// Validation rules
const internValidation = () => [
  body('name').isString().not().isEmpty(),
  body('gender').isString().not().isEmpty(),
  body('phoneNumber').isMobilePhone().not().isEmpty(),
  body('email').isEmail().not().isEmpty(),
  body('track').isString().not().isEmpty(),
  body('age').isString().not().isEmpty(),
  body('level').isString().not().isEmpty()
];

// Enroll new Intern
// @METHOD POST
 const enrollIntern = async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    gender,
    age,
    employmentStatus,
    eduLevel,
    country,
    track,
    level,
    referredFrom
  } = req.body;

  try {
    const errors = validationResult(req);
    const err = errors.array();
    const myArray = [];
    err.forEach((er) => {
      const errMessage = `${er.msg} in ${er.param}`;
      myArray.push(errMessage);
    });

    if (myArray.lenght > 0) {
      return responseHandler(res, 'Ensure all fields are entered correctly', 422, false, myArray);
    }
    // Checking if Intern already exists
    const isIntern = await Intern.findOne({ email });
    if (isIntern) {
      return responseHandler(res, 'This user already exists', 401, false);
    }
    // Creating new intern object
    const intern = new Intern({
      name,
      email,
      phoneNumber,
      gender,
      age,
      employmentStatus,
      eduLevel,
      country,
      track,
      level,
      referredFrom
    });
    // Saving new User object
    const newIntern = intern.save();
    if (!newIntern) {
      return responseHandler(res, 'Unable to save', 401, false);
    }
    return responseHandler(res, 'new Intern created', 201, true, newIntern);
  } catch (error) {
    return responseHandler(res, 'inputs error', 500, false, error.message);
  }
};

// Get all Interns
const getInterns = async (req, res) => {
  try {
    const interns = await Intern.find();
    if (!interns) {
      return responseHandler(res, 'success', 201, true, []);
    }
    return responseHandler(res, 'success', 200, true, interns);
  } catch (error) {
    return responseHandler(res, 'Server error', 500, false, error.message);
  }
};

const removeIntern = (req, res) => {
  try {
    Intern.findOneAndDelete(req.params.id, (err, intern) => {
      if (err) {
        return responseHandler(res, 'This user does not exists', 404, false);
      }
      if (!intern) {
        return responseHandler(res, 'This user does not exists', 404, false);
      }
      return responseHandler(res, 'Intern deleted', 200, true, intern);
    });
  } catch (error) {
    return responseHandler(res, 'Server error', 500, false, error.message);
  }
};

module.exports = {
  enrollIntern,
  internValidation,
  getInterns,
  removeIntern
};