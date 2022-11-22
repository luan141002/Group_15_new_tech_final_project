import WebService from "./WebService"

const AuthService = {
  findRedirectUrl: kind => {
    if (!kind) return ''
    let nextUrl = '/'
    switch (kind) {
      case 'faculty':
        nextUrl = '/faculty'
        break
      case 'administrator':
        nextUrl = '/admin'
        break
      default:
        break
    }

    return nextUrl
  },

  login: async (username, password, nextUrl) => {
    const body = { username, password }
    const response = await WebService.postJson('/account/login', body)

    if (response.ok) {
      const token = await response.json()
      localStorage.setItem('token', token.id)
      if (!nextUrl) {
        nextUrl = AuthService.findRedirectUrl(token.kind)
      }

      token.nextUrl = nextUrl
      return token
    }
    
    return null
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  getTokenInfo: async () => {
    const result = await WebService.post('/account/checkToken')
    const token = await result.json()
    const nextUrl = AuthService.findRedirectUrl(token.kind)
    token.nextUrl = nextUrl
    return token
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
