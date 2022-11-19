import WebService from "./WebService"

const ScheduleService = {
  getSchedules: async () => {
    const response = await WebService.get('/schedule')
    const result = await response.json()
    return result
  },

  getAllSchedule: async () => {
    const response = await WebService.get('/schedule/all')
    const result = await response.json()
    return result
  },

  createSchedule: async (data) => {
    const response = await WebService.postJson(`/schedule/${data.type}`, data)
    return await response.json()
  },

  updateSchedule: async (id, data) => {
    const response = await WebService.postJson(`/schedule/${id}`, data)
    return await response.json()
  },

  deleteSchedule: async (id) => {
    const response = await WebService.delete(`/schedule/${id}`)
    return await response.json()
  }
}

export default ScheduleService
