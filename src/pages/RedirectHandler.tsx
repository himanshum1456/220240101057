import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Error as ErrorIcon,
  AccessTime as TimeIcon,
  Home as HomeIcon
} from '@mui/icons-material';

import { logger } from '../logger/AffordLogger';
import { getShortLink, recordClick, getCurrentLocation } from '../services';

const RedirectHandler: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'not-found' | 'expired'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleRedirect();
  }, [shortcode]);

  const handleRedirect = async () => {
    if (!shortcode) {
      setStatus('not-found');
      logger.warn('RedirectHandler', 'No shortcode provided');
      return;
    }

    try {
      logger.info('RedirectHandler', 'Processing redirect request', { shortcode });

      const shortLink = getShortLink(shortcode);
      
      if (!shortLink) {
        setStatus('not-found');
        logger.warn('RedirectHandler', 'Shortcode not found', { shortcode });
        return;
      }

      const now = new Date();
      const expiryDate = new Date(shortLink.expiryAt);

      if (now > expiryDate) {
        setStatus('expired');
        logger.warn('RedirectHandler', 'Shortcode expired', { 
          shortcode, 
          expiryAt: shortLink.expiryAt 
        });
        return;
      }

      // Record the click with geolocation
      try {
        const geo = await getCurrentLocation();
        recordClick(shortcode, document.referrer || 'direct');
        
        // Update the click record with geolocation if available
        if (geo) {
          const shortLink = getShortLink(shortcode);
          if (shortLink && shortLink.clicks.length > 0) {
            const lastClick = shortLink.clicks[shortLink.clicks.length - 1];
            lastClick.geo = geo;
          }
        }
      } catch (geoError) {
        const geoErrMsg = geoError instanceof Error ? geoError.message : String(geoError);
        logger.warn('RedirectHandler', 'Failed to get geolocation', { 
          error: geoErrMsg 
        });
        recordClick(shortcode, document.referrer || 'direct');
      }

      logger.info('RedirectHandler', 'Redirecting to long URL', { 
        shortcode, 
        longUrl: shortLink.longUrl 
      });

      setStatus('redirecting');
      
      // Redirect after a short delay to show the redirecting state
      setTimeout(() => {
        window.location.href = shortLink.longUrl;
      }, 1000);

    } catch (error) {
      setError('An error occurred while processing the redirect');
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error('RedirectHandler', 'Redirect failed', { 
        error: errMsg, 
        shortcode 
      });
    }
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Processing redirect...
        </Typography>
      </Box>
    );
  }

  if (status === 'redirecting') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Redirecting...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          You will be redirected shortly.
        </Typography>
      </Box>
    );
  }

  if (status === 'not-found') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The short URL you're looking for doesn't exist or has been removed.
            </Typography>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              startIcon={<HomeIcon />}
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (status === 'expired') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <TimeIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Link Expired
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This short URL has expired and is no longer available.
            </Typography>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              startIcon={<HomeIcon />}
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Alert severity="error" sx={{ maxWidth: 500, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Error
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="outlined"
            sx={{ mt: 2 }}
            startIcon={<HomeIcon />}
          >
            Go to Home
          </Button>
        </Alert>
      </Box>
    );
  }

  return null;
};

export default RedirectHandler;

