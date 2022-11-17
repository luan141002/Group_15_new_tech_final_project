import WebService from "./WebService"

const GroupService = {
  getGroups: async () => {
    const response = await WebService.get('/group')
    const result = await response.json()
    return result
  },

  createGroup: async (data) => {
    const response = await WebService.postJson('/group/create', data)
    return await response.json()
  },

  updateGroup: async (id, data) => {
    const response = await WebService.postJson(`/group/${id}`, data)
    return await response.json()
  },

  deleteGroup: async (id) => {
    const response = await WebService.delete(`/group/${id}`)
    return await response.json()
  }
}

export default GroupService
