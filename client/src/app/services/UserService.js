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
  },

  updateUser: async (type, id, data) => {
    const response = await WebService.postJson(`/account/update/${type}/${id}`, data)
    return await response.json()
  },

  deleteUser: async (type, id) => {
    const response = await WebService.delete(`/account/delete/${type}/${id}`)
    return await response.json()
  }
}

export default UserService
