import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Generate JSON Web Token
 */
export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'skillswap_super_secret_jwt_key_2026_dev',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Validate email address format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
};

/**
 * Normalize skill input into structured objects
 */
const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, level: 'Intermediate', description: '' }));
  }
  if (Array.isArray(skills)) {
    return skills
      .map((s) => {
        if (typeof s === 'string') {
          const trimmed = s.trim();
          return trimmed ? { name: trimmed, level: 'Intermediate', description: '' } : null;
        }
        if (s && typeof s === 'object' && s.name) {
          return {
            name: String(s.name).trim(),
            level: s.level ? String(s.level).trim() : 'Intermediate',
            description: s.description ? String(s.description).trim() : ''
          };
        }
        return null;
      })
      .filter(Boolean);
  }
  return [];
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      location,
      availability,
      skillsOffered,
      skillsWanted,
      isPublic
    } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      location: typeof location === 'string' ? location.trim() : '',
      availability: typeof availability === 'string' && availability.trim() ? availability.trim() : 'Flexible',
      skillsOffered: normalizeSkills(skillsOffered),
      skillsWanted: normalizeSkills(skillsWanted),
      isPublic: typeof isPublic === 'boolean' ? isPublic : true
    });

    const token = generateToken(newUser._id);

    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      location: newUser.location,
      availability: newUser.availability,
      skillsOffered: newUser.skillsOffered,
      skillsWanted: newUser.skillsWanted,
      isPublic: newUser.isPublic,
      bio: newUser.bio,
      profilePhoto: newUser.profilePhoto,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      token
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Find user with password included for verification
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact administrator.'
      });
    }

    const token = generateToken(user._id);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      availability: user.availability,
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted,
      isPublic: user.isPublic,
      bio: user.bio,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Requires Bearer token)
 */
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};
