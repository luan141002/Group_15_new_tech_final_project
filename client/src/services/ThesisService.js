import WebService from "./WebService"

const ThesisService = {
  getTheses: async (queries) => {
    const response = await WebService.get('/thesis', queries);
    return await response.json();
  },

  getThesis: async (id, queries) => {
    const response = await WebService.get(`/thesis/${id}`, queries);
    return await response.json();
  },

  getSubmission: async (tid, sid, queries) => {
    const response = await WebService.get(`/thesis/${tid}/submission/${sid}`, queries);
    return await response.json();
  },

  getAttachment: async (tid, sid, aid) => {
    const response = await WebService.get(`/thesis/${tid}/submission/${sid}/attachment/${aid}`);
    return await response.blob();
  },

  /**
   * Creates a new thesis entry.
   * @param {{title: string, description?: string, authors: {_id:string}[], advisers: {_id:string}[], attachments?: File[]}} thesis 
   */
  createThesis: async (thesis) => {
    const form = new FormData();
    form.append('title', thesis.title);
    form.append('description', thesis.description);
    for (const author of thesis.authors) form.append('authors', author._id);
    for (const adviser of thesis.advisers) form.append('advisers', adviser._id);
    for (const attachment of thesis.attachments) form.append('files', attachment);

    await WebService.postForm('/thesis', form);
  },
};

export default ThesisService;
