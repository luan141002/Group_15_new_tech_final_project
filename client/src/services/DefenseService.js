import WebService from "./WebService"

const DefenseService = {
  getDefenses: async (queries) => {
    const response = await WebService.get(`/defense`, queries);
    return await response.json();
  },

  processDefenseSlots: async (request) => {
    const response = await WebService.postJson('/defense', request);
    return await response.json();
  },
};

export default DefenseService;
