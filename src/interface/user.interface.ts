import { Types } from 'mongoose';

export interface Iuser extends Document {
  _id: Types.ObjectId;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email_address: string;
  profile_image: string;
  is_email_verified: Boolean;
  password: string;
  password_changed_at: Date;
  pin_changed_at: Date;
  date_of_birth: string;
  is_pin_set: Boolean;
  transaction_pin: string;
  email_verification_otp: {
    code: string;
    expires_at: Date;
  };
  password_reset_otp: {
    code: string;
    expires_at: Date;
  };
  pin_reset_otp: {
    code: string;
    expires_at: Date;
  };
  is_account_suspended: Boolean;
  is_account_deleted: Boolean;
  refresh_token: string;
  feedback: string;
}
