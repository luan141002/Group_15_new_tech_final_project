import AuthService from "./AuthService"

const API_URL = process.env.REACT_APP_API

class WebError {
  constructor(message, details) {
    this.message = message
    this.details = details
  }
}

const WebService = {
  request: async (endpoint, init) => {
    const { headers, ...initRest } = init || {}
    const authHeaders = { ...AuthService.getHeader(), ...headers }
    try {
      const result = await fetch(`${API_URL}${endpoint}`, { headers: authHeaders, ...initRest })
      if (!result.ok) {
        const reason = await result.json()
        throw new WebError(reason.message, reason.details)
      }
      return result
    } catch (error) {
      if (error instanceof WebError) throw error
      throw new WebError('Could not connect to remote server', error)
    }
  },

  get: async (endpoint, queries, init) => {
    const url = endpoint + (queries ? ('?' + new URLSearchParams(queries).toString()) : '')
    return await WebService.request(url, { ...init, ...{ method: 'GET' } })
  },

  post: async (endpoint, init) => {
    return await WebService.request(endpoint, {
      ...init,
      ...{
        method: 'POST'
      }
    })
  },

  postJson: async (endpoint, body, init) => {
    const { headers, ...rest } = init || {}
    const jsonHeaders = { ...headers, ...{ 'Content-Type': 'application/json' } }
    return await WebService.request(endpoint, {
      body: JSON.stringify(body),
      headers: jsonHeaders,
      method: 'POST',
      ...rest
    })
  },

  patchJson: async (endpoint, body, init) => {
    const { headers, ...rest } = init || {}
    const jsonHeaders = { ...headers, ...{ 'Content-Type': 'application/json' } }
    return await WebService.request(endpoint, {
      body: JSON.stringify(body),
      headers: jsonHeaders,
      method: 'PATCH',
      ...rest
    })
  },

  delete: async (endpoint, init) => {
    return await WebService.request(endpoint, {
      ...init,
      ...{
        method: 'DELETE'
      }
    })
  }
}

export default WebService
