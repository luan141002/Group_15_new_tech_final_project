import WebService from "./WebService"

const ProcessService = {
  getProcesses: async (all) => {
    const queries = {}
    if (all) queries.all = '1'
    const response = await WebService.get('/process', queries)
    const result = await response.json()
    return result
  },

  getProcess: async (id) => {
    const response = await WebService.get(`/process/${id}`)
    return await response.json()
  },

  createProcess: async (data) => {
    const response = await WebService.postJson('/process', data)
    return await response.json()
  },

  updateProcess: async (id, data) => {
    const response = await WebService.postJson(`/process/${id}`, data)
    return await response.json()
  },

  deleteProcess: async (id) => {
    const response = await WebService.delete(`/process/${id}`)
    return await response.json()
  }
}

export default ProcessService
