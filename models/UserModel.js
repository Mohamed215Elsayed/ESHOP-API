import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import slugify from 'slugify';
import addImageUrlHook from '../middlewares/responseModelMiddleware.js';
const { Schema } = mongoose;
import { ROLES } from '../utils/user-roles.js';

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      match: [/^01[0-2,5]{1}[0-9]{8}$/, 'Invalid phone number'],
    },
    profileImg: {
      type: String,
    },
    coverImg: { // إضافة حقل صورة الغلاف
      type: String,
    },
    password: {
      type: String,
      // required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // hide by default
      required: function () {
        return this.provider === 'local';
      },
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: Object.values(ROLES), //['user', 'manager', 'admin'],
      default: ROLES.USER,
    },
    active: {
      type: Boolean,
      default: true,
    },
    activationCode: String,
    activationCodeExpires: Date,
    activationVerified: Boolean,
    // child reference (one to many)
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
    // ✅ Terms & Privacy
    termsAccepted: {
      type: Boolean,
      required: [true, 'You must accept terms and privacy policy'],
      default: false,
    },

    termsAcceptedAt: {
      type: Date,
    },

    // termsVersion: {
    //   type: String,
    //   default: '1.0',
    // },
    // googleId: String,
    // provider: {
    //   type: String,
    //   enum: ['local', 'google'],
    //   default: 'local',
    // },
  },

  { timestamps: true }
);

// 🔹 Middleware Hooks
// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

// Generate slug automatically from name
userSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// 🔹 Instance Methods
// Compare password for login
userSchema.methods.correctPassword = async function (candidatePassword, hashedPassword) {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

// 🧠 Instance Method to check if password changed after JWT issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return passwordChangedTimestamp > JWTTimestamp; // true if password changed after token issued
  }
  // false means NOT changed after token
  return false;
};


// Hide sensitive fields in JSON output
userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
userSchema.pre('save', function (next) {
  if (this.isModified('termsAccepted') && this.termsAccepted === true) {
    this.termsAcceptedAt = new Date();
  }
  next();
});
// 🔹 Post-processing Add full image URL dynamically
/* ---------------- Image URL Middleware ---------------- */
addImageUrlHook(userSchema, 'users', ['profileImg', 'coverImg']);
// 🔹 Model Export
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export default UserModel;
