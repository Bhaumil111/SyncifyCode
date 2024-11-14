import React, { useEffect, useState } from 'react';
import { langs } from '@uiw/codemirror-extensions-langs';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import './DashBoard.css';

const Selectlang = ({ sockett, onChange }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    sockett?.emit('Updated langauge for backend', lang);
    sockett?.emit('Updated mode for backend', lang);
  };

  useEffect(() => {
    sockett?.on('Updated language for users', (lang) => setSelectedLanguage(lang));
    sockett?.on('Language for new user', (lang) => setSelectedLanguage(lang));

    // Clean up event listeners when the component unmounts
    return () => {
      sockett?.off('Updated language for users');
      sockett?.off('Language for new user');
    };
  }, [sockett]);

  const languages = [
    { key: 'javascript', label: 'JavaScript' },
    { key: 'java', label: 'Java' },
    { key: 'c', label: 'C' },
    { key: 'cpp', label: 'C++' },
    { key: 'html', label: 'HTML' },
    { key: 'css', label: 'CSS' },
    { key: 'python', label: 'Python' },
  ];

  return (
    <FormControl sx={{ m: 1, minWidth: '70%' }}>
      <InputLabel id="language-select-label">Language</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={selectedLanguage}
        label="Language"
        onChange={(e) => {
          handleLanguageChange(e.target.value);
          onChange(e);
        }}
        className="custom-select"
      >
        {languages.map((lang) => (
          <MenuItem key={lang.key} value={lang.key}>
            {lang.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Selectlang;
