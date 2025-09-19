import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';

import { logger } from '../logger/AffordLogger';
import {
  validateUrl,
  validateShortcode,
  validateValidityMinutes,
  generateShortcode,
  isShortcodeUnique,
  addShortLink,
  copyToClipboard
} from '../services';

interface UrlRow {
  id: string;
  longUrl: string;
  validityMinutes: string;
  customShortcode: string;
  shortcode?: string;
  expiryAt?: string;
  shortUrl?: string;
}

const ShortenerPage: React.FC = () => {
  const [urlRows, setUrlRows] = useState<UrlRow[]>([
    { id: '1', longUrl: '', validityMinutes: '30', customShortcode: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const showSnackbar = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const addUrlRow = () => {
    if (urlRows.length >= 5) {
      showSnackbar('Maximum 5 URLs allowed');
      logger.warn('ShortenerPage', 'Attempted to add more than 5 URLs');
      return;
    }

    const currentMax = urlRows.length > 0 ? Math.max(...urlRows.map(row => parseInt(row.id, 10))) : 0;
    const newId = String(currentMax + 1);
    setUrlRows([...urlRows, { 
      id: newId, 
      longUrl: '', 
      validityMinutes: '30', 
      customShortcode: '' 
    }]);
    
    logger.info('ShortenerPage', 'URL row added', { totalRows: urlRows.length + 1 });
  };

  const removeUrlRow = (id: string) => {
    setUrlRows(urlRows.filter(row => row.id !== id));
    const newErrors = { ...errors };
    delete newErrors[`${id}-longUrl`];
    delete newErrors[`${id}-validityMinutes`];
    delete newErrors[`${id}-customShortcode`];
    setErrors(newErrors);
    
    logger.info('ShortenerPage', 'URL row removed', { rowId: id });
  };

  const updateUrlRow = (id: string, field: keyof Omit<UrlRow, 'id' | 'shortcode' | 'expiryAt' | 'shortUrl'>, value: string) => {
    setUrlRows(urlRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));

    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[`${id}-${field}`];
    setErrors(newErrors);
  };

  const validateRow = (row: UrlRow): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate long URL
    if (!row.longUrl.trim()) {
      newErrors[`${row.id}-longUrl`] = 'URL is required';
    } else if (!validateUrl(row.longUrl)) {
      newErrors[`${row.id}-longUrl`] = 'Must be a valid http:// or https:// URL';
    }

    // Validate validity minutes
    if (row.validityMinutes && !validateValidityMinutes(row.validityMinutes)) {
      newErrors[`${row.id}-validityMinutes`] = 'Must be a positive integer';
    }

    // Validate custom shortcode
    if (row.customShortcode && !validateShortcode(row.customShortcode)) {
      newErrors[`${row.id}-customShortcode`] = 'Must be 4-12 alphanumeric characters';
    } else if (row.customShortcode && !isShortcodeUnique(row.customShortcode)) {
      newErrors[`${row.id}-customShortcode`] = 'Shortcode already exists';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const shortenUrl = async (row: UrlRow) => {
    if (!validateRow(row)) {
      logger.warn('ShortenerPage', 'Validation failed for URL row', { rowId: row.id, errors: errors });
      return;
    }

    try {
      let shortcode = row.customShortcode;
      
      if (!shortcode) {
        // Generate unique shortcode
        do {
          shortcode = generateShortcode();
        } while (!isShortcodeUnique(shortcode));
      }

      const validityMinutes = parseInt(row.validityMinutes) || 30;
      const createdAt = new Date();
      const expiryAt = new Date(createdAt.getTime() + validityMinutes * 60 * 1000);

      const shortLink = {
        shortcode,
        longUrl: row.longUrl,
        createdAt: createdAt.toISOString(),
        expiryAt: expiryAt.toISOString(),
        clicks: []
      };

      addShortLink(shortLink);

      const shortUrl = `http://localhost:3000/${shortcode}`;

      // Update the row with results
      setUrlRows(urlRows.map(r => 
        r.id === row.id 
          ? { 
              ...r, 
              shortcode, 
              shortUrl, 
              expiryAt: expiryAt.toISOString() 
            } 
          : r
      ));

      logger.info('ShortenerPage', 'URL shortened successfully', { 
        shortcode, 
        longUrl: row.longUrl,
        validityMinutes 
      });

      showSnackbar('URL shortened successfully!');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error('ShortenerPage', 'Failed to shorten URL', { 
        error: errMsg, 
        rowId: row.id 
      });
      showSnackbar('Failed to shorten URL');
    }
  };

  const copyShortUrl = async (shortUrl: string) => {
    const success = await copyToClipboard(shortUrl);
    if (success) {
      showSnackbar('Copied to clipboard!');
      logger.info('ShortenerPage', 'Short URL copied to clipboard', { shortUrl });
    } else {
      showSnackbar('Failed to copy to clipboard');
    }
  };

  const shortenAll = async () => {
    logger.info('ShortenerPage', 'Shorten all URLs requested');
    
    for (const row of urlRows) {
      if (row.longUrl.trim() && !row.shortcode) {
        await shortenUrl(row);
      }
    }
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          URL Shortener
        </Typography>
        <Typography variant="subtitle1" paragraph>
          Shorten up to 5 URLs with custom validity periods and shortcodes.
        </Typography>
      </Card>

      {urlRows.map((row, index) => (
        <Card key={row.id} sx={{ mb: 2, p: 1 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Long URL *"
                  value={row.longUrl}
                  onChange={(e) => updateUrlRow(row.id, 'longUrl', e.target.value)}
                  error={!!errors[`${row.id}-longUrl`]}
                  helperText={errors[`${row.id}-longUrl`]}
                  placeholder="https://example.com"
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Validity (minutes)"
                  type="number"
                  value={row.validityMinutes}
                  onChange={(e) => updateUrlRow(row.id, 'validityMinutes', e.target.value)}
                  error={!!errors[`${row.id}-validityMinutes`]}
                  helperText={errors[`${row.id}-validityMinutes`]}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Custom Shortcode"
                  value={row.customShortcode}
                  onChange={(e) => updateUrlRow(row.id, 'customShortcode', e.target.value)}
                  error={!!errors[`${row.id}-customShortcode`]}
                  helperText={errors[`${row.id}-customShortcode`]}
                  placeholder="mycode123"
                />
              </Grid>
              
              <Grid item xs={12} sm={1}>
                <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'flex-start' }}>
                  <Button
                    variant="contained"
                    onClick={() => shortenUrl(row)}
                    disabled={!row.longUrl.trim()}
                    size="small"
                  >
                    Shorten
                  </Button>
                  {urlRows.length > 1 && (
                    <IconButton
                      onClick={() => removeUrlRow(row.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            </Grid>

            {row.shortUrl && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Shortened URL:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LinkIcon color="primary" />
                    <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                      {row.shortUrl}
                    </Typography>
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        onClick={() => copyShortUrl(row.shortUrl!)}
                        size="small"
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Expires: {new Date(row.expiryAt!).toLocaleString()}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addUrlRow}
          disabled={urlRows.length >= 5}
        >
          Add URL ({urlRows.length}/5)
        </Button>
        
        <Button
          variant="contained"
          onClick={shortenAll}
          disabled={urlRows.every(row => !row.longUrl.trim() || !!row.shortcode)}
        >
          Shorten All
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ShortenerPage;
