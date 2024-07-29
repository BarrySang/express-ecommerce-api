require('dotenv').config();
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to database');
    seedData();
});

async function seedData() {
    try {
        await seedUsers();
        await seedProducts();
        await seedPurchases();
        console.log('Seed data inserted successfully');
    } catch (err) {
        console.error('Error inserting seed data:', err);
    } finally {
        db.end();
    }
}

async function seedUsers() {
    const users = [
        { username: 'user1', email: 'user1@example.com', password: await bcrypt.hash('password1', 10) },
        { username: 'user2', email: 'user2@example.com', password: await bcrypt.hash('password2', 10) }
    ];

    for (const user of users) {
        await new Promise((resolve, reject) => {
            db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [user.username, user.email, user.password], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
    console.log('Users seeded');
}

function seedProducts() {
    const products = [
        { name: 'Product 1', image_path: '/uploads/products/product1.jpg', price: 10.99 },
        { name: 'Product 2', image_path: '/uploads/products/product2.jpg', price: 20.99 },
        { name: 'Product 3', image_path: '/uploads/products/product3.jpg', price: 15.99 },
        { name: 'Product 4', image_path: '/uploads/products/product4.jpg', price: 25.99 },
        { name: 'Product 5', image_path: '/uploads/products/product5.jpg', price: 30.99 },
        { name: 'Product 6', image_path: '/uploads/products/product6.jpg', price: 12.99 },
        { name: 'Product 7', image_path: '/uploads/products/product7.jpg', price: 22.99 },
        { name: 'Product 8', image_path: '/uploads/products/product8.jpg', price: 18.99 },
        { name: 'Product 9', image_path: '/uploads/products/product9.jpg', price: 28.99 },
        { name: 'Product 10', image_path: '/uploads/products/product10.jpg', price: 32.99 },
        { name: 'Product 11', image_path: '/uploads/products/product11.jpg', price: 24.99 },
        { name: 'Product 12', image_path: '/uploads/products/product12.jpg', price: 14.99 },
        { name: 'Product 13', image_path: '/uploads/products/product13.jpg', price: 26.99 },
        { name: 'Product 14', image_path: '/uploads/products/product14.jpg', price: 35.99 },
        { name: 'Product 15', image_path: '/uploads/products/product15.jpg', price: 19.99 },
        { name: 'Product 16', image_path: '/uploads/products/product16.jpg', price: 29.99 },
        { name: 'Product 17', image_path: '/uploads/products/product17.jpg', price: 33.99 },
        { name: 'Product 18', image_path: '/uploads/products/product18.jpg', price: 21.99 },
        { name: 'Product 19', image_path: '/uploads/products/product19.jpg', price: 27.99 },
        { name: 'Product 20', image_path: '/uploads/products/product20.jpg', price: 31.99 }
    ];
    

    return new Promise((resolve, reject) => {
        products.forEach((product, index) => {
            db.query('INSERT INTO products (name, image_path, price) VALUES (?, ?, ?)', [product.name, product.image_path, product.price], (err) => {
                if (err) return reject(err);
                if (index === products.length - 1) resolve();
            });
        });
    }).then(() => console.log('Products seeded'));
}

function seedPurchases() {
    const purchases = [
        { userId: 1, productId: 1 },
        { userId: 2, productId: 2 }
    ];

    return new Promise((resolve, reject) => {
        purchases.forEach((purchase, index) => {
            db.query('INSERT INTO purchases (userId, productId) VALUES (?, ?)', [purchase.userId, purchase.productId], (err) => {
                if (err) return reject(err);
                if (index === purchases.length - 1) resolve();
            });
        });
    }).then(() => console.log('Purchases seeded'));
}
