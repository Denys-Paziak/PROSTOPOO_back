const mysql = require('mysql');
const dbConfig = require('../config/dbConfig');

exports.getReviews = (req, res) => {
    const connection = mysql.createConnection(dbConfig);

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to database: ' + err.stack);
            res.status(500).send('Database connection error');
            return;
        }

        const sqlQuery = 'SELECT * FROM reviews';
        connection.query(sqlQuery, (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                res.status(500).send('Server error');
            } else {
                res.json(results);
            }
            connection.end();
        });
    });
};

exports.getReview = (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { id } = req.params;

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to database: ' + err.stack);
            return res.status(500).send('Database connection error');
        }

        const sqlQuery = 'SELECT * FROM reviews WHERE id = ?';
        connection.query(sqlQuery, [id], (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).send('Server error');
            }
            if (results.length === 0) {
                return res.status(404).send('No entry found with the given ID');
            }
            res.json(results[0]);
            connection.end();
        });
    });
};

exports.createReview = (req, res) => {
    const connection = mysql.createConnection(dbConfig);

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to database: ' + err.stack);
            res.status(500).send('Database connection error');
            return;
        }

        const { stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en } = req.body;

        console.log('Received data:', req.body);

        const sqlQuery = `
            INSERT INTO reviews (stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(sqlQuery, [stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en], (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                res.status(500).send('Server error');
            } else {
                res.status(201).send({ id: results.insertId, stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en });
            }
            connection.end();
        });
    });
};

exports.updateReview = (req, res) => {
    const connection = mysql.createConnection(dbConfig);
    const { id } = req.params;
    const { stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en } = req.body;

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to database: ' + err.stack);
            res.status(500).send('Database connection error');
            return;
        }

        console.log('Received data for update:', req.body);

        const sqlQuery = `
            UPDATE reviews 
            SET stars = ?, name_ua = ?, name_en = ?, description_ua = ?, description_en = ?, pluses_ua = ?, pluses_en = ?, minuses_ua = ?, minuses_en = ?
            WHERE id = ?
        `;

        connection.query(sqlQuery, [stars, name_ua, name_en, description_ua, description_en, pluses_ua, pluses_en, minuses_ua, minuses_en, id], (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                res.status(500).send('Server error');
            } else if (results.affectedRows === 0) {
                res.status(404).send('No entry found with the given ID');
            } else {
                res.status(200).send(`Entry with ID ${id} updated successfully`);
            }
            connection.end();
        });
    });
};

exports.deleteReview = (req, res) => {
    const connection = mysql.createConnection(dbConfig);

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to database: ' + err.stack);
            res.status(500).send('Database connection error');
            return;
        }

        const { id } = req.params;
        const sqlQuery = 'DELETE FROM reviews WHERE id = ?';
        connection.query(sqlQuery, [id], (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                res.status(500).send('Server error');
            } else if (results.affectedRows === 0) {
                res.status(404).send('No entry found with the given ID');
            } else {
                res.status(200).send(`Entry with ID ${id} deleted successfully`);
            }
            connection.end();
        });
    });
};
