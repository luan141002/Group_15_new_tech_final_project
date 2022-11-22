import WebService from "./WebService"

const CommentService = {
  getComments: async (submissionId, documentId) => {
    const url = documentId ? `/comment/${submissionId}/document/${documentId}` : `/comment/${submissionId}`
    const response = await WebService.get(url)
    const result = await response.json()
    return result
  },

  createComment: async (form, submissionId, documentId) => {
    const url = documentId ? `/comment/${submissionId}/document/${documentId}` : `/comment/${submissionId}`
    const response = await WebService.postJson(url, form)
    const result = await response.json()
    return result
  },

  deleteComment: async (commentId, submissionId, documentId) => {
    const url = documentId ?
      `/comment/${submissionId}/document/${documentId}/comment/${commentId}` :
      `/comment/${submissionId}/comment/${commentId}`
    const response = await WebService.delete(url)
    return await response.json()
  }
}

export default CommentService
