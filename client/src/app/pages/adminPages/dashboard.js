import { Helmet } from 'react-helmet'
import person2 from '../../../assets/images/person2.jpg'
import ViewCalendarSection from '../../components/sections/ViewCalendarSection'

function DashboardPage() {
  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Administrator Dashboard' content='width=device-width, initial-scale=1.0' />
        <title>Administrator Dashboard</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          <ViewCalendarSection />
          <div className="tm-group">
            <h2 className="dashboard_text">Documents</h2>
            <div className='tm-row'>
              <div className="tm-column" style={{ width: '55%', padding: '0' }}>
                <a href='/' className="dashboard_elementNames"> Document Title </a>
                <ul>
                  <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                  <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                  <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                  <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                </ul>
              </div>
              <div className="tm-column" style={{ width: '15%', padding: '0' }}>
                <a href='/' className="dashboard_elementNames"> Status </a>
                <ul style={{ listStyleType: 'none' }}>
                  <li className="dashboard_elements"> Done </li>
                  <li className="dashboard_elements"> Done </li>
                  <li className="dashboard_elements"> Done </li>
                  <li className="dashboard_elements"> Done </li>
                </ul>
              </div>
              <div className="tm-column" style={{ width: '30%', padding: '0' }}> 
                <a href='/' className="dashboard_elementNames"> Submitted </a>
                <ul>
                  <li className="dashboard_elements"> 13 Dec 2020 </li>
                  <li className="dashboard_elements"> 13 Dec 2020 </li>
                  <li className="dashboard_elements"> 13 Dec 2020 </li>
                  <li className="dashboard_elements"> 13 Dec 2020 </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="tm-column">
          <div className="tm-group">
            <span>
              <h2 className="dashboard_text">Groups</h2>
              <h2 className="dashboard_elements" style={{ left: '275px', position: 'relative', bottom: '40px' }}> Endorsement Status</h2> </span>
            <span>
              <img className="member_icon" src={person2} alt='person2.jpg' />
              <img className="member_icon" src={person2} alt='person2.jpg' /> 
              <img className="member_icon" src={person2} alt='person2.jpg' />
              <img className="member_icon" src={person2} alt='person2.jpg' /> 

              <div className="endorsement_status"></div>
            </span>
          </div> 
          <div className="tm-group">
            <h2 className="dashboard_text">Deadlines</h2>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
