const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profile.controller');

const router = express.Router();
router.get('/:id', getProfile);
router.patch('/:id', updateProfile);

module.exports = router;
