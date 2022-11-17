import WebService from "./WebService"

const UserService = {
  getUsers: async (type) => {
    const response = await WebService.get('/account/users', { type })
    const result = await response.json()
    return result
  },

  addUser: async (type, data) => {
    const response = await WebService.postJson(`/account/add/${type}`, data)
    return await response.json()
  }
}

export default UserService
