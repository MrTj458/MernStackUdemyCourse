const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const User = require('../../models/User')
const passport = require('passport')

// Input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// @route GET api/users/test
// @desc Tests users route
// @access Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }))

// @route POST api/users/register
// @desc Register User
// @access Public
router.post('/register', async (req, res) => {
	// Check validation
	const { errors, isValid } = validateRegisterInput(req.body)
	if (!isValid) {
		return res.status(400).json(errors)
	}

	// Check is user already exists
	if (await User.findOne({ email: req.body.email })) {
		errors.email = 'Email already exists'
		return res.status(400).json(errors)
	}

	// Find gravatar
	const avatar = gravatar.url(req.body.email, {
		s: '200', // Size
		r: 'pg', // Rating
		d: 'mm', // Default
	})

	// Create new user
	const newUser = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		avatar: avatar,
	})

	// Hash Password
	const salt = await bcrypt.genSalt(10)
	const hash = await bcrypt.hash(newUser.password, salt)
	newUser.password = hash

	// Save user and send it back
	res.json(await newUser.save())
})

// @route POST /api/users/login
// @desc Login user / Returning JWT
// @access public
router.post('/login', async (req, res) => {
	// Check validation
	const { errors, isValid } = validateLoginInput(req.body)
	if (!isValid) {
		res.status(400).json(errors)
	}

	const email = req.body.email
	const password = req.body.password

	const user = await User.findOne({ email })
	// Check is user exists
	if (!user) {
		errors.email = 'User not found'
		return res.json(errors)
	}

	// Check if password is correct
	if (!(await bcrypt.compare(password, user.password))) {
		errors.password = 'Password Incorrect'
		return res.status(400).json(errors)
	}

	// Set JWT payload
	const payload = {
		id: user.id,
		name: user.name,
		avatar: user.avatar,
	}

	// Sign JWT
	const token = await jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 })

	// Send back JWT
	res.json({
		success: true,
		token: 'Bearer ' + token,
	})
})

// @route GET /api/users/current
// @desc Return current user
// @access private
router.get(
	'/current',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		res.json({
			id: req.user.id,
			name: req.user.name,
			email: req.user.email,
			avatar: req.user.avatar,
		})
	}
)

module.exports = router
