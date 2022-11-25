import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { Link, Navigate, useSearchParams } from "react-router-dom"
import UserService from "../services/UserService"

function VerifyPage() {
  const [queries] = useSearchParams()
  const [ok, setOk] = useState(false)
  const [message, setMessage] = useState('')
  const [proceed, setProceed] = useState(false)

  const username = queries.get('username')
  const verifyCode = queries.get('verifyCode')

  useEffect(() => {
    if (!ok) return

    const timer = setTimeout(() => {
      setProceed(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [ok])

  useEffect(() => {
    if (!username || !verifyCode) {
      setMessage('Invalid verification token')
      return
    }

    async function verify() {
      try {
        const result = await UserService.verifyUser(username, verifyCode)
        setMessage(result.message)
        setOk(true)
      } catch (error) {
        setMessage(error.message)
      }
    }

    verify()
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Verification' content='width=device-width, initial-scale=1.0' />
        <title>Verification</title>
      </Helmet>
      <div>
        {proceed && <Navigate to='/login' />}
        <p>{message}</p>
        {ok && <p>You will be redirected to the login page in five seconds.</p>}
        {ok && <p>If not, you can click <Link to='/login'>here</Link>.</p>}
      </div>
    </>
  )
}

export default VerifyPage
