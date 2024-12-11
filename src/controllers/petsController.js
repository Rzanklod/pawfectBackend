const sql = require('./db');
const { PET_ACCESS_LEVEL } = require('../constants/constants');

// Funkcja do pobierania właściciela zwierzaka
const getPetOwner = async (petId) => {
    const [user] = await sql`
        SELECT username, user_id
        FROM users
        JOIN users_pets ON users_pets.user_id = users.id
        JOIN pets ON users_pets.pet_id = pets.id
        WHERE access_level = 0 AND pet_id = ${petId}
    `;
    return user;
};

// Funkcja do pobierania wszystkich zwierzaków
const getAllPets = async (req, res) => {
    try {
        const userId = req.query.userid;
        if (!userId) {
            return res.status(400).json({ message: 'Brak identyfikatora użytkownika' });
        }

        const userPets = await sql`
            SELECT
                up.pet_id as id,
                up.user_id,
                p.name,
                p.gender,
                p.date_of_birth,
                p.description,
                p.avatar_filename,
                p.feeding, -- Nowa kolumna
                up.access_level
            FROM pets p
            JOIN users_pets up ON p.id = up.pet_id
            WHERE up.user_id = ${userId}
        `;

        return res.json(userPets);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd serwera' });
    }
};

// Funkcja do tworzenia nowego zwierzaka
const createNewPet = async (req, res) => {
    try {
        const gender = req.body?.gender;
        const dateOfBirth = req.body?.dateOfBirth;
        const description = req.body?.description;
        const name = req.body?.name;
        const feeding = req.body?.feeding; // Nowa kolumna

        if (!gender || !dateOfBirth || !description || !name || !feeding) {
            return res.status(400).json({ message: 'gender, dateOfBirth, description, name and feeding are required' });
        }

        if (gender !== 'F' && gender !== 'M') {
            return res.status(400).json({ message: `Invalid gender. '${gender}' != 'F' || 'M'` });
        }

        const [user] = await sql`
            SELECT id FROM users WHERE username = ${req?.user}
        `;

        if (!user) return res.sendStatus(400);

        const [newPet, userPetRelation] = await sql.begin(async (sql) => {
            const [newPet] = await sql`
                INSERT INTO pets(
                    gender, date_of_birth, description, name, feeding
                )
                VALUES(
                    ${gender}, TO_DATE(${dateOfBirth}, 'YYYY-MM-DD'), ${description}, ${name}, ${feeding}
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
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};

// Funkcja do usuwania zwierzaka
const removePet = async (req, res) => {
    try {
        const id = req.params?.id;
        if (!id) return res.status(400).json({ message: 'Pet ID is required' });

        const user = await getPetOwner(id);

        if (!user) return res.sendStatus(404);

        if (user.username != req.user) {
            return res.status(403).json({ message: 'You don\'t have access to that pet' });
        }

        await sql.begin(async (sql) => {
            await sql`
                DELETE FROM users_pets WHERE pet_id = ${id}
            `;

            await sql`
                DELETE FROM pets WHERE id = ${id}
            `;
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};

// Funkcja do dzielenia dostępu do zwierzaka
const sharePetAccess = async (req, res) => {
    try {
        const id = req.params?.id;
        if (!id) return res.status(400).json({ message: 'Pet ID is required' });

        const useridToAdd = Number.parseInt(req.body?.userid, 10);
        if (!useridToAdd) 
            return res.status(400).json({ message: 'You need to specify a userid to share pet with' });

        const [userExists] = await sql`SELECT id FROM users WHERE id = ${useridToAdd}`;
        if (!userExists) return res.status(404).json({ message: 'User does not exist' });

        const accessLevel = Number.parseInt(req.body?.accessLevel, 10);
        if (!accessLevel) 
            return res.status(400).json({ message: 'Access level is required.' });
        if (![PET_ACCESS_LEVEL.READ_WRITE, PET_ACCESS_LEVEL.READ].includes(accessLevel))
            return res.status(400).json({ message: 'Invalid access level' });

        const user = await getPetOwner(id);

        if (!user) return res.sendStatus(404);

        if (user.username != req.user) {
            return res.status(403).json({ message: 'You don\'t have access to that pet' });
        }

        const [accessExists] = await sql`
            SELECT user_id FROM users_pets WHERE pet_id = ${id} AND user_id = ${useridToAdd}
        `;

        if (accessExists) {
            return res.status(409).json({ message: 'User already has access to that pet' });
        }

        const [addedUser] = await sql`
            INSERT INTO users_pets(
                user_id, pet_id, access_level
            )
            VALUES (
                ${useridToAdd}, ${id}, ${accessLevel}
            )
            RETURNING user_id, pet_id, access_level
        `;

        return res.status(201).json(addedUser);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};

// Funkcja do usuwania dostępu do zwierzaka
const removePetAccess = async (req, res) => {
    try {
        const id = req.params?.id;
        if (!id) return res.status(400).json({ message: 'Pet ID is required' });

        const useridToRemove = Number.parseInt(req.body?.userid, 10);
        if (!useridToRemove) 
            return res.status(400).json({ message: 'You need to specify a userid' });

        const user = await getPetOwner(id);

        if (!user) return res.sendStatus(404);

        if (user.username != req.user) {
            return res.status(403).json({ message: 'You don\'t have access to that pet' });
        }

        if (user.user_id == useridToRemove)
            return res.status(403).json({ message: 'You can\'t remove access to your own pet' });

        await sql`
            DELETE FROM users_pets
            WHERE user_id = ${useridToRemove} AND pet_id = ${id}
        `;

        return res.sendStatus(204);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};

// Funkcja do pobierania wszystkich avatarów zwierzaków
const getAllAnimalAvatars = async (req, res) => {
    try {
        const query = "SELECT avatar_filename FROM pets"; 
        const [results] = await sql.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error("Błąd podczas pobierania zdjęć zwierząt:", error);
        res.status(500).json({ message: "Wystąpił błąd podczas pobierania danych." });
    }
};

// Funkcja do pobierania szczegółów zwierzęcia
const getPetDetails = async (req, res) => {
    try {
        const petId = req.params.id;
        if (!petId) return res.status(400).json({ message: 'Pet ID is required' });

        const pet = await sql`
            SELECT
                p.id,
                p.name,
                p.gender,
                p.date_of_birth,
                p.description,
                p.avatar_filename,
                p.feeding -- Nowa kolumna
            FROM pets p
            WHERE p.id = ${petId}
        `;

        if (!pet) return res.status(404).json({ message: 'Pet not found' });

        return res.json(pet[0]);  
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd serwera' });
    }
};

// Funkcja do dodawania wizyt
const addVisit = async (req, res) => {
    const { id } = req.params;
    const { visitDate, visitDescription, visitReason } = req.body;

    if (!visitDate || !visitDescription || !visitReason) {
        return res.status(400).json({ message: "Wszystkie pola muszą być wypełnione." });
    }

    try {
        // Dodanie wizyty do bazy danych
        const result = await db.query(
            'INSERT INTO visits (pet_id, visit_date, description, reason) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, visitDate, visitDescription, visitReason]
        );

        res.status(201).json({ message: 'Wizyta została dodana!', visit: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd podczas dodawania wizyty.' });
    }
};

module.exports = {
    getAllPets,
    createNewPet,
    removePet,
    sharePetAccess,
    removePetAccess,
    getAllAnimalAvatars,
    getPetDetails,
    addVisit
};
