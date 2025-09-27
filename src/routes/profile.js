// server/routes/profile.js
const express = require('express');
const { userAuth } = require('../middleware/auth');
const { validateEditProfileData } = require('../utils/validation');
const bcrypt = require('bcrypt');

const profileRouter = express.Router();

profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    return res.json(req.user);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

function applyUserUpdates(user, body) {
  const allowed = ['firstName', 'lastName', 'age', 'gender', 'about', 'skills', 'photoUrl', 'interestedIn'];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      user[key] = body[key];
    }
  }
}

async function editHandler(req, res) {
  try {
    if (!validateEditProfileData(req.body)) {
      return res.status(400).json({ message: 'Invalid data' });
    }
    const user = req.user;
    applyUserUpdates(user, req.body);
    await user.save();
    return res.json({ message: `${user.firstName}, Profile updated successfully`, user });
  } catch (error) {
    console.error('Error editing profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error editing profile', error: error.message });
  }
}

// Only PUT now
profileRouter.put('/profile/edit', userAuth, editHandler);

profileRouter.put('/profile/password', userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    const user = req.user;
    const ok = await user.validatePassword(currentPassword);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Error updating password', error: error.message });
  }
});

module.exports = profileRouter;