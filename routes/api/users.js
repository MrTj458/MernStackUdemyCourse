const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const User = require('../../models/User')

// @route GET api/users/test
// @desc Tests users route
// @access Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }))

// @route POST api/users/register
// @desc Register User
// @access Public
router.post('/register', async (req, res) => {
	// Check is user already exists
	if (await User.findOne({ email: req.body.email })) {
		return res.status(400).json({ email: 'User already exists' })
	}

	// Find gravatar
	const avatar = gravatar.url(req.body.email, {
		s: '200',
		r: 'pg',
		d: 'mm',
	})

	// Create new user
	const user = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		avatar: avatar,
	})

	// Encrypt user password and send back
	bcrypt.genSalt(10, async (err, hash) => {
		if (err) throw err

		user.password = hash
		const newUser = await user.save()

		res.json(newUser)
	})
})

// @route POST /api/users/login
// @desc Login user / Returning JWT
// @access public
router.post('/login', async (req, res) => {
	const email = req.body.email
	const password = req.body.password

	const user = await User.findOne({ email })
	// Check is user exists
	if (!user) {
		return res.json({ email: 'User not found' })
	}

	// Check if password is correct
	if (!(await bcrypt.compare(password, user.password))) {
		return res.status(400).json({ password: 'Password incorrect' })
	}

	// Set JWT payload
	const payload = {
		id: user.id,
		name: user.name,
		avatar: user.avatar,
	}

	// Sign JWT and send it
	jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
		res.json({
			success: true,
			token: 'Bearer ' + token,
		})
	})
})

module.exports = router
