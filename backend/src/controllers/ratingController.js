import { Rating } from '../models/Rating.js';
import { SwapRequest } from '../models/SwapRequest.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

/**
 * @desc    Submit a rating and review for a completed/accepted swap
 * @route   POST /api/ratings
 * @access  Private
 */
export const createRating = async (req, res, next) => {
  try {
    const { swapId, swapRequestId, toUserId, targetUserId, rating, feedback, comment } = req.body;
    const targetSwapId = swapId || swapRequestId;
    const reviewFeedback = feedback !== undefined ? feedback : (comment || '');

    if (!targetSwapId) {
      return res.status(400).json({
        success: false,
        message: 'Swap ID is required'
      });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5'
      });
    }

    // Verify swap exists
    const swap = await SwapRequest.findById(targetSwapId);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Associated swap request was not found'
      });
    }

    // Must be accepted or completed
    if (!['accepted', 'completed'].includes(swap.status)) {
      return res.status(400).json({
        success: false,
        message: 'You can only rate accepted or completed swaps'
      });
    }

    // User must be one of the participants
    const isRequester = swap.requester.toString() === req.user._id.toString();
    const isRecipient = swap.recipient.toString() === req.user._id.toString();

    if (!isRequester && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this swap'
      });
    }

    // The other party is the recipient of this rating
    const recipientOfRatingId = isRequester ? swap.recipient : swap.requester;

    // Check duplicate rating for this swap by this user
    const existingRating = await Rating.findOne({
      swapRequest: swap._id,
      fromUser: req.user._id
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a rating for this swap'
      });
    }

    const newRating = await Rating.create({
      fromUser: req.user._id,
      toUser: recipientOfRatingId,
      swapRequest: swap._id,
      rating: numericRating,
      feedback: reviewFeedback
    });

    // Optionally create notification for recipient
    await Notification.create({
      recipient: recipientOfRatingId,
      type: 'new_rating',
      message: `${req.user.name} gave you a ${numericRating}-star rating for your skill swap!`
    });

    const populatedRating = await Rating.findById(newRating._id)
      .populate('fromUser', 'name email avatar profilePhoto')
      .populate('toUser', 'name email avatar profilePhoto');

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: populatedRating
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all ratings received by a specific user
 * @route   GET /api/ratings/user/:userId
 * @access  Public (or Private)
 */
export const getUserRatings = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const ratings = await Rating.find({ toUser: userId })
      .populate('fromUser', 'name email avatar profilePhoto')
      .populate('swapRequest', 'offeredSkill wantedSkill status createdAt')
      .sort({ createdAt: -1 });

    const totalCount = ratings.length;
    const averageRating = totalCount > 0
      ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        ratings,
        averageRating: Number(averageRating),
        totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get eligible swaps current user can rate (accepted swaps without existing rating from user)
 * @route   GET /api/ratings/eligible
 * @access  Private
 */
export const getEligibleSwapsToRate = async (req, res, next) => {
  try {
    // Find all accepted/completed swaps where user is requester or recipient
    const swaps = await SwapRequest.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: { $in: ['accepted', 'completed'] }
    })
      .populate('requester', 'name email avatar profilePhoto')
      .populate('recipient', 'name email avatar profilePhoto')
      .sort({ updatedAt: -1 });

    // Find ratings already submitted by this user
    const submittedRatings = await Rating.find({ fromUser: req.user._id });
    const ratedSwapIds = new Set(submittedRatings.map(r => r.swapRequest.toString()));

    const eligibleSwaps = swaps.filter(s => !ratedSwapIds.has(s._id.toString()));

    return res.status(200).json({
      success: true,
      count: eligibleSwaps.length,
      data: eligibleSwaps
    });
  } catch (error) {
    next(error);
  }
};

