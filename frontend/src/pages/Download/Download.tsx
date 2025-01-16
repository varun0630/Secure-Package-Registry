import React, { useState } from 'react';
import './Download.css';
import { SearchPageProps } from '../Search/Search';

const Download: React.FC<SearchPageProps> = ({token}) => {
  const [packageName, setPackageName] = useState<string>('');
  const [versionParts, setVersionParts] = useState<{ major: string; minor: string; patch: string }>({
    major: '',
    minor: '',
    patch: '',
  });
  const [message, setMessage] = useState<string>('');

  const handleVersionChange = (part: 'major' | 'minor' | 'patch', value: string) => {
    if (/^\d*$/.test(value)) { // Ensure only numbers are entered
      setVersionParts((prev) => ({ ...prev, [part]: value }));
    }
  };

  const download = async () => {  
    const version = versionParts.major + '.' + versionParts.minor + '.' + versionParts.patch;
    try {
        console.log("token:", token)
        const response = await fetch(`https://iyi2t3azi4.execute-api.us-east-1.amazonaws.com/package/${packageName}....${version}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Authorization": "bearer " + token
          }
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.Error);
        }
        const content = result.data.Content;
        console.log(result)
        const response_2  = await fetch(`https://iyi2t3azi4.execute-api.us-east-1.amazonaws.com/package/download`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Authorization": "bearer " + token
            },
            body: JSON.stringify({name: packageName,version: version,content: content})
          });
        const blob = await response_2.blob()
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${packageName}-${version}.zip`;
        link.click();
        
    }
    catch (error) {
        alert(error)
    }

}
  return (
    <main className="download-container">
      <h1 className="download-title" tabIndex={0}>Download a Package</h1>
      <section className="download-input-container">
        <label htmlFor="package-name" className="file-input-label">
          Package Name:
        </label>
        <input
          id="package-name"
          className="text-input"
          type="text"
          placeholder="Enter package name"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          aria-label="Enter the package name"
          required
        />

        <label htmlFor="package-version" className="file-input-label">
          Package Version:
        </label>
        <div className="version-input-group">
          <input
            id="major-version"
            className="version-input"
            type="text"
            placeholder="0"
            value={versionParts.major}
            onChange={(e) => handleVersionChange('major', e.target.value)}
            required
            aria-label="Major version"
          />
          <span className="version-separator">.</span>
          <input
            id="minor-version"
            className="version-input"
            type="text"
            placeholder="0"
            value={versionParts.minor}
            onChange={(e) => handleVersionChange('minor', e.target.value)}
            required
            aria-label="Minor version"
          />
          <span className="version-separator">.</span>
          <input
            id="patch-version"
            className="version-input"
            type="text"
            placeholder="0"
            value={versionParts.patch}
            onChange={(e) => handleVersionChange('patch', e.target.value)}
            required
            aria-label="Patch version"
          />
        </div>

        <button
          className="download-button"
          onClick={download}
          aria-label="Download the specified package"
        >
          Download Package
        </button>
      </section>
    </main>
  );
};

export default Download;

