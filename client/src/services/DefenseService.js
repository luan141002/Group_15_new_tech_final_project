import WebService from "./WebService"

const DefenseService = {
  getDefenses: async (queries) => {
    const response = await WebService.get(`/defense`, queries);
    return await response.json();
  },

  processDefenseSlots: async (request) => {
    let request2 = Array.isArray(request) ? request : [request];
    request2 = request2.map(e => {
      const { panelists, ...rest } = e;
      if (!panelists) return e;
      const panelists2 = panelists.map(e2 => typeof e2 === 'object' ? e2._id : e2);
      return { ...rest, panelists: panelists2 };
    });
    const response = await WebService.postJson('/defense', request2);
    return await response.json();
  },
};

export default DefenseService;
