/* eslint-disable new-cap */
/* eslint-disable no-console */
const { body, validationResult } = require('express-validator');
const Intern = require('../models/ZuriTraining-InternModel');
const sendEmail = require('../utils/email/send-email');
const { message } = require('../utils/email/template/zuriTrainingWelcome');
const { responseHandler } = require('../utils/responseHandler');

const internApplicationValidationRules = () => [
  body('name').isString().not().isEmpty(),
  body('gender').isString().not().isEmpty(),
  body('phoneNumber').isMobilePhone().not().isEmpty(),
  body('email').isEmail().not().isEmpty(),
  body('track').isString().not().isEmpty(),
  body('age').isString().not().isEmpty(),
  body('level').isString().not().isEmpty() 
];
const createIntern = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      age,
      gender,
      achievement,
      eduLevel,
      track,
      employmentStatus,
      level,
      location,
      country,
      referredFrom
    } = req.body;

    const errors = validationResult(req);
    const err = errors.array();
    const myarray = [];
    err.forEach((er) => {
      const errMessage = `${er.msg} in ${er.param}`;
      myarray.push(errMessage);
    });
    if (myarray.length > 0) {
      return responseHandler(res, 'An error occured in your inputs', 422, false, myarray);
    }

    const checkIntern = await Intern.findOne({ email });
    if (checkIntern) {
      return responseHandler(res, 'Record already exist', 401, false);
    }
    const intern = new Intern({
      name,
      age,
      gender,
      phoneNumber,
      email,
      achievement,
      eduLevel,
      track,
      level,
      employmentStatus,
      location,
      country,
      referredFrom
    });
    const recordSave = await intern.save();
    if (!recordSave) {
      return responseHandler(res, 'Unable to register application', 401, false);
    }
    const option = {
      email,
      subject: 'Welcome to Zuri Training - Ready to get started?',
      message: await message()
    };
    const sentEmail = await sendEmail(option);

    if(!sendEmail) {
      return responseHandler(res, 'Registration successful, error sending confirmation email', 500, false, error.message);
    }

    return responseHandler(res, 'Successfully Registered', 201, true, recordSave);

  } catch (error) {

    console.log(error);
    return responseHandler(res, 'Inputs error', 500, false, error.message);
    
  }
};

const getAllInterns = async (req, res) => {
  try {
    const data = await Intern.find();
    if (!data) {
      return responseHandler(res, 'Data unavailable!', 401, false);
    }
    return responseHandler(res, 'Successfully retrieved all training interns', 200, true, data);
  } catch (error) {
    return responseHandler(res, 'An error occured, could not retrieve interns', 500, false);
  }
};

const deactivateIntern = async (req, res) => {
  try {
    const { internId } = req.params;
    const intern = await Intern.findById({ _id: internId });

    if (!intern) {
      return responseHandler(res, 'Intern does not exist!', 401, false);
    }

    await Intern.findByIdAndDelete(internId, (err) => {
      if (err) {
        return responseHandler(res, err.message, 400, false);
      }
      return responseHandler(res, 'Intern deleted successfully', 200, true, intern);
    });
  } catch (error) {
    return responseHandler(res, error.message, 500, false);
  }
};

module.exports = {
  createIntern,
  internApplicationValidationRules,
  getAllInterns,
  deactivateIntern
};
