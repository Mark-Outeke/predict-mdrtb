import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faEnvelope, faTh, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 182"
            width="50"
            height="50"
            className='logo'
          >
            <path
              fill="#ffffff"
              d="M191.73,60,109,6.34a19.73,19.73,0,0,0-20.32,0L8.31,58.43a12,12,0,0,0-.25,20.63L88.6,134a19.37,19.37,0,0,0,20.37.25l82.76-53.65a11.88,11.88,0,0,0,0-20.59Zm-91,61.45a4.29,4.29,0,0,1-3.49-.05l-77-52.49L97,19.13a4.76,4.76,0,0,1,3.74,0L179.6,70.28Z"
            ></path>
            <path
              fill="#ffffff"
              d="M88.66,47.82,45.1,76.06l13.61,9.33L97,60.61a4.76,4.76,0,0,1,3.74,0l39.37,25.52,14-9.06L109,47.82A19.76,19.76,0,0,0,88.66,47.82Z"
            ></path>
            <path
              fill="#ffffff"
              d="M191.73,101.46l-8.62-5.59-14.05,9.06,10.53,6.83-78.91,51.15a4.37,4.37,0,0,1-3.49,0l-77-52.5,10-6.47L16.55,94.57,8.31,99.91a12,12,0,0,0-.25,20.63L88.6,175.46a19.34,19.34,0,0,0,20.37.24l82.75-53.65a11.88,11.88,0,0,0,0-20.59Z"
            ></path>
          </svg>
          <h1 className="header-title">Predict MDR-TB</h1>
        </div>

        <nav>
          <ul>
            <li><a href="/">.</a></li>
            <li><a href="/about">.</a></li>
            <li><a href="/contact">.</a></li>
          </ul>
        </nav>

        {/* Online Status and Icons */}
        <div className="header-icons">
          <div className="online-status">
            <span className="status-indicator">●</span>
            <span>Online</span>
          </div>
          <FontAwesomeIcon icon={faComments} className="header-icon" />
          <FontAwesomeIcon icon={faEnvelope} className="header-icon" />
          <FontAwesomeIcon icon={faTh} className="header-icon" />
          <FontAwesomeIcon icon={faUserCircle} className="header-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;
