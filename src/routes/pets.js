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

// Endpoint do operacji na zwierzętach według ID
router.route('/:id')
    .get(petsController.getPetDetails)  
    .delete(petsController.removePet)
    .patch(verifyPetOwnership, petsController.editPet); 

// Endpoint do zarządzania dostępem do zwierząt
router.route('/:id/access')
    .post(petsController.sharePetAccess);
    
router.route('/:id/access/:uid')
    .delete(petsController.removePetAccess);

// Endpoint do zarządzania avatarami zwierząt
router.route('/:id/avatar')
    .post(verifyPetOwnership, uploadHandler(AVATAR_TYPES.PET).single('image'), handleNewPetAvatar);

// Endpoint do pobierania nazw avatarów zwierząt
router.route('/avatars')
    .get(petsController.getAllAnimalAvatars); 

// Endpoint do zarządzania wizytami
router.route('/:id/visits')
    .post(verifyPetOwnership, petsController.addVisit);
    
router.route('/visits/:id')
    .delete(petsController.removeVisit);

router.route('/:id/products')
    .post(verifyPetOwnership, petsController.addDietProduct);

router.route('/products/:id')
    .delete(petsController.removeDietProduct);

module.exports = router;