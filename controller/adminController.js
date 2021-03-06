/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
/* eslint-disable no-console */
const { isEmpty, isEmail } = require('validator');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { JWTKey } = require('../config');
const { responseHandler } = require('../utils/responseHandler');
const { passwordHash } = require('../utils/password-hash');
const sendEmail = require('../utils/email/send-email');
const config = require('../config.js');

const adminValidator = () => [
  body('firstName').isString().not().isEmpty(),
  body('lastName').isString().not().isEmpty(),
  body('email').isEmail().not().isEmpty(),
  body('role').isString().not().isEmpty(),
  body('category').isString().not().isEmpty()
];

// Admin Login
const login = (req, res) => {
  const { email, password } = req.body;
  if (isEmpty(email) || isEmpty(password)) {
    responseHandler(res, 'unauthorized access', 401);
  }
  if (!isEmail(email)) {
    responseHandler(res, 'Please enter a valid email');
  }
  Admin.findOne({ email }).then((admin) => {
    if (!admin) {
      responseHandler(res, 'Email does not exist in our record');
      return;
    }
    bcrypt.compare(password, admin.password).then(
      (valid) => {
        if (!valid) {
          responseHandler(res, 'Please enter a valid password');
        }
        const token = jwt.sign(
          { adminId: admin._id },
          JWTKey,
          { expiresIn: '24h' }
        );
        const { name, role, category } = admin;
        responseHandler(res, 'token gen and successful login', 200, true, {
          name,
          email,
          role,
          category,
          authorization: { token }
        });
      }
    ).catch(
      (err) => {
        res.status(501).json({
          error: err
        });
      }
    );
  }).catch((err) => {
    res.status(500).json({
      error: err
    });
  });
};

const logout = (req, res) => {
  responseHandler(res, 'No Logout');
};

const addAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors.array();
      const message = `${err[0].msg} in ${err[0].param}`;
      return responseHandler(res, message, 400);
    }

    const {
      firstName, lastName, email, password, role, category
    } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return responseHandler(res, 'Admin with that email already exist', 401, false);
    }

    const hashedPassword = await passwordHash(password);
    const newAdmin = new Admin({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role,
      category
    });

    const adminAdded = await newAdmin.save();
    if (!adminAdded) {
      return responseHandler(res, 'Unable to create Admin', 401, false);
    }
    const data = {
      name: adminAdded.name,
      email: adminAdded.email,
      role: adminAdded.role,
      category: adminAdded.category,
      _id: adminAdded._id
    };

    // send admin login details
    const link = `${config.ZuriUrl}/login`;
    const details = {
      email,
      subject: 'ZURI Admin Account Details',
      message: `<h5>Login Credentials<h5>
                <p>Email: ${email}<p>
                <p>Password: ${password}<p>
                Click <a href=${link}>here</a> to login`
    };
    try {
      await sendEmail(details);
      return responseHandler(res, 'Admin created successfully', 200, true, data);
    } catch (err) {
      return responseHandler(res, err.message, 500, false);
    }
  } catch (error) {
    return responseHandler(res, error.message, 500, false);
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await Admin.findById({ _id: adminId });

    if (!admin) {
      return responseHandler(res, 'Admin does not exist!', 401, false);
    }

    Admin.findByIdAndDelete(adminId, (err) => {
      if (err) {
        return responseHandler(res, err.message, 400, false);
      }
      return responseHandler(res, 'Admin deleted successfully', 200, true);
    });
  } catch (error) {
    return responseHandler(res, error.message, 500, false);
  }
};

const getAllTrainingAdmin = async (req, res) => {
  try {
    const admins = await Admin.find({ category: 'startng' }).select('-password');
    if (!admins) {
      return responseHandler(res, 'Data unavailable!!', 401, false);
    }

    return responseHandler(res, 'Successfully retrieved all training admins', 200, true, admins);
  } catch (error) {
    return responseHandler(res, 'Something went wrong, could not retrieve admin', 500, false);
  }
};

const getAllInternAdmin = async (req, res) => {
  try {
    const admins = await Admin.find({ category: 'hngi' }).select('-password');
    if (!admins) {
      return responseHandler(res, 'Data unavailable!!', 401, false);
    }

    return responseHandler(res, 'Successfully retrieved all internship admins', 200, true, admins);
  } catch (error) {
    return responseHandler(res, 'Something went wrong, could not retrieve admin', 500, false);
  }
};

const getAdmin = async (req, res) => {
  try {
    const _id = req.params.id;
    const admin = await Admin.find({ _id }).select('-password');

    if (!admin) {
      return responseHandler(res, 'Data unavailable!!', 401, false);
    }
    return responseHandler(res, 'Admin successfully retrieved', 200, true, admin);
  } catch (error) {
    return responseHandler(res, 'Something went wrong, could not retrieve admin', 500, false);
  }
};

module.exports = {
  login,
  logout,
  addAdmin,
  deleteAdmin,
  getAdmin,
  getAllTrainingAdmin,
  getAllInternAdmin,
  adminValidator
};
