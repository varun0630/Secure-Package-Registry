import React, { useState } from 'react';
import './UpdateByFile.css';
import { useNavigate } from 'react-router-dom';

export interface UpdateByFilePageProps {
  token: string;
}

const UpdateByFile: React.FC<UpdateByFilePageProps> = ({token}) => {
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
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/zip') {
        setFile(selectedFile);
        setMessage('');
    } else {
        setFile(null);
        setMessage('Please select a zip file.');
    }
};


const covertToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
  });
}


  const updateByFile = async () => {
    setMessage('')
    if (!file) {
        setMessage('No file selected.');
        alert("No file selected.")
        return;
    }
    setIsLoading(true);
    const base64String = await covertToBase64(file);
    const oldVersion = `${oldMajor}.${oldMinor}.${oldPatch}`;
    const newVersion = `${newMajor}.${newMinor}.${newPatch}`;
    // setBase64(base64Stirng);
    console.log("token:", token)
    const modifiedBase64String = (base64String.split('data:application/zip;base64,'))[1];
    try {
        console.log(packageName)
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
                "Content": modifiedBase64String,
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
        // setMessage(result.message)
        
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
    <div className="update-by-file-container">
      <h1 className="update-by-file-title">Update a Package by File</h1>

      <div className="update-by-file-input-options">
        <div className="file-input-container">
          <label className="file-input-label" htmlFor="file-update">
            Choose a File:
          </label>
          <input
            type="file"
            id="file-update"
            className="file-input"
            accept=".zip,.tar.gz,.tgz"
            aria-label="Choose a file to update, accepts .zip, .tar.gz, or .tgz"
            onChange={handleFileChange}
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
          className="update-by-file-input"
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
        className="update-by-file-button"
        aria-label="Click to update the package"
        onClick={updateByFile}
      >
        Update!
      </button>
    </div>
  );
};

export default UpdateByFile;
