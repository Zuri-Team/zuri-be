const express = require('express');

const router = express.Router();
const { enrollIntern, internValidation, getInterns, removeIntern } = require('../controller/internController');

router.post('/training/enrollment', internValidation(), enrollIntern);

router.get('/training/enrollment', getInterns);

router.delete('/training/enrollment/:id', removeIntern);

module.exports = router;
