import WebService from "./WebService"

const AnnouncementService = {
  getAnnouncements: async (since) => {
    const queries = {}
    if (since) queries.since = since
    const response = await WebService.get('/announcement', queries)
    const result = await response.json()
    return result
  },

  getAllAnnouncements: async () => {
    const response = await WebService.get('/announcement/all')
    const result = await response.json()
    return result
  },

  createAnnouncement: async (data) => {
    const response = await WebService.postJson('/announcement', data)
    return await response.json()
  },

  deleteAnnouncement: async (id) => {
    const response = await WebService.delete(`/announcement/${id}`)
    return await response.json()
  }
}

export default AnnouncementService