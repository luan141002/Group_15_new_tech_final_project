import WebService from "./WebService"

const AssignmentService = {
  getAssignments: async (all) => {
    const queries = {}
    if (all) queries.all = '1'
    const response = await WebService.get('/assignment', queries)
    const result = await response.json()
    return result
  },

  getAssignment: async (id) => {
    const response = await WebService.get(`/assignment/${id}`)
    const result = await response.json()
    return result
  },

  createAssignment: async (data) => {
    const response = await WebService.postJson('/assignment', data)
    return await response.json()
  },

  publishAssignment: async (id) => {
    const response = await WebService.post(`/assignment/${id}/publish`)
    return await response.json()
  },

  updateAssignment: async (id, data) => {
    const response = await WebService.postJson(`/assignment/${id}`, data)
    return await response.json()
  },

  deleteAssignment: async (id) => {
    const response = await WebService.delete(`/assignment/${id}`)
    return await response.json()
  },

  getGroupsWithAssignment: async (id) => {
    const response = await WebService.get(`/assignment/${id}/groups`)
    const result = await response.json()
    return result
  }
}

export default AssignmentService
