import WebService from "./WebService"

const GroupService = {
  getMyGroups: async () => {
    const response = await WebService.get('/group/my')
    const result = await response.json()
    return result
  },

  getAllGroups: async () => {
    const response = await WebService.get('/group/all')
    const result = await response.json()
    return result
  },

  getGroup: async (id) => {
    const response = await WebService.get(`/group/${id}`)
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
