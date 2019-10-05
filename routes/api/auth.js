const express = require('express');
const router = express.Router();

/**
 * @Route   GET api/auth
 * @Desc    Test route
 * @Access  Private
 */
router.get('/', (req, res) => {
	res.send('Auth route!');
});

module.exports = router;
