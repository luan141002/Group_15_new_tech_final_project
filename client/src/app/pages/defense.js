import { Component } from 'react'
import { Helmet } from 'react-helmet'
import Overlay from '../components/overlay'

import ChecklistOverlay from '../components/overlays/checklist'

class DefensePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: {
        name: 'Jamie Mapa'
      },
      showOverlay: false
    }
  }

  componentDidMount() {

  }

  openOverlay = (name) => () => {
    this.setState({
      showOverlay: name
    })
  }

  closeOverlay = () => {
    this.setState({
      showOverlay: false
    })
  }

  render() {
    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <meta name='Documents Student' content='width=device-width, initial-scale=1.0' />
          <title>Documents Student</title>
        </Helmet>
        <Overlay show={this.state.showOverlay}>
          <ChecklistOverlay overlayName='checklist' onClose={this.closeOverlay} />
        </Overlay>
        <div class="row">
          <div class="column" style={{ width: 'auto' }}>
            <div class="sideNav">
              <button class="navButton"> Overview </button>
              <button class="navButton"> Documents </button>
              <button class="navButton"> Defense week </button>
  
              <button class="submit_button"> Upload Document </button>
            </div>
          </div>

          <div class="column" style={{ width: 'auto' }}>
            <h1 style={{ fontFamily: 'Lato, "Segoe UI"', margin: '1rem', padding: '.5rem' }}> Thesis Management System </h1>     
            <div class="calendar_box">
              <h2 class="dashboard_text"> Calendar </h2>
            </div>
          </div>

          <div class="column" style={{ width: 'auto' }}>
            <a href='/' class="account_text" style={{ right: '35px' }}> Jamie Mapa</a>
            <a href='/' class="account_text" style={{ top: '35px', left: '80px', color: '#818181' }}> Student account</a>
            
            <div class="calendar_box2" style={{ marginTop: '80px', height: '703px' }}>
              <label class="container2"> Classes
                <input type="checkbox" checked="checked" />
                <span class="checkmark"></span>
              </label>
              <label class="container2"> Personal
                <input type="checkbox" checked="checked" />
                <span class="checkmark"></span>
              </label>
              <label class="container2" > Thesis Defense
                <input type="checkbox" checked="checked" />
                <span class="checkmark_defense" ></span>
              </label>
              <label class="container2"> Faculty
                <input type="checkbox" checked="checked" />
                <span class="checkmark_faculty"></span>
              </label>
              <label class="container2"> Groupmates
                <input type="checkbox" checked="checked" />
                <span class="checkmark_groupmates"></span>
              </label>
            </div> 
          </div>
        </div>
      </>
    )
  }
}

export default DefensePage
