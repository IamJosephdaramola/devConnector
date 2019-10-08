const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

/**
 * @Route   POST api/posts
 * @Desc    Create a post
 * @Access  Private
 */
router.post(
	'/',
	[
		auth,
		[
			check('text', 'Text is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id
			});

			const post = await newPost.save();
			res.json(post);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

/**
 * @Route   GET api/posts
 * @Desc    Get all posts
 * @Access  Private
 */

router.get('/', auth, async (req, res) => {
	try {
		// Sort by date...the most recent first
		const posts = await Post.find().sort({ date: -1 });
		res.json(posts);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   GET api/posts/:id
 * @Desc    Get post by ID
 * @Access  Private
 */

router.get('/:id', auth, async (req, res) => {
	try {
		// Sort by date...the most recent first
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.json(post);
	} catch (err) {
		console.error(err.message);

		if (err.kind == 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   DELETE api/posts/:id
 * @Desc    Delete a post
 * @Access  Private
 */

router.delete('/:id', auth, async (req, res) => {
	try {
		// Sort by date...the most recent first
		const post = await Post.findById(req.params.id);

		// Check if post exist
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// Check user
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		await post.remove();

		res.json({ msg: 'post removed' });
	} catch (err) {
		console.error(err.message);
		if (err.kind == 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   PUT api/posts/like/:id
 * @Desc   Like a post
 * @Access  Private
 */

router.put('/like/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// Check if post has already been liked by this user
		if (
			post.likes.filter(like => like.user.toString() === req.user.id).length > 0
		) {
			return res.status(400).json({ msg: 'Post already liked' });
		}
		post.likes.unshift({ user: req.user.id });

		await post.save();

		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   PUT api/posts/unlike/:id
 * @Desc   Unlike a post
 * @Access  Private
 */

router.put('/unlike/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// Check if post has already been liked by this user
		if (
			post.likes.filter(like => like.user.toString() === req.user.id).length === 0
		) {
			return res.status(400).json({ msg: 'Post has not yet been liked' });
		}

		// Get the remove index
		const removeIndex = post.likes
			.map(like => like.user.toString())
			.indexOf(req.user.id);

		post.likes.splice(removeIndex, 1);

		await post.save();

		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @Route   POST api/posts.comment/:id
 * @Desc    Comment on a post
 * @Access  Private
 */

router.post(
	'/comment/:id',
	[
		auth,
		[
			check('text', 'Text is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			// Get the logged in user
			const user = await User.findById(req.user.id).select('-password');
			// Get the post
			const post = await Post.findById(req.params.id);

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id
			};
			post.comments.unshift(newComment);

			await post.save();
			res.json(post.comments);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

/**
 * @Route   DELETE api/posts/comment/:id/:comment_id
 * @Desc    Delete comment
 * @Access  Private
 */

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		// Get the post
		const post = await Post.findById(req.params.id);

		// Pull out comment from the post
		const comment = post.comments.find(
			comment => comment.id === req.params.comment_id
		);

		// Make sure comment exists
		if (!comment) {
			return res.status(404).json({ msg: 'Comment does not exist' });
		}

		// Check user
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		// Get the remove index
		const removeIndex = post.comments
			.map(comment => comment.user.toString())
			.indexOf(req.user.id);

		post.comments.splice(removeIndex, 1);

		await post.save();

		res.json(post.comments);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
