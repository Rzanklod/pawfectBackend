const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController'); 
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.route('/')
    .get(petsController.getAllPets) // zwraca liste zwierzakow. Narazie dla konkretnego id uzytkownika z querki
    .post(petsController.createNewPet); // dodawanie nowego
    
    router.route('/:id')
    .get()
    .delete() // usuwanie
    .put();  // update zwierzaka

module.exports = router;