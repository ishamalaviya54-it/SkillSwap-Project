import { User } from '../models/User.js';
import { SwapRequest } from '../models/SwapRequest.js';
import { Rating } from '../models/Rating.js';
import { Feedback } from '../models/Feedback.js';
import { Announcement } from '../models/Announcement.js';
import { Skill } from '../models/Skill.js';
import { Notification } from '../models/Notification.js';

/**
 * @desc    Get comprehensive platform metrics and statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Count skills: from Skill model + distinct user skills
    const skillModelCount = await Skill.countDocuments();
    const usersWithSkills = await User.find({}, 'skillsOffered skillsWanted');
    const uniqueSkillNames = new Set();
    usersWithSkills.forEach((u) => {
      (u.skillsOffered || []).forEach((s) => {
        if (typeof s === 'string') uniqueSkillNames.add(s.toLowerCase());
        else if (s && s.name) uniqueSkillNames.add(s.name.toLowerCase());
      });
      (u.skillsWanted || []).forEach((s) => {
        if (typeof s === 'string') uniqueSkillNames.add(s.toLowerCase());
        else if (s && s.name) uniqueSkillNames.add(s.name.toLowerCase());
      });
    });
    const totalSkills = Math.max(skillModelCount, uniqueSkillNames.size);

    // Swap counts
    const totalSwaps = await SwapRequest.countDocuments();
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'pending' });
    const acceptedSwaps = await SwapRequest.countDocuments({ status: 'accepted' });
    const completedSwaps = await SwapRequest.countDocuments({ status: 'completed' });
    const cancelledSwaps = await SwapRequest.countDocuments({ status: 'cancelled' });
    const rejectedSwaps = await SwapRequest.countDocuments({ status: 'rejected' });

    // Average rating
    const ratingDocs = await Rating.find({}, 'rating');
    let averageRating = 5.0;
    if (ratingDocs.length > 0) {
      const sum = ratingDocs.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      averageRating = Number((sum / ratingDocs.length).toFixed(1));
    } else {
      // Check fallback feedback collection if rating collection is empty
      const feedbackDocs = await Feedback.find({}, 'rating');
      if (feedbackDocs.length > 0) {
        const sum = feedbackDocs.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        averageRating = Number((sum / feedbackDocs.length).toFixed(1));
      }
    }

    const totalFeedback = await Rating.countDocuments() || await Feedback.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        bannedUsers,
        adminUsers,
        totalSkills,
        totalSwaps,
        pendingSwaps,
        acceptedSwaps,
        completedSwaps,
        cancelledSwaps,
        rejectedSwaps,
        averageRating,
        totalFeedback,
        totalAnnouncements
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with search, role, and ban status filters
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const { search, role, banned } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (banned !== undefined && banned !== 'all') {
      query.isBanned = banned === 'true' || banned === true;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle or set user ban status
 * @route   PUT /api/admin/users/:id/ban
 * @route   PATCH /api/admin/users/:id/ban
 * @access  Private/Admin
 */
