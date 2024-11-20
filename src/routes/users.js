const express = require('express');
const router = express.Router();
const uploadHandler = require('../middleware/uploads');
const verifyJWT = require('../middleware/verifyJWT');
const { verifyUser } = require('../middleware/verifyCredentials');
const { handleNewUser } = require('../controllers/registerController'); 
const { handleNewUserAvatar } = require('../controllers/uploadsController');
const { AVATAR_TYPES } = require('../constants/constants');

router.route('/')
    .post(handleNewUser)

router.use(verifyJWT);

router.route('/:id/avatar')
    .post(verifyUser, uploadHandler(AVATAR_TYPES.USER).single('image'), handleNewUserAvatar);

module.exports = router;