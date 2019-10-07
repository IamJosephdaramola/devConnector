const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

/**
 * @Route   GET api/profile/me
 * @Desc    Get current users profile
 * @Access  Private
 **/

router.get('/me', auth, async (req, res) => {
	try {
		// populate the user's id with the user's name, avatar, etc.
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			'user',
			['name', 'avatar']
		);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   POST api/profile
 * @Desc    Create or update a user's profile
 * @Access  Private
 **/

router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required')
				.not()
				.isEmpty(),
			check('skills', "Skills' field is required")
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin
		} = req.body;

		// Build profile object
		const profileFields = {};

		// Add all fields into the profile fields
		//Assign the user's id to the profileFields
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;

		// Make the Skills' field an array
		if (skills) {
			profileFields.skills = skills.split(',').map(skill => skill.trim());
		}
		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = await Profile.findOne({ user: req.user.id });
			if (profile) {
				// Update
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.json(profile);
			}

			// Create
			profile = new Profile(profileFields);
			await profile.save();
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}

		res.send('yey');
	}
);

/**
 * @Route   GET api/profile
 * @Desc    Get all profiles
 * @Access  Public
 **/

router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   GET api/profile/user/:user_id
 * @Desc    Get profile by user's ID
 * @Access  Public
 **/

router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.params.user_id }).populate(
			'user',
			['name', 'avatar']
		);

		if (!profile) return res.status(400).json({ msg: 'Profile not found' });

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		// Restructuring the error message for invalid 'ObjectId'
		if (err.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   DELETE api/profile
 * @Desc    DELETE profile user and posts
 * @Access  Private
 **/

router.delete('/', auth, async (req, res) => {
	try {
		//  @todo - remove user's post
		// Remove profile
		await Profile.findOneAndRemove({ user: req.user.id });
		//  Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User Removed' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   PUT api/profile|experience
 * @Desc    Add Profile experience
 * @Access  Private
 **/

router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required')
				.not()
				.isEmpty(),
			check('company', 'Company is required')
				.not()
				.isEmpty(),
			check('from', 'from date is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, company, location, from, to, current, description } = req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		};

		try {
			// fetch the profile you want to add the experience to
			const profile = await Profile.findOne({ user: req.user.id });

			// Push to the experience array
			profile.experience.unshift(newExp);

			await profile.save();

			res.json(profile)
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
