import React, { useState } from 'react';
import './version_search.css';
import { SearchPageProps } from '../Search';

interface RegistryEntry {
  Name: string;
  Version: string;
  ID: string;
}

const SearchByVersionPage: React.FC<SearchPageProps> = ({token}) => {
  const [packageName, setPackageName] = useState<string>('');
  const [version,setVersion] = useState<string>('');
  const [results, setResults] = useState<RegistryEntry[]>([]);
  const [message, setMessage] = useState<string>('');


  const handleSearch = async () => {


    setMessage('Searching...');
    try {
      const response = await fetch(`https://iyi2t3azi4.execute-api.us-east-1.amazonaws.com/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": "bearer " + token
        }, 
        body: JSON.stringify([
          {
            "Version": version,
            "Name": packageName
          }
        ])
      });
      const data: RegistryEntry[] = await response.json();
      console.log(data)
      setResults(data);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching data. Please try again.');
      console.error(error);
    }
  };

  return (
    <main className="search_by_version-container">
      <h1 className="search_by_version-title">Search Package by Version</h1>
      <section className="search_by_version-input-container">
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
          aria-required="true"
        />
        <label htmlFor="package-name" className="file-input-label">
          Version:
        </label>
        <input
          id="package-version"
          className="text-input"
          type="text"
          placeholder="Enter package Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          aria-required="true"
        />



        <button
          className="search_by_version-button"
          onClick={handleSearch}
          aria-label="Search for the specified package and version"
        >
          Search
        </button>
      </section>

      {message && (
        <div
          className="search_by_version-message"
          role="alert"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      {results && (
        <table className="search_by_version-results-table">
          <caption className="table-caption">
            Search Results
          </caption>
          <thead>
            <tr>
              <th scope="col">Package Name</th>
              <th scope="col">Version</th>
              <th scope="col">ID</th>
            </tr>
          </thead>
          <tbody>
            {results.map((entry, index) => (
              <tr key={index}>
                <td>{entry.Name}</td>
                <td>{entry.Version}</td>
                <td>{entry.ID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default SearchByVersionPage;
