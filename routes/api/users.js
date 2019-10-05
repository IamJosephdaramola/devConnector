const express = require('express');
const router = express.Router();

/**
 * @Route   GET api/users
 * @Desc    Test route
 * @Access  Public
 */
router.get('/', (req, res) => {
	res.send('hey user!');
});

module.exports = router;
