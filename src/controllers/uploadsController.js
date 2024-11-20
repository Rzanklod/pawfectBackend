const sql = require('./db');
const fs = require('fs');
const path = require('path');
const { AVATARS_USERS_DIR, AVATARS_PETS_DIR } = require('../../config');


const handleNewUserAvatar = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({ message: 'No file was sent.' });
        }

        const id = req.params?.id;

        const avatarsPath = path.join(__dirname, '..', '..', AVATARS_USERS_DIR);
        const fileName = req.file.filename;
        console.log(fileName)

        const username = req.user;
        const [result] = await sql`
            SELECT avatar_filename FROM users WHERE username = ${username} AND id = ${id}
        `;

        const oldAvatarName = result.avatar_filename;
        if(oldAvatarName != null){
            const oldAvatarPath = path.join(avatarsPath, oldAvatarName)
            await fs.unlink(oldAvatarPath, (err) => {});
        }
        
        await sql`
            UPDATE users
            SET avatar_filename = ${fileName}
            WHERE username = ${username}
        `;
    
        res.status(201).json({
            message: 'Avatar succesfully changed.',
            fileName: fileName
        });
    } catch {
        res.status(500);
    }
}

const handleNewPetAvatar = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({ message: 'No file was sent.' });
        }

        const id = req.params?.id;
        if(!id) return res.status(400).json({ message: 'Pet ID is required.' });

        const avatarsPath = path.join(__dirname, '..', '..', AVATARS_PETS_DIR);
        const fileName = req.file.filename;
        console.log(fileName)

        const username = req.user;
        const [result] = await sql`
            SELECT p.avatar_filename FROM 
            users u JOIN users_pets up ON u.id = up.user_id JOIN pets p ON p.id = up.pet_id  
            WHERE u.username = ${username} AND up.pet_id = ${id} 
        `;

        const oldAvatarName = result.avatar_filename;
        if(oldAvatarName != null){
            const oldAvatarPath = path.join(avatarsPath, oldAvatarName)
            await fs.unlink(oldAvatarPath, (err) => {});
        }
        
        await sql`
            UPDATE pets
            SET avatar_filename = ${fileName}
            WHERE id = ${id}
        `;
    
        res.status(201).json({
            message: 'Avatar succesfully changed.',
            fileName: fileName
        });
    } catch {
        res.status(500);
    }
}

module.exports = { 
    handleNewUserAvatar,
    handleNewPetAvatar 
};