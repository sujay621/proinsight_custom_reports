import React, { useState } from 'react';
import Header from './components/Header';
import QueryForm from './components/QueryForm';
import { Button, Container, Box } from '@mui/material';

function App() {
  const [results, setResults] = useState([{ id: 1 }]); // Mock results for testing
  const [error, setError] = useState(null);

  const handleSendReports = () => {
    // Logic to send reports
    console.log('Reports sent!');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Header />
      <QueryForm setResults={setResults} setError={setError} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {!error && results && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendReports}
            >
              Send Reports
            </Button>
          </Box>
        )}
      </Container>
    </div>
  );
}

export default App;
