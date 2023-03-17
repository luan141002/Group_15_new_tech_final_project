import WebService from "./WebService"

const AnnouncementService = {
  getAnnouncements: async (queries) => {
    const response = await WebService.get('/announcement', queries);
    return await response.json();
  },

  createAnnouncement: async (announcement) => {
    const response = await WebService.postJson('/announcement', announcement);
    return await response.json();
  },

  deleteAnnouncement: async (announcementID) => {
    await WebService.delete(`/announcement/${announcementID}`);
  }
};

export default AnnouncementService;
