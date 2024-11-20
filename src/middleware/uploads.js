const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AVATARS_USERS_DIR, AVATARS_PETS_DIR } = require('../../config');
const { AVATAR_TYPES } = require('../constants/constants');


function createRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++){
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const avatarStorage = (avatarType) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            let dest;
            switch(avatarType){
                case AVATAR_TYPES.PET:
                    dest = AVATARS_PETS_DIR;
                    break;

                case AVATAR_TYPES.USER:
                    dest = AVATARS_USERS_DIR;
                    break;
                
                default:
                    throw new Error('Invalid avatar type');
            }
            const avatarsPath = path.join(__dirname, '..', '..', dest);
            if(!fs.existsSync(avatarsPath)){
                fs.mkdirSync(avatarsPath, { recursive: true })
            }
            cb(null, avatarsPath)
        },
        filename: (req, file, cb) => {
            const fileName = `${Date.now()}-${createRandomString(8)}${path.extname(file.originalname).toLowerCase()}`;
            cb(null, fileName);
        }
    });
} 

const uploadHandler = (avatarType) => {
    return multer({
        storage: avatarStorage(avatarType),
        limits: {
            fileSize: 8 * 1024 * 1024 // Limit 8MB na zdjecie
        },
        fileFilter: (req, file, cb) => {
            const allowedFileTypes = /jpeg|png|jpg/;
            const extensionName = allowedFileTypes.test(
                path.extname(file.originalname).toLowerCase()
            );
            const mimeType = allowedFileTypes.test(file.mimetype);
    
            if(extensionName && mimeType){
                cb(null, true);
            } else {
                cb(new Error('Only images are allowed (jpg, jpeg, png).'));
            }
        }
    });
}

module.exports = uploadHandler;