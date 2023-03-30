import WebService from "./WebService"

const AccountService = {
  getAccount: async (accountID, queries) => {
    const response = await WebService.get(`/account/${accountID}`, queries);
    return await response.json();
  },

  getAccountImage: async (accountID, queries) => {
    const response = await WebService.get(`/account/${accountID}/image`, queries);
    return await response.blob();
  },

  getAccounts: async (type, queries) => {
    let _queries = { ...queries };
    if (type) _queries.type = type;

    const response = await WebService.get('/account', _queries);
    return await response.json();
  },
  
  getStudents: async (queries) => {
    return AccountService.getAccounts('student', queries);
  },
  
  getFaculty: async (queries) => {
    return AccountService.getAccounts('faculty', queries);
  },

  createAccount: async (values) => {
    const response = await WebService.postJson('/account', values);
    return await response.json();
  },

  createAccounts: async (values) => await AccountService.createAccount(values),

  updateAccount: async (accountID, values) => {
    const form = new FormData();
    if (values.newPassword) form.append('newPassword', values.newPassword);
    if (values.currentPassword) form.append('currentPassword', values.currentPassword);
    if (values.retypePassword) form.append('retypePassword', values.retypePassword);
    if (values.photo) {
      form.append('photo', values.photo);
    }
    
    await WebService.patchForm(`/account/${accountID}`, form);
  },

  deleteAccount: async (accountID) => {
    await WebService.delete(`/account/${accountID}`);
  },
};

export default AccountService;
