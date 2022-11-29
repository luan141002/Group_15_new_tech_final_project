import WebService from "./WebService"

const SubmissionService = {
  uploadSubmission: async (assignmentId, files) => {
    const form = new FormData()
    files.forEach(file => {
      form.append('files', file)
    })
    const response = await WebService.postForm(`/submission/assignment/${assignmentId}`, form)
    const result = await response.json()
    return result
  },

  getMyGroupSubmissions: async () => {
    const response = await WebService.get(`/submission/group`)
    const result = await response.json()
    return result
  },

  getAllGroupSubmissions: async (groupId) => {
    const response = await WebService.get(`/submission/group/${groupId}`)
    const result = await response.json()
    return result
  },

  getStudentSubmissions: async (assignmentId) => {
    const response = await WebService.get(`/submission/assignment/${assignmentId}`)
    const result = await response.json()
    return result
  },

  getSubmission: async (submissionId) => {
    const response = await WebService.get(`/submission/${submissionId}`)
    const result = await response.json()
    return result
  },

  getDocument: async (submissionId, documentId) => {
    const response = await WebService.get(`/submission/${submissionId}/document/${documentId}`)
    const result = await response.blob()
    return result
  },

  endorseSubmission: async (submissionId) => {
    const response = await WebService.post(`/submission/${submissionId}/endorse`)
    const result = await response.json()
    return result
  },

  approveSubmission: async (submissionId) => {
    const response = await WebService.post(`/submission/${submissionId}/approve`)
    const result = await response.json()
    return result
  },
}

export default SubmissionService
