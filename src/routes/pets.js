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
    .get((req, res) => {
        const userId = req.query.userId;  
        if (!userId) {
            return res.status(400).json({ message: "Brak identyfikatora użytkownika" });
        }
        petsController.getAllPets(req, res);  
    })
    .post(petsController.createNewPet);

// Endpoint do operacji na zwierzętach według ID
router.route('/:id')
    .get(petsController.getPetDetails)  
    .delete(petsController.removePet);

// Endpoint do zarządzania dostępem do zwierząt
router.route('/:id/access')
    .post(petsController.sharePetAccess)
    .delete(petsController.removePetAccess);

// Endpoint do zarządzania avatarami zwierząt
router.route('/:id/avatar')
    .post(verifyPetOwnership, uploadHandler(AVATAR_TYPES.PET).single('image'), handleNewPetAvatar);

// Endpoint do pobierania nazw avatarów zwierząt
router.route('/avatars')
    .get(petsController.getAllAnimalAvatars); 

module.exports = router;
