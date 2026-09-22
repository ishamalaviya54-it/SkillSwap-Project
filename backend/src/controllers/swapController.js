import { SwapRequest } from '../models/SwapRequest.js';

export const createSwapRequest = async (req, res, next) => {
  try {
    const { recipientId, offeredSkill, wantedSkill, message } = req.body;

    if (!recipientId || !offeredSkill || !wantedSkill) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID, offered skill, and wanted skill are required'
      });
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request a skill swap with yourself'
      });
    }

    const swap = await SwapRequest.create({
      requester: req.user._id,
      recipient: recipientId,
      offeredSkill,
      wantedSkill,
      message
    });

    const populatedSwap = await SwapRequest.findById(swap._id)
      .populate('requester', 'name email avatar')
      .populate('recipient', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedSwap
    });
  } catch (error) {
    next(error);
  }
};

export const getMySwaps = async (req, res, next) => {
  try {
    const swaps = await SwapRequest.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }]
    })
      .populate('requester', 'name email avatar')
      .populate('recipient', 'name email avatar')
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

export const updateSwapStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Only recipient can accept/reject; either party can complete
    if (['accepted', 'rejected'].includes(status)) {
      if (swap.recipient.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the recipient can accept or reject this swap request'
        });
      }
    }

    swap.status = status;
    await swap.save();

    res.status(200).json({
      success: true,
      data: swap
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSwapRequest = async (req, res, next) => {
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
        message: 'Only the requester can cancel a pending swap request'
      });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending swap requests can be cancelled'
      });
    }

    swap.status = 'cancelled';
    await swap.save();

    res.status(200).json({
      success: true,
      message: 'Swap request cancelled successfully',
      data: swap
    });
  } catch (error) {
    next(error);
  }
};

