const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ensure you run 'npm install bcryptjs jsonwebtoken' in your backend directory

const JWT_SECRET = process.env.JWT_SECRET; 

// --- User Registration (Signup) ---
exports.register = async (req, res) => {
    const { name, email, password, city, state } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ name, email, password, city, state });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Generate JWT (Token)
        const payload = { user: { id: user._id, name: user.name } };
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                // ✅ Include userId for frontend updates
                res.status(201).json({ 
                    token, 
                    userId: user._id, 
                    userName: user.name, 
                    userEmail: user.email, 
                    message: "Registration successful" 
                });
            }
        );

    } catch (err) {
        console.error("Registration error:", err.message);
        res.status(500).send('Server Error during registration');
    }
};


// --- User Login ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials (User not found)' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials (Wrong password)' });
        }

        // Generate JWT on successful login
        const payload = { user: { id: user.id, name: user.name } };
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ 
                    token, 
                     userId: user._id, 
                    userName: user.name,
                    userEmail: user.email,
                    message: "Login successful"
                });
            }
        );

    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).send('Server Error during login');
    }
};
