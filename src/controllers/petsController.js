const sql = require('./db');

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
                user_id,
                pet_id,
                acces_level,
                gender,
                date_of_birth,
                description,
                photo_path,
                name
            FROM users
            JOIN users_pets ON users.id = users_pets.user_id
            JOIN pets on users_pets.pet_id = pets.id
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
        // narazie bez obrazka potem sie ogarnie
        if(!gender || !dateOfBirth || !description || !name){
            return res.status(400).json({ message: 'gender, dateOfBirth, description and name are required' });
        }
        if(gender !== 'F' || gender !== 'M') return res.status(400).json({ message: `Invalid gender. '${gender}' != 'F' || 'M'` });

        const [user] = await sql`
            SELECT id FROM users WHERE username = ${req?.user}
        `;
        
        if(!user) return res.sendStatus(400);
    
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
                user_id, pet_id, acces_level
            )
            VALUES(
                ${user.id}, ${newPet.id}, 0
            )
            RETURNING *
        `;
    } catch {
        return res.sendStatus(500);
    }
}

module.exports = {
    getAllPets,
    createNewPet,

}