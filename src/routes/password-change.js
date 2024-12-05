const express = require('express');
const { resetPassLoged } = require('../controllers/passwordResetController'); // Poprawny import
const router = express.Router();

// Dla zalogowanego usera
router.post(`/`, resetPassLoged);

module.exports = router;
