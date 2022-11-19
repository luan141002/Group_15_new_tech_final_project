import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import AuthService from "./services/AuthService"

function PrivateRoute(props) {
  const { isAllowed, redirect, children, customCondition, condition } = props

  const [showLoading, setShowLoading] = useState(true)
  const [shouldLoad, setShouldLoad] = useState(false)

  const _condition = customCondition || (async () => {
    const token = await AuthService.getTokenInfo()
    if (condition) return condition(token)
    return true
  })

  useEffect(() => {
    if (isAllowed !== undefined) {
      setShouldLoad(isAllowed)
      return
    }

    async function load() {
      try {
        if (await _condition()) {
          setShouldLoad(true)
        }
      } catch (err) {
      } finally {
        setShowLoading(false)
      }
    }

    load()
  }, [])

  if (showLoading) return <></>
  return shouldLoad ? (children ? children : <Outlet />) : <Navigate to={redirect} />
}

export default PrivateRoute;
