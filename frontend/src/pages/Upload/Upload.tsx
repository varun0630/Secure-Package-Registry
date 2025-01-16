import React, { useEffect } from 'react';
import './Upload.css';
import { UploadByURLPageProps } from './Upload_Package/ByURL/UploadByURL';
import { checkTokenExpiration } from '../../utils/jwt_utils';
import { useNavigate } from 'react-router-dom';

const Upload: React.FC<UploadByURLPageProps> = ({token}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const numApiCalls = parseInt(localStorage.getItem('numApiCalls') || '0');
    // console.log("Token:", token)
    if (numApiCalls>=1000) {
      console.log("You have exceeded the number of API calls")
      navigate('/login')
    }
    if (!checkTokenExpiration(token)) {
      console.log("Hello")
    }
  }, [token]); 
  
  return (
    <div className="upload-container">
      <h1 className="upload-title">Welcome to the Upload Package and Update Package Landing Page</h1>
      <p className="upload-text">
        Choose from the options below to explore our platform features.:
      </p>
      <div className="button-container">
        <button
          className="nav-button"
          onClick={() => window.location.href = '/upload/upload-package'}
        >
          Upload
        </button>
        <button
          className="nav-button"
          onClick={() => window.location.href = '/upload/update'}
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default Upload;