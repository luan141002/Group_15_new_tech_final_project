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
}

export default SubmissionService
