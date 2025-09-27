const express = require('express');
const { validateSignupData } = require('../utils/validation');
const bcrypt = require('bcrypt');
const User = require('../models/user');



const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    //validation of data
    try {
        validateSignupData(req);
        const { firstName, lastName, email, password,photoUrl,skills,interestedIn,age, gender, about} = req.body;
        //encryption of password
        const passwordHash = await bcrypt.hash(password, 10);
        //creating a new instance of user model

        const user = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
            age,
            photoUrl,
            skills,
            gender,
            about,
            interestedIn
        });

        await user.save();
        res.send("User signed up");
    } catch (error) {
        console.error(error);
        res.status(400).send("Error signing up user: " + error.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("Invalid Credentials!");
        }

        // Validate password
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        const isPasswordValid = await user.validatePassword(password);

        if (isPasswordValid) {
            // CREATE A JWT TOKEN AND SEND IT TO THE USER
            // const token = await jwt.sign({ userId: user._id }, "Nill@crushme09", { expiresIn: '1d' });
            const token = await user.getJWT();
            //ADD THE TOKEN To COOKIE and send the response to the user
            res.cookie("token", token,
                { expires: new Date(Date.now() + 24 * 3600000), httpOnly: true }
            );
            res.send(user);
        } else {
            throw new Error("Invalid Credentials!");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

authRouter.post("/logout", (req, res) => {
    try {
        res.clearCookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
        });
        res.send("User logged out successfully");
    } catch (error) {
        res.status(500).send("Error logging out: " + error.message);
    }
});




module.exports = authRouter;