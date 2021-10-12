const express = require('express');

const {
  createIntern,
  internApplicationValidationRules,
  getAllInterns,
  deactivateIntern
} = require('../controller/zuriTraining-internController');

const {
  createApplication, declineApplication, acceptApplication, allApplication, mentorTraningValidator,
  getSingleMentorApplication, deactivateMentor
} = require('../controller/zuriTraining-mentorController');

const {
  findByNameIntern,
  filterInternTrainingData,
  findByNameMentor,
  filterMentorTrainingData,
  getZuriTrainingCSV,
  filterInternTrainingDataCSV,
  getZuriMentorCSV,
  filterMentorTrainingDataCSV
} = require('../controller/zuriTraniningController');

const router = express.Router();
// Admin routes
router.post('/zuri/training/application', internApplicationValidationRules(), createIntern);

// mentor routes
router.post('/mentor/apply', mentorTraningValidator(), createApplication);
router.patch('/mentor/:id/decline', declineApplication);
router.patch('/mentor/:id/accept', acceptApplication);
router.get('/mentor/applications', allApplication);
router.get('/mentor/applications/:id', getSingleMentorApplication);
router.get('/mentor/:firstName', findByNameMentor);
router.get('/mentor/filter/:filterBy', filterMentorTrainingData);
router.delete('/mentor/delete/:mentorId', deactivateMentor);

// mentor csv routes
router.get('/mentor/all/csv', getZuriMentorCSV);
router.get('/mentor/filter/csv/:filterBy', filterMentorTrainingDataCSV);

// Intern routes
router.get('/intern/all', getAllInterns);
router.get('/intern/:firstName', findByNameIntern);
router.get('/intern/filter/:filterBy', filterInternTrainingData);
router.delete('/intern/delete/:internId', deactivateIntern);

// intern csv route
router.get('/intern/all/csv', getZuriTrainingCSV);
router.get('/intern/filter/csv/:filterBy', filterInternTrainingDataCSV);

module.exports = router;
