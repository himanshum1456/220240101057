import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  AccessTime as TimeIcon,
  Mouse
} from '@mui/icons-material';

import { logger } from '../logger/AffordLogger';
import { getAllShortLinks, ShortLink } from '../services';

const StatsPage: React.FC = () => {
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      logger.info('StatsPage', 'Loading statistics');
      const links = getAllShortLinks();
      setShortLinks(links);
      setLoading(false);
      logger.info('StatsPage', 'Statistics loaded successfully', { totalLinks: links.length });
    } catch (err) {
      const errorMessage = 'Failed to load statistics';
      setError(errorMessage);
      setLoading(false);
      const metaError = err instanceof Error ? err.message : String(err);
      logger.error('StatsPage', errorMessage, { error: metaError });
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiryAt: string): boolean => {
    return new Date(expiryAt) < new Date();
  };

  const getStatusChip = (link: ShortLink) => {
    if (isExpired(link.expiryAt)) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (shortLinks.length === 0) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Statistics
        </Typography>
        <Alert severity="info">
          No shortened URLs found. Create some URLs on the Shorten page to see statistics here.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Statistics
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View detailed statistics for all your shortened URLs.
      </Typography>

      {shortLinks.map((link) => (
        <Card key={link.shortcode} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" component="div">
                  {link.shortcode}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                  {link.longUrl}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {getStatusChip(link)}
                <Chip
                  icon={<Mouse />}
                  label={`${link.clicks.length} clicks`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(link.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Expires: {formatDate(link.expiryAt)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <LinkIcon fontSize="small" color="primary" />
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                http://localhost:3000/{link.shortcode}
              </Typography>
            </Box>

            {link.clicks.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">
                    Click Details ({link.clicks.length} clicks)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Referrer</TableCell>
                          <TableCell>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {link.clicks
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((click, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {formatDate(click.timestamp)}
                              </TableCell>
                              <TableCell>
                                {click.referrer === 'direct' ? (
                                  <Chip label="Direct" size="small" variant="outlined" />
                                ) : (
                                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                    {click.referrer}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {click.geo ? (
                                  <Typography variant="body2">
                                    {click.geo}
                                  </Typography>
                                ) : (
                                  <Chip label="Unknown" size="small" variant="outlined" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography variant="body2">
            <strong>Total URLs:</strong> {shortLinks.length}
          </Typography>
          <Typography variant="body2">
            <strong>Total Clicks:</strong> {shortLinks.reduce((sum, link) => sum + link.clicks.length, 0)}
          </Typography>
          <Typography variant="body2">
            <strong>Active URLs:</strong> {shortLinks.filter(link => !isExpired(link.expiryAt)).length}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StatsPage;
