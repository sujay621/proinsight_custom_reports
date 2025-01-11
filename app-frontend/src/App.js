import React, { useState } from 'react';
import Header from './components/Header';
import QueryForm from './components/QueryForm';
import { Button, Container, Box, Stack } from '@mui/material';
import { TenantProvider } from './context/TenantContext';
import { useTenant } from './hooks/useTenant';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EmailDialog from './components/EmailDialog';

// Create a wrapper component to use the context
const AppContent = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { selectedTenant } = useTenant();
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Header />
      <QueryForm setResults={setResults} setError={setError} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {!error && results && selectedTenant && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
          </Box>
        )}
      </Container>
      <EmailDialog
        open={openSendDialog}
        handleClose={() => setOpenSendDialog(false)}
        isScheduled={false}
      />
      <EmailDialog
        open={openScheduleDialog}
        handleClose={() => setOpenScheduleDialog(false)}
        isScheduled={true}
      />
    </div>
  );
};

// Main App component wraps everything with the TenantProvider
function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TenantProvider>
        <AppContent />
      </TenantProvider>
    </LocalizationProvider>
  );
}

export default App;
