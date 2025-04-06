const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || '27017';

// Connect to MongoDB
mongoose.connect(`mongodb://${mongoHost}:${mongoPort}/email-app`)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Create a Mongoose model
const Email = mongoose.model('Email', {
    email: String,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/add-email', async (req, res) => {
    const { email } = req.body;
    try {
        const newEmail = new Email({ email });
        await newEmail.save();
        res.json({ message: 'Email added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding email' });
    }
});

app.get('/emails', async (req, res) => {
    try {
        const emails = await Email.find({});
        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching emails' });
    }
});

// Add this DELETE endpoint
app.delete('/delete-email/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid email ID format' });
        }

        const deletedEmail = await Email.findByIdAndDelete(id);

        if (!deletedEmail) {
            return res.status(404).json({ error: 'Email not found' });
        }

        res.json({ message: 'Email deleted successfully' });
    } catch (error) {
        console.error('Error deleting email:', error);
        res.status(500).json({ error: 'Error deleting email' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});