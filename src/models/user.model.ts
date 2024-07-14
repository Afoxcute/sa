import mongoose, { Schema } from 'mongoose';
import { Iuser } from '../interface';

const UserSchema: Schema<Iuser> = new Schema<Iuser>(
  {
    first_name: {
      type: String,
      trim: true,
      required: true,
    },
    middle_name: {
      type: String,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
      required: true,
    },
    email_address: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true,
    },
    profile_image: {
      type: String,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    date_of_birth: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    password_changed_at: {
      type: Date,
      select: false,
    },
    pin_changed_at: {
      type: Date,
      select: false,
    },
    is_pin_set: {
      type: Boolean,
      default: false,
    },
    transaction_pin: {
      type: String,
      select: false,
    },
    email_verification_otp: {
      type: new mongoose.Schema(
        {
          code: { type: String },
          expires_at: { type: Date },
        },
        { _id: false },
      ),
      select: false,
    },
    password_reset_otp: {
      type: new mongoose.Schema(
        {
          code: { type: String },
          expires_at: { type: Date },
          token: { type: String },
        },
        { _id: false },
      ),
      select: false,
    },
    is_account_suspended: {
      type: Boolean,
      default: false,
      select: false,
    },
    is_account_deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    refresh_token: {
      type: String,
      select: false,
    },
    feedback: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    // toObject: { useProjection: true },
    // toJSON: { useProjection: true },
  },
);

const User = mongoose.model<Iuser>('User', UserSchema);
export default User;
