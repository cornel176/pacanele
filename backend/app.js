const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const gamesRoutes = require('./routes/games');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/games', gamesRoutes);

// Ruta de bază
app.get('/', (req, res) => {
    res.json({ message: 'Gambling Site API' });
});

// Gestionare erori
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});