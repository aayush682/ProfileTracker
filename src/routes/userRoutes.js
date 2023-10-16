const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const multer = require("multer");
const fs = require("fs");


// Set up multer disk storage
// Create a disk storage object for multer
var storage = multer.diskStorage({
    // Set the destination directory for uploaded files
    destination: function (req, file, cb) {
        cb(null, "./public/uploads");
    },
    // Set the filename for uploaded files
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

// Create a multer upload middleware with the storage configuration
var upload = multer({
    storage: storage
}).single("image");

/**
 * POST /add - Add a new user
 */
// Define a route for handling a POST request to "/add"
router.post("/add", upload, async (req, res) => {
    try {
        // Create a new User object with the data from the request body
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        // Save the user object to the database
        await user.save();

        // Set a session message to be displayed on the next request
        req.session.message = {
            type: "success",
            message: "User added successfully",
        };

        // Redirect the user to the home page
        res.redirect("/");
    } catch (err) {
        // If there is an error, return a JSON response with the error message and type
        res.status(400).json({ message: err.message, type: "danger" });
    }
});

/**
 * GET /edit/:id - Render edit user page
 */
router.get('/edit/:id', async (req, res) => {
    try {
        res.render("edit", {
            title: "Edit User",
            navtitle: "Profile System",
            user: await User.findById(req.params.id),
        });
    } catch (error) {
        console.log(error);
    }
})

/**
 * GET /delete/:id - Delete a user
 */
router.get('/delete/:id', async (req, res) => {
    try {
        // Find the user with the specified ID and delete it from the database
        const user = await User.findByIdAndDelete(req.params.id);

        // Delete the user's image file from the ./public/uploads/ directory
        fs.unlinkSync('./public/uploads/' + user.image);

        // Set a success message in the session object to display to the user
        req.session.message = {
            type: "success",
            message: "User deleted successfully",
        };

        // Redirect the user to the home page
        res.redirect("/");
    } catch (err) {
        // If an error occurs, send a JSON response with the error message and a danger type
        res.json({ message: err.message, type: "danger" });
    }
})

/**
 * POST /update/:id - Update a user
 */
// Define a route for updating a user with a specific ID
router.post('/update/:id', upload, async (req, res) => {
    // Extract the ID from the request parameters
    let id = req.params.id;

    // Initialize a variable to store the new image file name
    let new_image = '';

    // Check if a file was uploaded
    if (req.file) {
        // If a file was uploaded, assign its filename to the new_image variable
        new_image = req.file.filename;


        // Try to delete the old image file from the './public/uploads/' directory
        try {
            // Check if req.body.old_image exists and has a value before performing the deletion
            if (req.body.old_image) {
                fs.unlinkSync('./public/uploads/' + req.body.old_image);
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        // If no file was uploaded, assign the value of the old_image field to the new_image variable
        new_image = req.body.old_image;
    }

    try {
        // Update the user with the provided ID using the new values from the request body
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        // Set a success message in the session to be displayed after the update
        req.session.message = {
            type: "success",
            message: "User updated successfully",
        };

        // Redirect the user to the home page
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});
/**
 * GET / - Render homepage with all users
 */
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.render("index", {
            title: "All Users",
            navtitle: "Profile System",
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

/**
 * GET /add - Render add user page
 */
router.get('/add', (req, res) => {
    res.render("addUser", {
        title: "Add Users",
        navtitle: "Profile System",
    });
})

module.exports = router;