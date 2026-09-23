import { Skill } from '../models/Skill.js';
import { User } from '../models/User.js';

/**
 * @desc    Get all skills with search and category filters
 * @route   GET /api/skills
 * @access  Public
 */
export const getSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = { $regex: category.trim(), $options: 'i' };
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skills = await Skill.find(query).populate('owner', 'name email profilePhoto avatar location');

    return res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
      skills
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new skill
 * @route   POST /api/skills
 * @access  Private
 */
export const createSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Skill name and category are required'
      });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      owner: req.user._id
    });

    // Also add to user's skillsOffered
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        skillsOffered: {
          name: name.trim(),
          level: 'Intermediate',
          description: description || ''
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: skill,
      skill
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a skill
 * @route   PUT /api/skills/:id
 * @access  Private
 */
export const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    if (skill.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this skill'
      });
    }

    const { name, category, description } = req.body;
    if (name) skill.name = name.trim();
    if (category) skill.category = category.trim();
    if (description !== undefined) skill.description = description.trim();

    await skill.save();

    return res.status(200).json({
      success: true,
      data: skill
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a skill
 * @route   DELETE /api/skills/:id
 * @access  Private
 */
export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    if (skill.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this skill'
      });
    }

    await Skill.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

