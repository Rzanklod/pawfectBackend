const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AVATARS_DIR } = require('../../config');

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const avatarsPath = path.join(__dirname, '..', '..', AVATARS_DIR);
        if(!fs.existsSync(avatarsPath)){
            fs.mkdirSync(avatarsPath, { recursive: true });
        }
        cb(null, avatarsPath)
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${req.user}${path.extname(file.originalname).toLowerCase()}`;
        cb(null, fileName);
    }
});

const uploadHandler = multer({
    storage: avatarStorage,
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

module.exports = uploadHandler;