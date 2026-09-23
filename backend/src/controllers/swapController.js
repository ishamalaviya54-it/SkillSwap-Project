import { SwapRequest } from '../models/SwapRequest.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

/**
 * Helper to safely extract skill name as string
 */
const getSkillName = (skill) => {
  if (!skill) return 'Skill';
  if (typeof skill === 'string') return skill;
  if (typeof skill === 'object' && skill.name) return skill.name;
  return String(skill);
};

/**
 * @desc    Create a new swap request
 * @route   POST /api/swaps
 * @access  Private
 */
export const createSwapRequest = async (req, res, next) => {
  try {
    const { recipientId, receiverId, recipient, receiver, offeredSkill, wantedSkill, message } = req.body;
    const targetUserId = recipientId || receiverId || recipient || receiver;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient / Receiver ID is required'
      });
    }

    if (!offeredSkill || !wantedSkill) {
      return res.status(400).json({
        success: false,
        message: 'Both offered skill and wanted skill are required'
      });
    }

    if (targetUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a swap request to yourself'
      });
    }

    // Validate recipient user exists
    const recipientUser = await User.findById(targetUserId);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user does not exist'
      });
    }

    const swap = await SwapRequest.create({
      requester: req.user._id,
      recipient: recipientUser._id,
      offeredSkill,
      wantedSkill,
      message: message || '',
      status: 'pending'
    });

    // Create notification for receiver
    const offeredName = getSkillName(offeredSkill);
    const wantedName = getSkillName(wantedSkill);
    await Notification.create({
      recipient: recipientUser._id,
      type: 'swap_request',
      message: `${req.user.name} sent you a skill swap request: offering "${offeredName}" for "${wantedName}".`
    });

    const populatedSwap = await SwapRequest.findById(swap._id)
      .populate('requester', 'name email avatar profilePhoto location')
      .populate('recipient', 'name email avatar profilePhoto location');

    return res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: populatedSwap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get swap requests sent by current user
 * @route   GET /api/swaps/sent
 * @access  Private
 */
export const getSentSwaps = async (req, res, next) => {
  try {
    const swaps = await SwapRequest.find({ requester: req.user._id })
      .populate('requester', 'name email avatar profilePhoto location')
      .populate('recipient', 'name email avatar profilePhoto location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: swaps.length,
      data: swaps
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get swap requests received by current user
 * @route   GET /api/swaps/received
 * @access  Private
 */
export const getReceivedSwaps = async (req, res, next) => {
  try {
    const swaps = await SwapRequest.find({ recipient: req.user._id })
      .populate('requester', 'name email avatar profilePhoto location')
      .populate('recipient', 'name email avatar profilePhoto location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: swaps.length,
      data: swaps
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all swaps involving current user (both sent & received)
 * @route   GET /api/swaps
 * @access  Private
 */
export const getMySwaps = async (req, res, next) => {
  try {
    const swaps = await SwapRequest.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }]
    })
      .populate('requester', 'name email avatar profilePhoto location')
      .populate('recipient', 'name email avatar profilePhoto location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: swaps.length,
      data: swaps
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a received swap request
 * @route   PUT /api/swaps/:id/accept
 * @access  Private (Recipient only)
 */
export const acceptSwap = async (req, res, next) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name email')
      .populate('recipient', 'name email');

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swap.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can accept this swap request'
      });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a swap with status "${swap.status}"`
      });
    }

    swap.status = 'accepted';
    await swap.save();

    // Create notification for requester
    await Notification.create({
      recipient: swap.requester._id,
      type: 'swap_accepted',
      message: `${req.user.name} accepted your skill swap request!`
    });

    return res.status(200).json({
      success: true,
      message: 'Swap request accepted',
      data: swap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a received swap request
 * @route   PUT /api/swaps/:id/reject
 * @access  Private (Recipient only)
 */
export const rejectSwap = async (req, res, next) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name email')
      .populate('recipient', 'name email');

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swap.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can reject this swap request'
      });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a swap with status "${swap.status}"`
      });
    }

    swap.status = 'rejected';
    await swap.save();

    // Create notification for requester
    await Notification.create({
      recipient: swap.requester._id,
      type: 'swap_rejected',
      message: `${req.user.name} declined your skill swap request.`
    });

    return res.status(200).json({
      success: true,
      message: 'Swap request rejected',
      data: swap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a sent pending swap request
 * @route   PUT /api/swaps/:id/cancel
 * @access  Private (Requester only)
 */
export const cancelSwap = async (req, res, next) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name email')
      .populate('recipient', 'name email');

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swap.requester._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel this swap request'
      });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Accepted or rejected requests cannot be cancelled'
      });
    }

    swap.status = 'cancelled';
    await swap.save();

    // Notify recipient of cancellation
    await Notification.create({
      recipient: swap.recipient._id,
      type: 'swap_cancelled',
      message: `${req.user.name} cancelled their swap request.`
    });

    return res.status(200).json({
      success: true,
      message: 'Swap request cancelled successfully',
      data: swap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a pending or cancelled swap request
 * @route   DELETE /api/swaps/:id
 * @access  Private (Requester only)
 */
export const deleteSwap = async (req, res, next) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can delete this swap request'
      });
    }

    if (['accepted', 'completed'].includes(swap.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active or accepted swap request'
      });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Swap request deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Backward compatibility alias for status update
 */
export const updateSwapStatus = async (req, res, next) => {
  const { status } = req.body;
  if (status === 'accepted') return acceptSwap(req, res, next);
  if (status === 'rejected') return rejectSwap(req, res, next);
  if (status === 'cancelled') return cancelSwap(req, res, next);

  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap request not found' });
    swap.status = status;
    await swap.save();
    return res.status(200).json({ success: true, data: swap });
  } catch (err) {
    next(err);
  }
};

export const cancelSwapRequest = cancelSwap;
