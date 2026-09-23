import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    level: {
      type: String,
      default: 'Intermediate',
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    profilePhoto: {
      type: String,
      default: '',
      alias: 'avatar'
    },
    skillsOffered: {
      type: [skillItemSchema],
      default: []
    },
    skillsWanted: {
      type: [skillItemSchema],
      default: []
    },
    availability: {
      type: String,
      default: 'Flexible',
      trim: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    bio: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Method to verify password against hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
