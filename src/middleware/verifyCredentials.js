const sql = require('../controllers/db');
const { PET_ACCESS_LEVEL } = require('../constants/constants');

const verifyUser = async (req, res, next) => {
    try{
        const id = req.params?.id;
        if(!id || id == 'undefined' || !Number.isInteger(Number.parseInt(id))) return res.status(400).json({ message: 'Invalid user id' });
        
        const [foundUser] = await sql`
            SELECT id, username FROM users WHERE id = ${id}
        `;
    
        if(!foundUser){
            return res.status(400).json({ message: 'Invalid user ID.' });
        }
    
        if(foundUser.username != req.user){
            return res.status(403).json({ message: 'You can only change your avatar' });
        }
    
        next();
    } catch {
        return res.sendStatus(500);
    }
}

const verifyPetOwnership = async (req, res, next) => {
    try{
        const id = req.params?.id;
        if(!id || id == 'undefined' || !Number.isInteger(Number.parseInt(id))) return res.status(400).json({ message: 'Invalid pet id' });
        
        const foundPet = await sql`
            SELECT up.pet_id, up.user_id, u.username, up.access_level FROM 
            users u JOIN users_pets up ON u.id = up.user_id JOIN pets p ON p.id = up.pet_id  
            WHERE u.username = ${req.user} AND up.pet_id = ${id} 
        `;
        
        if(!foundPet){
            return res.status(400).json({ message: 'Pet with specified id doesnt exist or you dont have acces to that pet' });
        }
        
        const petStatus = foundPet.filter((f) => f.username === req.user);

        if(!petStatus){
            return res.status(401).json({ message: 'You cant acces that pet' });
        }

        if(petStatus[0].access_level == PET_ACCESS_LEVEL.READ){
            return res.status(401).json({ message: 'You dont have permission to modify pets data' });
        }
    
        next();
    } catch {
        return res.sendStatus(500);
    }
}

module.exports = { 
    verifyUser,
    verifyPetOwnership
};