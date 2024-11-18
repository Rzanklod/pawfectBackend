const express = require('express');
const router = express.Router();
const { verifyUserCode } = require('../controllers/verifyController');

router.post('/', verifyUserCode);

module.exports = router;
