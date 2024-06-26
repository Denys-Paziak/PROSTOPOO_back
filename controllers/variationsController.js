const mysql = require('mysql');
const dbConfig = require('../config/dbConfig');
const bucket = require('../config/firebaseConfig');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const os = require('os');
const fs = require('fs');


async function uploadImageToFirebase(file) {
    const tempFilePath = path.join(os.tmpdir(), file.originalname);
    fs.writeFileSync(tempFilePath, file.buffer);

    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    await bucket.upload(tempFilePath, {
        destination: `variations/${uniqueFilename}`,
        metadata: {
            contentType: file.mimetype,
        },
    });

    fs.unlinkSync(tempFilePath);

    const fileRef = bucket.file(`variations/${uniqueFilename}`);
    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/variations/${uniqueFilename}`;
    return url;
}


exports.getVariations = (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { productId } = req.params;

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to database: ' + err.stack);
            return res.status(500).send('Database connection error');
        }

        const sqlQuery = 'SELECT * FROM productVariations WHERE product_id = ?';
        connection.query(sqlQuery, [productId], (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).send('Server error');
            }


            results.forEach(product => {
                if (product.image_url) {
                    let urls = product.image_url;
                    product.image_url = JSON.parse(urls);
                } else {
                    product.image_url = "[]";
                }
            });

            res.json(results);
            connection.end();
        });
    });
};


exports.createVariation = async (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { productId } = req.params;
    const { variation_type, variation_value, additional_price, article, description_en, description_ua } = req.body;

    let imageUrl = null;  // Ініціалізуємо як null
    if (req.file) {
        try {
            const uploadedImageUrl = await uploadImageToFirebase(req.file);
            imageUrl = JSON.stringify([uploadedImageUrl]);  // Зберігаємо URL як масив
        } catch (err) {
            console.error('Error uploading image:', err);
            return res.status(500).send('Error uploading image');
        }
    }

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to database: ' + err.stack);
            return res.status(500).send('Database connection error');
        }

        const sqlQuery = 'INSERT INTO productVariations (product_id, variation_type, variation_value, additional_price, image_url, article, description_en, description_ua) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(sqlQuery, [productId, variation_type, variation_value, additional_price, imageUrl, article, description_en, description_ua], (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).send('Server error');
            }
            res.status(201).json({ message: 'Варіацію успішно створено', variationId: results.insertId });
            connection.end();
        });
    });
};




exports.updateVariation = async (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { id } = req.params;
    const { variation_type, variation_value, additional_price, article, description_en, description_ua } = req.body;

    let imageUrl = null;
    if (req.file) {
        try {
            const uploadedImageUrl = await uploadImageToFirebase(req.file);
            imageUrl = JSON.stringify([uploadedImageUrl]);  // Зберігаємо URL як масив
        } catch (err) {
            console.error('Error uploading image:', err);
            return res.status(500).send('Error uploading image');
        }
    }

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to database: ' + err.stack);
            return res.status(500).send('Database connection error');
        }

        const sqlQuery = 'UPDATE productVariations SET variation_type = ?, variation_value = ?, additional_price = ?, image_url = IFNULL(?, image_url), article = ?, description_en = ?, description_ua = ? WHERE id = ?';
        connection.query(sqlQuery, [variation_type, variation_value, additional_price, imageUrl, article, description_en, description_ua, id], (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).send('Server error');
            }
            res.json({ message: 'Варіацію успішно оновлено' });
            connection.end();
        });
    });
};

exports.deleteVariation = (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { id } = req.params;

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to database: ' + err.stack);
            return res.status(500).send('Database connection error');
        }

        const sqlQuery = 'DELETE FROM productVariations WHERE id = ?';
        connection.query(sqlQuery, [id], (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).send('Server error');
            }
            res.json({ message: 'Варіацію успішно видалено' });
            connection.end();
        });
    });
};
