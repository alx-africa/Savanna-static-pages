const express = require('express');
const { listJobs } = require('../controllers/jobs.controller');

const router = express.Router();
router.get('/:id/jobs', listJobs);

module.exports = router;
