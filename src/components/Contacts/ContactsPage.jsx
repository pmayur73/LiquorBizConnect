// src/components/Contacts/ContactsPage.jsx
import React from 'react';
import { Container, Typography } from '@mui/material';

function ContactsPage() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Contacts
      </Typography>
      {/* Add your contacts content here */}
      <Typography variant="body1">
        Here you can add contact information or any other relevant details.
      </Typography>
    </Container>
  );
}

export default ContactsPage;
