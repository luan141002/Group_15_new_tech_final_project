const en = {
  error: {
    unknown: 'An unknown error occurred.',
    auth: {
      invalid_credentials: 'Invalid credentials',
      not_activated: 'Account is not activated',
      verify_not_present: 'Account is not verified'
    },
    validation: {
      email: 'Email is required',
      password: 'Password is required',
      password_mismatch: 'Password mismatch'
    }
  },
  values: {
    account_kind: {
      student: 'Student',
      faculty: 'Faculty',
      administrator: 'Administrator'
    },
    thesis_status: {
      for_checking: 'For checking',
      endorsed: 'Endorsed',
      redefense: 'Redefense',
      pass: 'Final',
      fail: 'Final'
    },
    full_name: '{{lastName}}, {{firstName}}'
  }
};

export default en;
