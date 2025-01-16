import React, { useState } from 'react';
import './UpdateByURL.css';
import { useNavigate } from 'react-router-dom';

export interface UpdateByURLPageProps {
  token: string;
}

const UpdateByURL: React.FC<UpdateByURLPageProps> = ({token}) => {
  const [packageUrl, setPackageUrl] = useState('');
  const [oldMajor, oldSetMajor] = useState('');
  const [oldMinor, oldSetMinor] = useState('');
  const [oldPatch, oldSetPatch] = useState('');
  const [newMajor, newSetMajor] = useState('');
  const [newMinor, newSetMinor] = useState('');
  const [newPatch, newSetPatch] = useState('');
  const [packageName, setPackageName] = useState('');
  const [message, setMessage] = useState<string>('');
  const [isSecret, setIsSecret] = useState<boolean>(false);
  const [userGroup, setUserGroup] = useState<string>('default');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const updateByURL = async () => {

    if (!packageUrl) {
        setMessage('No Input');
        return;
    }
    setIsLoading(true);
    try {
      const oldVersion = `${oldMajor}.${oldMinor}.${oldPatch}`;
      const newVersion = `${newMajor}.${newMinor}.${newPatch}`;
        console.log("token:", token)
        console.log("package name:", packageName)
        var numApiCalls = parseInt(localStorage.getItem('numApiCalls') || '0');
        console.log("numApiCalls:", numApiCalls)
        if (numApiCalls>=1000) {
          alert("You have exceeded the maxiumum number of API calls")
          navigate('/login')
          return;
        }
        numApiCalls = numApiCalls + 1;
        localStorage.setItem('numApiCalls', String(numApiCalls));
        const response = await fetch(`https://iyi2t3azi4.execute-api.us-east-1.amazonaws.com/package/${packageName}....${oldVersion}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Authorization": "bearer " + token
          },
          body: JSON.stringify(
            {
              "metadata": {
                "Name": packageName,
                "Version": newVersion,
                "ID": `${packageName}....${oldVersion}`,
              },
              "data": {
                "Name": packageName,
                "URL": packageUrl,
              }
            }
          )
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.Error);
        }
        console.log(result)
        setIsLoading(false);
        alert("Package uploaded successfully")
        // localStorage.setItem('numApiCalls', String(numApiCalls));
   
    }
    catch (error) {
        setIsLoading(false);
        console.log(error)
        setMessage(String(error))
        setIsLoading(false);
        alert(error)
        
    }

}


  return (
    <div className="update-by-url-container">
      <h1 className="update-by-url-title">Update a Package by URL</h1>

      <div className="update-by-url-input-options">
        <div className="file-input-container">
          <label className="file-input-label" htmlFor="url-update">
            Package URL:
          </label>
          <input
            type="text"
            id="url-update"
            className="update-by-url-input"
            placeholder="Enter package URL"
            onChange={(e) => setPackageUrl(e.target.value)}
            aria-label="Enter a URL to update the package from"
          />
        </div>
      </div>

      <div className="file-input-container">
        <label className="file-input-label" htmlFor="package-name">
          Package Name:
        </label>
        <input
          type="text"
          id="package-name"
          className="update-by-url-input"
          placeholder="Enter package name"
          onChange={(e) => setPackageName(e.target.value)}
          aria-label="Enter the name of the package you are updating"
        />
      </div>

      <div className="file-input-container">
        <label className="version-input-label">Existing Version:</label>
        <div className="version-input-group">
          <input
            type="text"
            className="version-input"
            placeholder="0"
            value={oldMajor}
            onChange={(e) => oldSetMajor(e.target.value)}
            aria-label="Enter the major version number"
          />
          <span className="version-separator">.</span>
          <input
            type="text"
            className="version-input"
            placeholder="0"
            value={oldMinor}
            onChange={(e) => oldSetMinor(e.target.value)}
            aria-label="Enter the minor version number"
          />
          <span className="version-separator">.</span>
          <input
            type="text"
            className="version-input"
            placeholder="0"
            value={oldPatch}
            onChange={(e) => oldSetPatch(e.target.value)}
            aria-label="Enter the patch version number"
          />
        </div>
        <label className="version-input-label">New Version:</label>
        <div className="version-input-group">
          <input
            type="text"
            className="version-input"
            placeholder="0"
            value={newMajor}
            onChange={(e) => newSetMajor(e.target.value)}
            aria-label="Enter the major version number"
          />
          <span className="version-separator">.</span>
          <input
            type="text"
            className="version-input"
            placeholder="0"
            value={newMinor}
            onChange={(e) => newSetMinor(e.target.value)}
            aria-label="Enter the minor version number"
          />
          <span className="version-separator">.</span>
          <input
            type="text"
            className="version-input"
            placeholder="0"
            value={newPatch}
            onChange={(e) => newSetPatch(e.target.value)}
            aria-label="Enter the patch version number"
          />
        </div>
      </div>
      <button
        className="update-by-url-button"
        aria-label="Click to update the package"
        onClick={updateByURL}
      >
        Update!
      </button>
    </div>
  );
};

export default UpdateByURL;
