import React, { useState } from 'react';
import './Admin.css';
import { UploadByURLPageProps } from '../Upload/Upload_Package/ByURL/UploadByURL';
import { useNavigate } from 'react-router-dom';


/**
 * AdminPage component serves as the administrator's dashboard.
 * Provides navigation options to create users, modify user permissions, and reset the registry.
 *
 * @returns {JSX.Element} - The rendered AdminPage component.
 */
const AdminPage: React.FC<UploadByURLPageProps> = ({token}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const reset = async () => {

    try {
        console.log("token:", token)
        var numApiCalls = parseInt(localStorage.getItem('numApiCalls') || '0');
        console.log("numApiCalls:", numApiCalls)
        if (numApiCalls>=1000) {
          alert("You have exceeded the maxiumum number of API calls")
          navigate('/login')
          return;
        }
        numApiCalls = numApiCalls + 1;
        localStorage.setItem('numApiCalls', String(numApiCalls));
        setIsLoading(true);
        const response = await fetch(`https://iyi2t3azi4.execute-api.us-east-1.amazonaws.com/reset`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Authorization": "bearer " + token
          }
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.Error);
        }
        console.log(result)
        setIsLoading(false);
        alert("Registry reset successfully")
        // localStorage.setItem('numApiCalls', String(numApiCalls));
   
    }
    catch (error) {
        setIsLoading(false);
        console.log(error)
        alert(error)
        
    }

}


  return (
    <div className="admin-container">
      <h1 className="admin-title">Welcome, Administrator</h1>
      <p className="admin-text">
        Choose from the options below to explore our platform features.
      </p>
      <div className="admin-button-container">
        <button className="nav-button" onClick={() => window.location.href = '/admin/create-user'}>
          Create a User
        </button>
        <button className="nav-button" onClick={() => window.location.href = '/admin/modify-user-permissions'}>
          Modify User Permissions
        </button>
        <button className="nav-button" onClick={reset}>
          {isLoading ? 'Resetting...' : 'Reset Registry'}
        </button>
      </div>
    </div>
  );
}

export default AdminPage;
