const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const request = require('request');
const db = require("./models");
const mongoose = require('mongoose');
// const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Import user credentials for React front end
const credentials = require('fs').existsSync(path.join(__dirname, 'credentials.js'))
    ? require('./credentials')
    : console.log('No credentials.js file present');

// Cors allows all urls 
const corsOptions = {
    origin: "*"
};
app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(bodyParser.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

// Connect to MongoDB database
db.mongoose.connect(db.cloudUrl, { useUnifiedTopology: true })
    .then(() => {
        // Get list of collection names when connected successfully
        db.mongoose.connection.db.listCollections().toArray((err, collections) => {
            if (err) {
                console.error("Error fetching collection names:", err);
                return;
            }
            // Create an array containing names of collections
            const collectionNames = collections.map(collection => collection.name);
            console.log("Collections:", collectionNames);

            // Set up route to display collection names
            app.get("/zz", (req, res) => {
                res.json({ message: "Welcome to Revit MongoDB Server", collections: collectionNames });
            });
        });
    })
    .catch(err => {
        console.log("Cannot connect to the database!", err);
        process.exit();
    });

// Register door model
require("./models/doorModel");
// Import door routes 
require("./routes/doorRoutes")(app);

// Get access token for React front end
app.get('/token', (req, res) => {
    request.post(
        credentials.Authentication,
        { form: credentials.credentials },
        (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res.json(JSON.parse(body));
            }
        }
    );
});


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});

// Route to serve the HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to get documents from selected collection
app.get("/collections/:name", async (req, res) => {
    const collectionName = req.params.name;
    try {
        const collection = db.mongoose.connection.db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        res.json(documents);
    } catch (err) {
        res.status(500).send(err);
    }
});


//
const db2 = mongoose.createConnection('mongodb+srv://ngophuc2911:phuc29112003@cluster0.buhheri.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/dangNhapCauPha', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

db2.on('connected', () => {
    console.log("Connected to DB2");
});

db2.on('error', (err) => {
    console.error('Cannot connect to DB2:', err);
});

// Register User schema with db2 connection
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const UserModel = mongoose.model('User', UserSchema);

// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
});

// Protected route
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is protected data', userId: req.user.userId });
});

// Route to serve the HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});