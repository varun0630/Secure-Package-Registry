import React, { useState } from 'react';
import './Search.css';

export interface RateParameters {
  BusFactor: number;
  BusFactorLatency: number;
  ResponsiveMaintainer: number;
  ResponsiveMaintainerLatency: number;
  RampUp: number;
  RampUpLatency: number;
  Correctness: number;
  CorrectnessLatency: number;
  LicenseScore: number;
  LicenseScoreLatency: number;
  GoodPinningPractice: number;
  GoodPinningPracticeLatency: number;
  PullRequest: number;
  PullRequestLatency: number;
  NetScore: number;
  NetScoreLatency: number;
}

export interface SearchPageProps {
  token: string;
}

const Search: React.FC<SearchPageProps> = ({ token }) => {
  const [packageName, setPackageName] = useState('');
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [patch, setPatch] = useState('');
  const [results, setResults] = useState<RateParameters | null>(null);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!packageName || !major || !minor || !patch) {
      setMessage('Please fill in all fields.');
      return;
    }

    setMessage('Searching...');
    try {
      const version = `${major}.${minor}.${patch}`;
      const response = await fetch(`https://iyi2t3azi4.execute-api.us-east-1.amazonaws.com/package/${packageName}....${version}/rate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": "bearer " + token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data: RateParameters = await response.json();
      setResults(data);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching data. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Welcome to the Search Landing Page</h1>
      <p className="search-text">
        Choose from the options below to explore our platform features.
      </p>
      <div className="button-container">
        <button className="nav-button" onClick={() => window.location.href = '/search/get-rating'}>
          Get Rating
        </button>
        <button className="nav-button" onClick={() => window.location.href = '/search/version-search'}>
          Search by Version
        </button>
        <button className="nav-button" onClick={() => window.location.href = '/search/regex-search'}>
          Search by Regex
        </button>
        <button className="nav-button" onClick={() => window.location.href = '/search/view-registry'}>
          View Registry
        </button>
      </div>
    </div>
  );
}

export default Search
