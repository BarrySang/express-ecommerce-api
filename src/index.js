require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./config/db');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

const corsOptions = {
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('image');

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

app.post('/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err) => {
            if (err) return res.status(500).send(err);
            res.send('User added');
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/users', (req, res) => {
    db.query('SELECT * FROM users WHERE deleted = FALSE', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/users/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ? AND deleted = FALSE', [id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results[0] && req.user && results[0].username === req.user.username) return res.json(results[0]);
        return res.json('user not found');
    });
});

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?', [username, email, hashedPassword, id], (err) => {
            if (err) return res.status(500).send(err);
            res.send('User updated');
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE users SET deleted = TRUE WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('User deleted');
    });
});

app.post('/products', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }

        const { name, price } = req.body;
        const imagePath = req.file ? `uploads/${req.file.filename}` : null;

        db.query('INSERT INTO products (name, image_path, price) VALUES (?, ?, ?)', [name, imagePath, price], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send(err);
            }
            res.send('Product added');
        });
    });
});

app.get('/products', (req, res) => {
    db.query('SELECT * FROM products WHERE deleted = FALSE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

app.get('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM products WHERE id = ? AND deleted = FALSE', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json(results[0]);
    });
});

app.put('/products/:id', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }

        const { id } = req.params;
        const { name, price } = req.body;
        const imagePath = req.file ? `uploads/${req.file.filename}` : null;

        db.query('UPDATE products SET name = ?, image_path = ?, price = ? WHERE id = ?', [name, imagePath, price, id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send(err);
            }
            res.send('Product updated');
        });
    });
});

app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE products SET deleted = TRUE WHERE id = ?', [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.send('Product deleted');
    });
});

app.post('/purchases', (req, res) => {
    const { userId, productId } = req.body;
    db.query('INSERT INTO purchases (userId, productId) VALUES (?, ?)', [userId, productId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.send('Purchase added');
    });
});

app.get('/purchases', (req, res) => {
    db.query('SELECT * FROM purchases WHERE deleted = FALSE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

app.get('/purchases/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM purchases WHERE id = ? AND deleted = FALSE', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json(results[0]);
    });
});

app.put('/purchases/:id', (req, res) => {
    const { id } = req.params;
    const { userId, productId } = req.body;
    db.query('UPDATE purchases SET userId = ?, productId = ? WHERE id = ?', [userId, productId, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.send('Purchase updated');
    });
});

app.delete('/purchases/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE purchases SET deleted = TRUE WHERE id = ?', [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.send('Purchase deleted');
    });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).send(err);

            if (results.length === 0) {
                return res.status(400).send('User not found');
            }

            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(400).send('Wrong password');
            }

            const username = user.username;
            const authUser = { username: username };

            const accessToken = jwt.sign(authUser, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });

            return res.json({ message: 'Login successful', accessToken });
        });
    } catch (err) {
        return res.status(500).send(err);
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
