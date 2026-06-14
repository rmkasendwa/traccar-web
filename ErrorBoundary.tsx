// @ts-nocheck
import React from 'react';
import { Alert } from '@/components/ui';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <Alert severity="error">
          <code style={{ whiteSpace: 'pre' }}>{error.stack}</code>
        </Alert>
      );
    }
    const { children } = this.props;
    return children;
  }
}

export default ErrorBoundary;
