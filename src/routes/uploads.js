const express = require('express');
const router = express.Router();
const uploadHandler = require('../middleware/uploads');
const verifyJWT = require('../middleware/verifyJWT');
const { handleNewAvatar } = require('../controllers/uploadsController');

router.use(verifyJWT);

router.route('/avatars')
    .post(uploadHandler.single('avatar'), handleNewAvatar);

module.exports = router;