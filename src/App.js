// src/App.js
import React, { useState } from 'react';
import { AppBar, Tabs, Tab } from '@mui/material';
import LiquorStoresPage from './components/LiquorStores/LiquorStoresPage';
import ContactsPage from './components/Contacts/ContactsPage';

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Active Business Search" />
          <Tab label="Contacts" />
        </Tabs>
      </AppBar>
      {value === 0 && <LiquorStoresPage />}
      {value === 1 && <ContactsPage />}
    </div>
  );
}

export default App;
