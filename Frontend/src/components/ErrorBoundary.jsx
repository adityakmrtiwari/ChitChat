import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col bg-cyber-night scrollbar-cyber relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="cyber-bg-element-1"></div>
            <div className="cyber-bg-element-2"></div>
            <div className="cyber-bg-element-3"></div>
          </div>
          
          <main className="flex-1 flex items-center justify-center p-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="glass-card">
                <CardHeader className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                    className="mx-auto"
                  >
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">⚠️</span>
                    </div>
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</CardTitle>
                    <CardDescription className="text-gray-300">
                      We encountered an unexpected error. Please try again.
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center space-y-4">
                    <Button
                      onClick={this.handleReload}
                      className="w-full gradient-btn-primary"
                    >
                      Reload Page
                    </Button>
                    
                    <Button
                      onClick={this.handleGoHome}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Go to Home
                    </Button>
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-4 text-left">
                      <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                        Error Details (Development)
                      </summary>
                      <div className="mt-2 p-3 bg-black/50 rounded-lg text-xs text-red-400 font-mono overflow-auto max-h-40">
                        <div className="mb-2">
                          <strong>Error:</strong> {this.state.error.toString()}
                        </div>
                        <div>
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                        </div>
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 