import React from 'react';

const LoadingState = () => (
    <div className="loadingState">
        Loading results...
    </div>
);

const ErrorMessage = ({ error }) => (
    <div className="errorMessage">
        {error}
    </div>
    );



export { LoadingState, ErrorMessage };