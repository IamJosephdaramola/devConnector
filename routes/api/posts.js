const express = require('express');
const router = express.Router();

/**
 * @Route   GET api/post
 * @Desc    Test route
 * @Access  Private
 */
router.get('/', (req, res) => {
	res.send('Post route!');
});

module.exports = router;
