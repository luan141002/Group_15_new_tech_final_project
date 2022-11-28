import { Helmet } from "react-helmet"
import SubmissionBoxesSection from "../../components/sections/SubmissionBoxesSection"

function FacultySubmissionsPage() {
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
        </div>
      </div>
    </>
  )
}

export default FacultySubmissionsPage
