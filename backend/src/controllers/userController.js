import { User } from '../models/User.js';

export const getPublicUsers = async (req, res, next) => {
  try {
    const { skill, search } = req.query;
    let query = { isPublic: true, isBanned: false };

    if (skill) {
      query['skillsOffered.name'] = { $regex: skill, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { 'skillsOffered.name': { $regex: search, $options: 'i' } },
        { 'skillsWanted.name': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'name',
      'bio',
      'avatar',
      'skillsOffered',
      'skillsWanted',
      'availability',
      'isPublic'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

