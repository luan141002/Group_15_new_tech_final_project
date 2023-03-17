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
      new: 'New',
      for_checking: 'For checking',
      checked: 'Checked',
      endorsed: 'Endorsed',
      redefense: 'Redefense',
      pass: 'Final',
      fail: 'Final'
    },
    thesis_phase: {
      '1': 'First',
      '2': 'Second',
      '3': 'Third'
    },
    full_name: '{{lastName}}, {{firstName}}'
  }
};

export default en;
