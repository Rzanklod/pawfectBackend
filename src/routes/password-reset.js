const express = require('express');
const { handlePasswordResetRequest, resetPassword } = require('../controllers/passwordResetController'); // Poprawny import
const router = express.Router();

// Obsługuje żądanie resetowania hasła
router.post('/', handlePasswordResetRequest);

// Obsługuje resetowanie hasła
router.post('/confirm', resetPassword);

module.exports = router;
