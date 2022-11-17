import WebService from "./WebService"

const AuthService = {
  login: async (username, password) => {
    const body = { username, password }
    const response = await WebService.postJson('/account/login', body)

    const data = await response.json()
    if (data.status === 'authenticated') {
      localStorage.setItem('token', data.token)
    }

    return data
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  getTokenInfo: async () => {
    await WebService.get('/account/checkToken')
  },

  getHeader: () => {
    const token = AuthService.getToken()
    return token
      ? { 'Authorization': `Bearer ${token}` }
      : { 'Authorization': '' }
  },

  getToken: () => {
    return localStorage.getItem('token')
  }
}

export default AuthService;
