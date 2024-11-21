const sql = require('./db');
const { PET_ACCESS_LEVEL } = require('../constants/constants');

const getPetOwner = async(petId) => {
    const [user] = await sql`
        SELECT username, user_id
        FROM users
        JOIN users_pets ON users_pets.user_id = users.id
        JOIN pets ON users_pets.pet_id = pets.id
        WHERE access_level = 0 AND pet_id = ${petId}
    `;
    return user;
}

const getAllPets = async (req, res) => {
    try{
        const userid = req?.query?.userid;
        if(!userid) return res.sendStatus(400);

        const [user] = await sql`
            SELECT id FROM users WHERE username = ${req?.user}
        `;

        if(!user) return res.sendStatus(400)
        if(user.id != userid) return res.sendStatus(401);
    
        const userPets = await sql`
            SELECT
                up.user_id,
                up.pet_id,
                up.access_level,
                p.gender,
                p.date_of_birth,
                p.description,
                p.avatar_filename,
                p.name
            FROM users u
            JOIN users_pets up ON u.id = up.user_id
            JOIN pets p on up.pet_id = p.id
            WHERE up.user_id = ${userid}
        `;
    
        return res.json(userPets);
    } catch {
        return res.sendStatus(500);
    }
}

const createNewPet = async (req, res) => {
    try{
        const gender = req.body?.gender;
        const dateOfBirth = req.body?.dateOfBirth;
        const description = req.body?.description;
        const name = req.body?.name;
        
        if(!gender || !dateOfBirth || !description || !name){
            return res.status(400).json({ message: 'gender, dateOfBirth, description and name are required' });
        }

        if(gender !== 'F' && gender !== 'M'){
            return res.status(400).json({ message: `Invalid gender. '${gender}' != 'F' || 'M'` });
        }
        
        const [user] = await sql`
            SELECT id FROM users WHERE username = ${req?.user}
        `;

        if(!user) return res.sendStatus(400);
        const [newPet, userPetRelation] = await sql.begin(async sql => {
            const [newPet] = await sql`
                INSERT INTO pets(
                    gender, date_of_birth, description, name
                )
                VALUES(
                    ${gender}, TO_DATE(${dateOfBirth}, 'DD-MM-YYYY'), ${description}, ${name}
                )
                RETURNING *
            `;
    
            const [userPetRelation] = await sql`
                INSERT INTO users_pets(
                    user_id, pet_id, access_level
                )
                VALUES(
                    ${user.id}, ${newPet.id}, 0
                )
                RETURNING *
            `;
            return [newPet, userPetRelation];
        });
        return res.status(201).json({ newPet });
    } catch {
        return res.sendStatus(500);
    }
}

const removePet = async (req, res) => {
    try{
        const id = req.params?.id;
        if(!id) return res.status(400).json({ message: 'Pet ID is required' });

        const user = await getPetOwner(id);
        
        if(!user) return res.sendStatus(404);

        if(user.username != req.user){
            return res.status(403).json({ message: 'You dont have acces to that pet' });
        }
        
        await sql.begin(async sql => {
            await sql`
                DELETE FROM users_pets WHERE pet_id = ${id}
            `;
    
            await sql`
                DELETE FROM pets WHERE id = ${id}
            `;
        })

        return res.sendStatus(204);
    } catch {
        return res.sendStatus(500);
    }
}

const sharePetAccess = async (req, res) => {
    try{
        const id = req.params?.id;
        if(!id) return res.status(400).json({ message: 'Pet ID is required' });

        const useridToAdd = Number.parseInt(req.body?.userid, 10);
        if(!useridToAdd) 
            return res.status(400).json({ message: 'You need to specify a userid to share pet with' });

        if(![await sql`SELECT id FROM users WHERE id = ${useridToAdd}`])
            return res.status(404).json({ message: 'You cant share pet with user that doesnt exist' });

        const accessLevel = Number.parseInt(req.body?.accessLevel, 10);
        if(!accessLevel) 
            return res.status(400).json({ message: 'Access level is required.' });
        if(accessLevel != PET_ACCESS_LEVEL.READ_WRITE && accessLevel != PET_ACCESS_LEVEL.READ)
            return res.status(400).json({ message: 'Invalid access level' });
        
        const user = await getPetOwner(id);
        
        if(!user) return res.sendStatus(404);
        
        if(user.username != req.user){
            return res.status(403).json({ message: 'You dont have acces to that pet' });
        }

        const [accessExists] = await sql`
            SELECT user_id FROM users_pets WHERE pet_id = ${id} AND user_id = ${useridToAdd}
        `;

        if(accessExists)
            return res.status(409).json({ message: 'User already has acces to that pet' });

        const [addedUser] = await sql`
            INSERT INTO users_pets(
                user_id, pet_id, access_level
            )
            VALUES (
                ${useridToAdd}, ${id}, ${accessLevel}
            )
            RETURNING user_id, pet_id, access_level
        `;
        
        return res.status(201).json({ ...addedUser });
    } catch {
        return res.sendStatus(500);
    }
}

const removePetAccess = async (req, res) => {
    try{
        const id = req.params?.id;
        if(!id) return res.status(400).json({ message: 'Pet ID is required' });
        
        const useridToRemove = Number.parseInt(req.body?.userid, 10);
        if(!useridToRemove) 
            return res.status(400).json({ message: 'You need to specify a userid' });

        const user = await getPetOwner(id);
        
        if(!user) return res.sendStatus(404);

        if(user.username != req.user){
            return res.status(403).json({ message: 'You dont have acces to that pet' });
        }

        if(user.user_id == useridToRemove)
            return res.status(403).json({ message: 'You cant remove acces to your own pet' });

        await sql`
            DELETE FROM users_pets
            WHERE user_id = ${useridToRemove} AND pet_id = ${id}
        `;
    
        return res.sendStatus(204);
    } catch {
        return res.sendStatus(500);
    }
}

module.exports = {
    getAllPets,
    createNewPet,
    removePet,
    sharePetAccess,
    removePetAccess
}