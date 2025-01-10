import React, { useState } from 'react';
import Header from './components/Header';
import QueryForm from './components/QueryForm';
import { Button, Container, Box } from '@mui/material';
import { TenantProvider } from './context/TenantContext';
import { useTenant } from './hooks/useTenant';

// Create a wrapper component to use the context
const AppContent = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { selectedTenant } = useTenant();

  const handleSendReports = () => {
    if (!selectedTenant) {
      console.error('No tenant selected');
      return;
    }
    // Logic to send reports
    console.log('Sending reports for tenant:', selectedTenant);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Header />
      <QueryForm setResults={setResults} setError={setError} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {!error && results && selectedTenant && (
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
};

// Main App component wraps everything with the TenantProvider
function App() {
  return (
    <TenantProvider>
      <AppContent />
    </TenantProvider>
  );
}

export default App;
