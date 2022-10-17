import React from 'react';
import './sidebar.css';

const Sidebar = () => {
    return (
                  
            <div className="sideBar">
              <button className="navButton"> Overview </button>
              <button className="navButton"> Documents </button>
              <button className="navButton"> Defense week </button>
  
              <button className="submit_button"> Upload Document </button>
            </div>

    )
}

export default Sidebar