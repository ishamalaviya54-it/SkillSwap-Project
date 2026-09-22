import { User } from '../models/User.js';
import { SwapRequest } from '../models/SwapRequest.js';
import { Feedback } from '../models/Feedback.js';
import { Announcement } from '../models/Announcement.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalSwaps = await SwapRequest.countDocuments();
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'pending' });
    const acceptedSwaps = await SwapRequest.countDocuments({ status: 'accepted' });
    const completedSwaps = await SwapRequest.countDocuments({ status: 'completed' });
    const cancelledSwaps = await SwapRequest.countDocuments({ status: 'cancelled' });
    const totalFeedback = await Feedback.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        bannedUsers,
        totalSwaps,
        pendingSwaps,
        acceptedSwaps,
        completedSwaps,
        cancelledSwaps,
        totalFeedback
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const moderateSkillDescription = async (req, res, next) => {
  try {
    const { userId, skillType, skillName, newDescription } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const list = skillType === 'offered' ? user.skillsOffered : user.skillsWanted;
    const target = list.find((s) => s.name.toLowerCase() === skillName.toLowerCase());

    if (!target) {
      return res.status(404).json({ success: false, message: 'Skill entry not found' });
    }

    target.description = newDescription || '[Content moderated by Admin]';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill description moderated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSwapsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const swaps = await SwapRequest.find(query)
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: swaps.length,
      data: swaps
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'info',
      author: req.user._id
    });

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

export const generateReport = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments();
    const swapsCount = await SwapRequest.countDocuments();
    const feedbackCount = await Feedback.countDocuments();

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        usersCount,
        swapsCount,
        feedbackCount
      },
      status: 'Ready for export'
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

