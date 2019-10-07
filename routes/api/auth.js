const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

/**
 * @Route   GET api/auth
 * @Desc    Test route
 * @Access  Private
 */
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   POST api/auth
 * @Desc    Authenticate user & get token(Login Route)
 * @Access  Public
 */

router.post(
	'/',
	[
		check('email', 'Please enter a valid email').isEmail(),
		check('password', 'Password is required').exists()
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			// See if user exists
			let user = await User.findOne({ email });
			if (!user) {
				return res
				.status(400)
				.json({ errors: [{ msg: 'Invalid Credentials' }] });
			}
			// Compare password
			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res
				.status(400)
				.json({ errors: [{ msg: 'Invalid Credentials' }] });
			}

			const payload = {
				user: {
					id: user.id
				}
			};

			jwt.sign(
				payload,
				config.get('jwtToken'),
				// optional but HIGHLY recommended
				{ expiresIn: 3600000 },
				(err, token) => {
					if (err) throw err;
					// if not
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
