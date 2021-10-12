require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');

const adminRouter = require('./routes/adminRoutes');
const zuriInternshipRouter = require('./routes/zuriInternshipRoutes');
const contactRouter = require('./routes/contactRoutes');
const zuriTrainingRouter = require('./routes/zuriTrainingRoutes');
const { handleError } = require('./utils/error');
const internRouter = require('./routes/internRoutes');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/cvDir', express.static(path.join(__dirname, 'cvDir')));

app.use('/api/v1', adminRouter);
app.use('/api/v1/internship', zuriInternshipRouter);
app.use('/api/v1/training', zuriTrainingRouter);
app.use('/api/v1', contactRouter);
app.use('/api/v1', internRouter);

// Express error middleware
app.use((err, req, res, next) => next(handleError(res, err)));

// Unknown endpoints middleware
app.use('*', (req, res) => {
  const url = req.originalUrl;
  res.status(404).send({
    status: 'error',
    message: `Oops. ${req.method} ${url} not found on this website`
  });
});

module.exports = app;
