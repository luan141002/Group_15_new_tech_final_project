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
  },

  verifyUser: async (username, code) => {
    const response = await WebService.postJson('/account/verify', { username, verifyCode: code })
    return await response.json()
  },

  updateUserPrefs: async (data) => {
    const { current, password, confirm, photo } = data
    const form = new FormData()
    if (current) form.append('current', current)
    if (password) form.append('password', password)
    if (confirm) form.append('confirm', confirm)
    if (photo) form.append('photo', photo)
    const response = await WebService.postForm('/account/update', form)
    return await response.json()
  }
}

export default UserService
