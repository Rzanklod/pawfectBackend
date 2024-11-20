const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController'); 
const uploadHandler = require('../middleware/uploads');
const verifyJWT = require('../middleware/verifyJWT');
const { verifyPetOwnership } = require('../middleware/verifyCredentials');
const { handleNewPetAvatar } = require('../controllers/uploadsController');
const { AVATAR_TYPES } = require('../constants/constants');

router.use(verifyJWT);

router.route('/')
    .get(petsController.getAllPets) 
    .post(petsController.createNewPet); 
    
router.route('/:id')
    // .get()
    .delete(petsController.removePet) 
    // .put();
    
router.route('/:id/access')
    .post(petsController.sharePetAccess)
    .delete(petsController.removePetAccess)
    // .get();

router.route('/:id/avatar')
    .post(verifyPetOwnership, uploadHandler(AVATAR_TYPES.PET).single('image'), handleNewPetAvatar);

module.exports = router;