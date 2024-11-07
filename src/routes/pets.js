const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController'); 
const verifyJWT = require('../middleware/verifyJWT');

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
module.exports = router;