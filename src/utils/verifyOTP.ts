import { isAfter } from 'date-fns';

interface verifyotp {
  code: string;
  current_code: string;
  expiry: Date;
  current_expiry: Date;
}

export function verifyOTP(payload: verifyotp) {
  if (
    payload.code !== payload.current_code ||
    isAfter(payload.expiry, payload.current_expiry)
  ) {
    return false;
  }
  return true;
}
