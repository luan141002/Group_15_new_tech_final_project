import WebService from "./WebService"

const AccountService = {
  getAccount: async (accountID, queries) => {
    const response = await WebService.get(`/account/${accountID}`, queries);
    return await response.json();
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

  updateAccount: async (accountID, values) => {
    await WebService.putJson(`/account/${accountID}`, values);
  },
};

export default AccountService;
