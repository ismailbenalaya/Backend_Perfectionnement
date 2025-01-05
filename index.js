const express = require('express');
const bodyParser = require('body-parser'); // Fix typo here
const cors = require('cors');
const sql = require('mysql');

const app = express();
app.use(cors());

// Database connection
const db = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '124578cvbn',
    database: 'machine',
    port: 3306
});

// Check database connection
db.connect(err => {
    if (err) {
        console.log(err);
    } else {
        console.log("Database connected successfully!");
    }
});

app.use(bodyParser.json()); // Corrected the middleware usage

app.listen(3600, () => {
    console.log("Server is running on port 3600");
});

app.get('/getusers', (req, res) => {
    const query = "SELECT * FROM users"; // Moved query string inside the query function
    db.query(query, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: 'Error retrieving data' });
        } else {
            res.send({
                message: 'All user data',
                data: results
            });
        }
    });
});


app.get('/getS/:name', (req, res) => {
    let ID = req.params.full_name;

    const query = 'SELECT * FROM users WHERE full_name = ?';
    db.query(query, [ID], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            res.send({
                message: 'Get single data',
                data: results
            });
        } else {
            return res.status(404).send('No Data Found');
        }
    });
});

app.post('/addUser', (req, res) => {
  const { id, full_name, email, password, mobile_number } = req.body;

  // Check if all required fields are provided
  if (!id || !full_name || !email || !password || !mobile_number) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Validate id format (8 numbers)
  if (!/^\d{8}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format. ID should be 8 numbers.' });
  }

  // Check if the user already exists in the database based on the provided ID
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error querying the database: ', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'User already exists with this ID.' });
    }

    // Insert the new user into the database
    const newUser = { id, full_name, email, password, mobile_number };
    db.query('INSERT INTO users SET ?', newUser, (err, result) => {
      if (err) {
        console.error('Error inserting user into the database: ', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.status(201).json({ message: 'User added successfully.' });
    });
  });
});


// Define the POST route
app.post('/addContact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // MySQL query to insert the new contact into the 'contact' table
  const insertQuery = `INSERT INTO contact (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`;
  const values = [name, email, phone, subject, message];

  db.query(insertQuery, values, (err, results) => {
    if (err) {
      console.error('Error inserting contact:', err);
      return res.status(500).json({ message: 'An error occurred while adding the contact.' });
    }

    // Return a success response
    res.status(201).json({ message: 'Contact added successfully!' });
  });
});


// ... (existing code)

app.put('/updateuser/:id', (req, res) => {
  const userId = req.params.id;
  const { full_name, email, password, mobile_number } = req.body;

  // Ensure that all required fields are provided in the request body
  if (!full_name || !email || !password || !mobile_number) {
      res.status(400).send({ message: 'Name, password, mobile_number, and email are required fields' });
      return;
  }

  const updateUserQuery = "UPDATE users SET full_name=?, email=?, password=?, mobile_number=? WHERE id=?";
  const values = [full_name, email, password, mobile_number, userId];

  db.query(updateUserQuery, values, (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({ message: 'Error updating user data' });
      } else if (result.affectedRows === 0) {
          res.status(404).send({ message: 'User not found' });
      } else {
          res.send({ message: 'User data updated successfully' });
      }
  });
});


// API endpoint for user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Check if the email exists in the database
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying the database: ', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Email not found.' });
    }

    const user = results[0];

    // Check if the provided password matches the stored password
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // Check if the login is for admin
    if (email === 'admin@gmail.com' && password === 'adminadmin') {
      return res.status(200).json({ message: 'Admin login successful.', user });
    }

    // Password is correct, regular user login is successful
    return res.status(200).json({ message: 'Login successful.', user });
  });
});


// API endpoint for deleting a user by ID
app.delete('/deleteUser/:id', (req, res) => {
  const userID = req.params.id;

  // Validate the ID format (8 numbers)
  if (!/^\d{8}$/.test(userID)) {
    return res.status(400).json({ error: 'Invalid ID format. ID should be 8 numbers.' });
  }

  // Check if the user exists in the database
  db.query('SELECT * FROM users WHERE id = ?', [userID], (err, results) => {
    if (err) {
      console.error('Error querying the database: ', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // User exists, proceed with the deletion
    db.query('DELETE FROM users WHERE id = ?', [userID], (err, result) => {
      if (err) {
        console.error('Error deleting user from the database: ', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      return res.status(200).json({ message: 'User deleted successfully.' });
    });
  });
});

app.get('/getcontact', (req, res) => {
  const query = "SELECT * FROM contact"; // Moved query string inside the query function
  db.query(query, (err, results) => {
      if (err) {
          console.log(err);
          res.status(500).send({ message: 'Error retrieving data' });
      } else {
          res.send({
              message: 'All contact data',
              data: results
          });
      }
  });
});

app.get('/api/products', (req, res) => {
  const query = `SELECT * FROM products`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).send('Error fetching products');
    } else {
      res.status(200).json(results);
    }
  });
});

// index.js
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const query = `DELETE FROM products WHERE id = ?`;
  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error('Database delete error:', err);
      res.status(500).send('Error deleting product');
    } else {
      res.status(200).send('Product deleted successfully');
    }
  });
});


// index.js
app.put('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const { productName, price, firstName, lastName, email } = req.body;
  const query = `UPDATE products SET productName = ?, price = ?, firstName = ?, lastName = ?, email = ? WHERE id = ?`;
  db.query(query, [productName, price, firstName, lastName, email, productId], (err, result) => {
    if (err) {
      console.error('Database update error:', err);
      res.status(500).send('Error updating product');
    } else {
      res.status(200).send('Product updated successfully');
    }
  });
});



app.post('/api/add-to-cart', (req, res) => {
  const { productId, firstName, lastName, email, productName, price } = req.body;
  const query = 'INSERT INTO products (id, productName, price, firstName, lastName, email) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [productId, productName, price, firstName, lastName, email], (err, result) => {
    if (err) {
      console.error('Database insert error:', err);
      res.status(500).send('Error adding product to cart');
    } else {
      res.status(200).send('Product added to cart successfully');
    }
  });
});

app.get('/api/products-admin', (req, res) => {
  const query = `SELECT * FROM product_admin`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).send('Error fetching products');
    } else {
      res.status(200).json(results);
    }
  });
});

// index.js
app.post('/api/products-admin', (req, res) => {
  const { productName, price, firstName, lastName, email } = req.body;
  const query = `INSERT INTO product_admin (productName, price, firstName, lastName, email) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [productName, price, firstName, lastName, email], (err, result) => {
    if (err) {
      console.error('Database insert error:', err);
      res.status(500).send('Error adding product to product-admin');
    } else {
      res.status(200).send('Product added to product-admin successfully');
    }
  });
});



