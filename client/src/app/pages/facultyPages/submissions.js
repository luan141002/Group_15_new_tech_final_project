import { Helmet } from "react-helmet"
import SubmissionBoxesSection from "../../components/sections/SubmissionBoxesSection"

function SubmissionsPage() {
  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Submissions' content='width=device-width, initial-scale=1.0' />
        <title>Submissions</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          <SubmissionBoxesSection />
          <div className='tm-group'>
            <h2 className='tm-group-name'>Submissions by groups</h2>
          </div>
        </div>
      </div>
    </>
  )
}

export default SubmissionsPage
