import { User } from '../models/User.js';

/**
 * Normalize skill input into structured objects { name, level, description }
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
 * @desc    Get all public users with search & filters
 * @route   GET /api/users
 * @route   GET /api/users/public
 * @access  Public
 */
export const getPublicUsers = async (req, res, next) => {
  try {
    const { skill, offeredSkill, wantedSkill, search, location, availability } = req.query;

    let query = {
      isPublic: true,
      isBanned: false
    };

    // Filter by skill offered
    const skillToFilter = offeredSkill || skill;
    if (skillToFilter) {
      query['skillsOffered.name'] = { $regex: skillToFilter.trim(), $options: 'i' };
    }

    // Filter by skill wanted
    if (wantedSkill) {
      query['skillsWanted.name'] = { $regex: wantedSkill.trim(), $options: 'i' };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Filter by availability
    if (availability) {
      query.availability = { $regex: availability.trim(), $options: 'i' };
    }

    // General search across name, bio, skills offered, skills wanted, location
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { bio: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { 'skillsOffered.name': { $regex: term, $options: 'i' } },
        { 'skillsWanted.name': { $regex: term, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      location,
      profilePhoto,
      avatar,
      skillsOffered,
      skillsWanted,
      availability,
      isPublic
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (location !== undefined) updates.location = location.trim();
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto.trim();
    if (avatar !== undefined) updates.profilePhoto = avatar.trim();
    if (availability !== undefined) updates.availability = availability.trim();
    if (isPublic !== undefined) updates.isPublic = Boolean(isPublic);

    if (skillsOffered !== undefined) {
      updates.skillsOffered = normalizeSkills(skillsOffered);
    }

    if (skillsWanted !== undefined) {
      updates.skillsWanted = normalizeSkills(skillsWanted);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
