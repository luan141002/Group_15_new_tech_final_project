import WebService from "./WebService"

const AssignmentService = {
  getAssignments: async () => {
    const response = await WebService.get('/assignment')
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
  }
}

export default AssignmentService