export const toggleBanUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user && req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot ban their own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.body && req.body.isBanned !== undefined) {
      user.isBanned = Boolean(req.body.isBanned);
    } else {
      user.isBanned = !user.isBanned;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.name} has been ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      data: user,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove/delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUserAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user && req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot delete their own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clean up associated records
    await SwapRequest.deleteMany({
      $or: [{ requester: id }, { recipient: id }]
    });
    await Rating.deleteMany({
      $or: [{ fromUser: id }, { toUser: id }]
    });
    await Notification.deleteMany({ recipient: id });
    await Skill.deleteMany({ owner: id });
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `User ${user.name} and related records removed successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all swaps across the platform with filters and search
 * @route   GET /api/admin/swaps
 * @access  Private/Admin
 */
export const getAllSwapsAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    let swaps = await SwapRequest.find(query)
      .populate('requester', 'name email profilePhoto avatar location')
      .populate('recipient', 'name email profilePhoto avatar location')
      .sort({ createdAt: -1 });

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      swaps = swaps.filter((s) => {
        const requesterName = s.requester?.name?.toLowerCase() || '';
        const recipientName = s.recipient?.name?.toLowerCase() || '';
        const offered = typeof s.offeredSkill === 'string' ? s.offeredSkill.toLowerCase() : (s.offeredSkill?.name?.toLowerCase() || '');
        const wanted = typeof s.wantedSkill === 'string' ? s.wantedSkill.toLowerCase() : (s.wantedSkill?.name?.toLowerCase() || '');
        return (
          requesterName.includes(term) ||
          recipientName.includes(term) ||
          offered.includes(term) ||
          wanted.includes(term)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: swaps.length,
      data: swaps,
      swaps
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all skills across the platform for moderation
 * @route   GET /api/admin/skills
 * @access  Private/Admin
 */
export const getAllSkillsAdmin = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const skillsList = [];

    // 1. Fetch skills from Skill collection
    const skillDocs = await Skill.find().populate('owner', 'name email').sort({ createdAt: -1 });
    skillDocs.forEach((doc) => {
      skillsList.push({
        _id: doc._id.toString(),
        name: doc.name,
        category: doc.category || 'General',
        description: doc.description || '',
        owner: doc.owner,
        ownerName: doc.owner?.name || 'Unknown User',
        ownerEmail: doc.owner?.email || '',
        type: 'Skill Document',
        createdAt: doc.createdAt
      });
    });

    // 2. Also harvest inline user skills from User documents so everything is moderatable
    const users = await User.find({}, 'name email skillsOffered skillsWanted createdAt');
    users.forEach((u) => {
      (u.skillsOffered || []).forEach((item, idx) => {
        const name = typeof item === 'string' ? item : item?.name;
        if (name) {
          skillsList.push({
            _id: `user-${u._id}-offered-${idx}`,
            userId: u._id,
            name: name,
            category: 'Offered Skill',
            description: item?.description || '',
            level: item?.level || 'Intermediate',
            owner: { _id: u._id, name: u.name, email: u.email },
            ownerName: u.name,
            ownerEmail: u.email,
            type: 'offered',
            createdAt: u.createdAt
          });
        }
      });

      (u.skillsWanted || []).forEach((item, idx) => {
        const name = typeof item === 'string' ? item : item?.name;
        if (name) {
          skillsList.push({
            _id: `user-${u._id}-wanted-${idx}`,
            userId: u._id,
            name: name,
            category: 'Wanted Skill',
            description: item?.description || '',
            level: item?.level || 'Beginner',
            owner: { _id: u._id, name: u.name, email: u.email },
            ownerName: u.name,
            ownerEmail: u.email,
            type: 'wanted',
            createdAt: u.createdAt
          });
        }
      });
    });

    let filtered = skillsList;
    if (category && category !== 'all') {
      filtered = filtered.filter((s) => s.category.toLowerCase() === category.toLowerCase() || s.type === category);
    }
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.description && s.description.toLowerCase().includes(term)) ||
          s.ownerName.toLowerCase().includes(term)
      );
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
      skills: filtered
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Moderate skill description or content
 * @route   PUT /api/admin/skills/:id/moderate
 * @route   PUT /api/admin/skills/:id
 * @route   PATCH /api/admin/skills/moderate
 * @access  Private/Admin
 */
export const moderateSkillDescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, skillType, skillName, newDescription, description, name, category } = req.body;
    const updatedDesc = newDescription !== undefined ? newDescription : description;

    // Check if id is a Skill document
    if (id && !id.startsWith('user-')) {
      const skillDoc = await Skill.findById(id);
      if (skillDoc) {
        if (updatedDesc !== undefined) skillDoc.description = updatedDesc;
        if (name) skillDoc.name = name;
        if (category) skillDoc.category = category;
        await skillDoc.save();
        return res.status(200).json({
          success: true,
          message: 'Skill moderated successfully',
          data: skillDoc
        });
      }
    }

    // Check if targeting inline user skill
    let targetUserId = userId;
    let targetType = skillType;
    let targetName = skillName;

    if (id && id.startsWith('user-')) {
      const parts = id.split('-');
      targetUserId = parts[1];
      targetType = parts[2];
    }

    if (targetUserId) {
      const user = await User.findById(targetUserId);
      if (user) {
        const list = targetType === 'offered' ? user.skillsOffered : user.skillsWanted;
        const target = list.find((s) => {
          const sName = typeof s === 'string' ? s : s.name;
          return targetName ? sName.toLowerCase() === targetName.toLowerCase() : true;
        });

        if (target && typeof target === 'object') {
          target.description = updatedDesc || '[Content moderated by Admin]';
          if (name) target.name = name;
          await user.save();
          return res.status(200).json({
            success: true,
            message: 'Skill description moderated successfully',
            data: user
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Skill description updated'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a skill
 * @route   DELETE /api/admin/skills/:id
 * @access  Private/Admin
 */
export const deleteSkillAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id.startsWith('user-')) {
      const parts = id.split('-');
      const userId = parts[1];
      const type = parts[2];
      const index = parseInt(parts[3], 10);

      const user = await User.findById(userId);
      if (user) {
        if (type === 'offered') {
          user.skillsOffered.splice(index, 1);
        } else {
          user.skillsWanted.splice(index, 1);
        }
        await user.save();
      }
      return res.status(200).json({
        success: true,
        message: 'Skill removed from user profile'
      });
    }

    await Skill.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all ratings and reviews across the platform
 * @route   GET /api/admin/ratings
 * @access  Private/Admin
 */
export const getAllRatingsAdmin = async (req, res, next) => {
  try {
    const { rating, search } = req.query;
    const query = {};

    if (rating && rating !== 'all') {
      query.rating = Number(rating);
    }

    let ratings = await Rating.find(query)
      .populate('fromUser', 'name email profilePhoto avatar')
      .populate('toUser', 'name email profilePhoto avatar')
      .populate('swapRequest', 'offeredSkill wantedSkill status')
      .sort({ createdAt: -1 });

    if (ratings.length === 0) {
      // Fallback check feedback model
      ratings = await Feedback.find(query)
        .populate('reviewer', 'name email')
        .populate('reviewee', 'name email')
        .populate('swap')
        .sort({ createdAt: -1 });
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      ratings = ratings.filter((r) => {
        const fromName = r.fromUser?.name || r.reviewer?.name || '';
        const toName = r.toUser?.name || r.reviewee?.name || '';
        const text = r.feedback || r.comment || '';
        return (
          fromName.toLowerCase().includes(term) ||
          toName.toLowerCase().includes(term) ||
          text.toLowerCase().includes(term)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings,
      ratings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a rating / review
 * @route   DELETE /api/admin/ratings/:id
 * @access  Private/Admin
 */
export const deleteRatingAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Rating.findByIdAndDelete(id);
    await Feedback.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Rating removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create platform announcement and broadcast to users
 * @route   POST /api/admin/announcements
 * @access  Private/Admin
 */
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, content, priority } = req.body;
    const announcementText = message || content;

    if (!title || !announcementText) {
      return res.status(400).json({
        success: false,
        message: 'Announcement title and message are required'
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: announcementText.trim(),
      content: announcementText.trim(),
      priority: priority || 'info',
      createdBy: req.user._id,
      author: req.user._id,
      isActive: true
    });

    // Broadcast in-app notification to all active non-admin users
    const users = await User.find({ _id: { $ne: req.user._id }, isBanned: false }, '_id');
    if (users.length > 0) {
      const notifications = users.map((u) => ({
        recipient: u._id,
        type: 'announcement',
        message: `📢 New Platform Announcement: "${title}"`,
        isRead: false
      }));
      await Notification.insertMany(notifications, { ordered: false });
    }

    return res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully',
      data: announcement,
      announcement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all announcements
 * @route   GET /api/admin/announcements
 * @route   GET /api/announcements
 * @access  Public / Private
 */
export const getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ isActive: { $ne: false } })
      .populate('createdBy', 'name email')
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
      announcements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete announcement
 * @route   DELETE /api/admin/announcements/:id
 * @access  Private/Admin
 */
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate reports (activity, swaps, ratings, etc.)
 * @route   GET /api/admin/reports
 * @access  Private/Admin
 */
export const getAdminReports = async (req, res, next) => {
  try {
    const { type = 'activity', status, startDate, endDate, search, format } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    let reportRows = [];
    let summary = {};

    switch (type) {
      case 'swaps':
      case 'swap-statistics':
      case 'pending-swaps':
      case 'accepted-swaps':
      case 'cancelled-swaps': {
        const swapQuery = { ...dateFilter };
        if (type === 'pending-swaps') swapQuery.status = 'pending';
        else if (type === 'accepted-swaps') swapQuery.status = 'accepted';
        else if (type === 'cancelled-swaps') swapQuery.status = 'cancelled';
        else if (status && status !== 'all') swapQuery.status = status;

        const swaps = await SwapRequest.find(swapQuery)
          .populate('requester', 'name email')
          .populate('recipient', 'name email')
          .sort({ createdAt: -1 });

        reportRows = swaps.map((s) => ({
          id: s._id.toString(),
          requester: s.requester?.name || 'Unknown',
          requesterEmail: s.requester?.email || '',
          receiver: s.recipient?.name || 'Unknown',
          receiverEmail: s.recipient?.email || '',
          offeredSkill: typeof s.offeredSkill === 'string' ? s.offeredSkill : s.offeredSkill?.name || 'N/A',
          wantedSkill: typeof s.wantedSkill === 'string' ? s.wantedSkill : s.wantedSkill?.name || 'N/A',
          status: s.status,
          date: s.createdAt?.toISOString() || new Date().toISOString()
        }));

        summary = {
          total: swaps.length,
          pending: swaps.filter((s) => s.status === 'pending').length,
          accepted: swaps.filter((s) => s.status === 'accepted').length,
          completed: swaps.filter((s) => s.status === 'completed').length,
          cancelled: swaps.filter((s) => s.status === 'cancelled').length
        };
        break;
      }

      case 'feedback':
      case 'ratings': {
        const ratings = await Rating.find({ ...dateFilter })
          .populate('fromUser', 'name email')
          .populate('toUser', 'name email')
          .populate('swapRequest')
          .sort({ createdAt: -1 });

        reportRows = ratings.map((r) => ({
          id: r._id.toString(),
          fromUser: r.fromUser?.name || 'Anonymous',
          fromEmail: r.fromUser?.email || '',
          toUser: r.toUser?.name || 'Anonymous',
          toEmail: r.toUser?.email || '',
          rating: r.rating,
          feedback: r.feedback || '',
          date: r.createdAt?.toISOString() || new Date().toISOString()
        }));

        const avg = ratings.length ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1) : 5.0;
        summary = {
          total: ratings.length,
          averageRating: avg
        };
        break;
      }

      case 'activity':
      case 'users':
      default: {
        const users = await User.find({ ...dateFilter }).select('-password').sort({ createdAt: -1 });
        reportRows = users.map((u) => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          location: u.location || 'Not Specified',
          status: u.isBanned ? 'Banned' : 'Active',
          skillsOfferedCount: (u.skillsOffered || []).length,
          skillsWantedCount: (u.skillsWanted || []).length,
          dateJoined: u.createdAt?.toISOString() || new Date().toISOString()
        }));

        summary = {
          totalUsers: users.length,
          activeUsers: users.filter((u) => !u.isBanned).length,
          bannedUsers: users.filter((u) => u.isBanned).length
        };
        break;
      }
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      reportRows = reportRows.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(term))
      );
    }

    // CSV format export support
    if (format === 'csv') {
      if (reportRows.length === 0) {
        return res.status(200).send('No data available for the selected filters');
      }
      const headers = Object.keys(reportRows[0]);
      const csvLines = [headers.join(',')];
      reportRows.forEach((row) => {
        const line = headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',');
        csvLines.push(line);
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="SkillSwap_Report_${type}_${Date.now()}.csv"`);
      return res.status(200).send(csvLines.join('\n'));
    }

    return res.status(200).json({
      success: true,
      reportType: type,
      generatedAt: new Date().toISOString(),
      summary,
      count: reportRows.length,
      data: reportRows,
      rows: reportRows
    });
  } catch (error) {
    next(error);
  }
};

export const generateReport = getAdminReports;
