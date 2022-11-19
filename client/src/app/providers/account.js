import React from 'react'

const AccountContext = React.createContext({
  account: null
})

const useAccount = () => {
  return React.useContext(AccountContext)
}
