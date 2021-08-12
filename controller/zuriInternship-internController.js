const { body, validationResult } = require('express-validator');
const ZuriIntern = require('../models/ZuriInternship-InternModel');
const { message } = require('../utils/email/template/zuriInternshipWelcome');
const { trainingWelcome } = require('../utils/email/template/zuriInternshipTrainWelcome.')
const { responseHandler } = require('../utils/responseHandler');
const sendEmail = require('../utils/email/send-email');

// Zuri Get all interns
const getAllInterns = async (req, res) => {
  try {
    const data = await ZuriIntern.find();
    if (!data) {
      return responseHandler(res, 'Data unavailable!', 401, false);
    }
    return responseHandler(res, 'Successfully retrieved all interns', 200, true, data);
  } catch (error) {
    return responseHandler(res, 'An error occured, could not retrieve interns', 500, false);
  }
};

// Zuri Filter interns based on track i.e backend frontend
const filterInterns = async (req, res) => {
  let filterValue;
  if (req.query.track) {
    filterValue = {
      track: req.query.firstName,
    };
  } else {
    filterValue = {
      track: ''
    };
  }
  try {
    const zuriInterns = await ZuriIntern.find(filterValue);
    return responseHandler(res, 'Success', 200, true, zuriInterns);
  } catch (err) {
    return responseHandler(res, 'An Error occured', 500, false, err);
  }
};

// Zuri Intern Validation rules
const zuriInternValidationRules = () => [
  body('name').isString().not().isEmpty(),
  body('gender').isString().not().isEmpty(),
  body('phoneNumber').isMobilePhone().not().isEmpty(),
  body('email').isEmail().not().isEmpty(),
  body('track').isString().not().isEmpty(),
  body('age').isString().not().isEmpty(),
  body('level').isString().not().isEmpty() 
];

// ZuriInternship Intern Application
const zuriInternApplication = async (req, res) => {

 
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

 
    const errors = validationResult(req.body);

    const err = errors.array();
    const myarray = [];

    err.forEach((er) => {

      const errMessage = `${er.msg} in ${er.param}`;
      myarray.push(errMessage);

    });

    if (myarray.length > 0) {
      console.log('ERROR->',myarray);
      return responseHandler(res, 'An error occured in your inputs', 422, false, myarray);
    }

    const checkIntern = await ZuriIntern.findOne({ email });
    

    if (checkIntern) {
      return responseHandler(res, 'Record already exist', 401, false);
    }

    const intern = new ZuriIntern({
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
      subject: 'Welcome to Zuri Internship',
      message: await message()
    };
    
    const sentEmail = await sendEmail(option);


    if(!sendEmail){
      return responseHandler(res, 'Registration successful, error sending confirmation email', 500, false, error.message);
    }

    return responseHandler(res, 'Successfully Registered', 201, true, recordSave);

  } catch (error) {

    console.log(error);
    return responseHandler(res, 'Error', 500, false, error.message);
  
  }
};

const deactivateIntern = async (req, res) => {
  try {
    const { internId } = req.params;
    const intern = await ZuriIntern.findById({ _id: internId });

    if (!intern) {
      return responseHandler(res, 'Intern does not exist!', 401, false);
    }

    await ZuriIntern.findByIdAndDelete(internId, (err) => {
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
  zuriInternValidationRules,
  zuriInternApplication,
  getAllInterns,
  filterInterns,
  deactivateIntern
};
