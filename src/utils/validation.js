// server/utils/validation.js
const validator = require('validator');

const GENDERS = ['Male', 'Female', 'Other'];
const INTERESTED_IN = ['Male', 'Female', 'Other', 'All'];

const validateSignupData = (req) => {
  const { firstName, lastName, email, password, interestedIn } = req.body || {};

  if (!firstName || !lastName) {
    throw new Error('Name is not valid');
  }
  if (
    firstName.length < 3 || firstName.length > 50 ||
    lastName.length < 3 || lastName.length > 50
  ) {
    throw new Error('Name must be between 3 to 50 characters');
  }
  if (!validator.isEmail(email || '')) {
    throw new Error('Email is not valid');
  }
  if (!validator.isStrongPassword(password || '')) {
    throw new Error('Password is not strong enough');
  }
  if (!interestedIn || !INTERESTED_IN.includes(interestedIn)) {
    throw new Error('Please select a valid interestedIn');
  }
  return true;
};

const validateEditProfileData = (body = {}) => {
  const ALLOWED_UPDATES = ['firstName', 'lastName', 'gender', 'age', 'photoUrl', 'about', 'skills', 'interestedIn'];

  const ok = Object.keys(body).every((k) => ALLOWED_UPDATES.includes(k));
  if (!ok) return false;

  if (body.age !== undefined && body.age !== null) {
    const n = Number(body.age);
    if (Number.isNaN(n) || n < 18) return false;
  }
  if (body.gender && !GENDERS.includes(body.gender)) return false;
  if (body.interestedIn && !INTERESTED_IN.includes(body.interestedIn)) return false;
  if (body.skills && !Array.isArray(body.skills)) return false;
  if (body.photoUrl && !validator.isURL(body.photoUrl, { require_protocol: true })) return false;
  if (body.firstName !== undefined && String(body.firstName).trim() === '') return false;
  if (body.lastName !== undefined && String(body.lastName).trim() === '') return false;

  return true;
};

const validatePassword = (req) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    throw new Error('Current and new passwords are required');
  }
  if (!validator.isStrongPassword(newPassword)) {
    throw new Error('New password is not strong enough');
  }
  return true;
};

module.exports = { validateSignupData, validateEditProfileData, validatePassword };