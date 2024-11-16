const sql = require('./db');
const fs = require('fs');
const path = require('path');
const { AVATARS_DIR } = require('../../config');

const avatarsPath = path.join(__dirname, '..', '..', AVATARS_DIR);

const handleNewAvatar = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({ message: 'No file was sent.' });
        }
        const fileName = req.file.filename;
        console.log(fileName)

        const username = req.user;
        const [result] = await sql`
            SELECT avatar_filename FROM users WHERE username = ${username}
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

const sendUserAvatar = async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(avatarsPath, filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if(err){
            return res.status(404).json({ message: 'File not found.' });
        }
        res.sendFile(filePath);
    });
}

module.exports = { handleNewAvatar, sendUserAvatar };