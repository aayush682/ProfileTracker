// Imports Modules
require("dotenv").config();
require("./db/connection");
const express = require('express');
const path = require('path');
const session = require('express-session');
const PORT = process.env.PORT || 8000;

// Imports Routes
const userRoutes = require('./routes/userRoutes');

// App
const app = express();

// Set view engine
app.set('view engine', 'ejs');



// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

//Set public folder
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static("./public/uploads"));

// Use Routes
app.use(userRoutes);

// Set views
const viewsPath = path.join(__dirname, '../views/pages');
app.set('views', viewsPath);

// Set partials
const partialsPath = path.join(__dirname, '../views/layouts');
app.set('view options', { partials: partialsPath });


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});