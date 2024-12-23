// src/components/LiquorStores/LiquorStoresPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
} from '@mui/material';
import axios from 'axios';
import LiquorStoreTable from './LiquorStoreTable';
import './LiquorStoreStyles.css';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function LiquorStoresPage() {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedBusinesses, setGroupedBusinesses] = useState({});
  const [selectedTown, setSelectedTown] = useState('All');
  const [towns, setTowns] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedTowns, setExpandedTowns] = useState({});
  const [maxLicensesByTown, setMaxLicensesByTown] = useState({}); // New state for max licenses

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchData();
    fetchMaxLicenses();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://data.ct.gov/resource/ngch-56tr.json', {
        params: {
          $where: "status='ACTIVE' AND credential='PACKAGE STORE LIQUOR'",
          $limit: 1500,
        },
      });

      const sortedData = response.data.sort((a, b) => a.dba.localeCompare(b.dba));
      setBusinesses(sortedData);
      setFilteredBusinesses(sortedData);

      const uniqueTowns = [...new Set(sortedData.map((business) => business.city || 'Unknown'))].sort();
      setTowns(['All', ...uniqueTowns]);

      groupByTown(sortedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch max licenses allowed per town
  const fetchMaxLicenses = async () => {
    try {
      const response = await axios.get('https://data.ct.gov/api/id/fiq7-t34m.json');
      const maxLicensesData = response.data.reduce((acc, item) => {
        acc[item.town] = item.max_stores_allowed;
        return acc;
      }, {});
      setMaxLicensesByTown(maxLicensesData);
    } catch (error) {
      console.error('Error fetching max licenses:', error);
    }
  };

  const groupByTown = useCallback((businesses) => {
    const grouped = businesses.reduce((acc, business) => {
      const town = business.city || 'Unknown';
      if (!acc[town]) acc[town] = [];
      acc[town].push(business);
      return acc;
    }, {});

    const sortedGrouped = Object.keys(grouped)
      .sort()
      .reduce((acc, town) => {
        acc[town] = grouped[town];
        return acc;
      }, {});

    setGroupedBusinesses(sortedGrouped);
  }, []);

  const filterBusinesses = useCallback(() => {
    let filtered = businesses;
    let newExpandedTowns = {};

    if (debouncedSearchTerm || selectedTown !== 'All') {
      filtered = businesses.filter((business) => {
        const matchesSearch = business.dba.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        const matchesTown = selectedTown === 'All' || business.city === selectedTown;
        if (matchesSearch && matchesTown) {
          newExpandedTowns[business.city] = true;
          return true;
        }
        return false;
      });
    }

    setFilteredBusinesses(filtered);
    groupByTown(filtered);
    setExpandedTowns(newExpandedTowns);
  }, [businesses, debouncedSearchTerm, selectedTown, groupByTown]);

  useEffect(() => {
    filterBusinesses();
  }, [filterBusinesses]);

  const handleClear = () => {
    setSearchTerm('');
    setSelectedTown('All');
    setFilteredBusinesses(businesses);
    groupByTown(businesses);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const memoizedLiquorStoreTable = useMemo(() => (
    <LiquorStoreTable 
      groupedBusinesses={groupedBusinesses}
      maxLicensesByTown={maxLicensesByTown}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      totalCount={Object.values(groupedBusinesses).reduce((sum, arr) => sum + arr.length, 0)}
    />
  ), [groupedBusinesses, maxLicensesByTown, expandedTowns, page, rowsPerPage]);

  const memoizedTownOptions = useMemo(() =>
    towns.map((town) => (
      <MenuItem key={town} value={town}>
        {town.toUpperCase()}
      </MenuItem>
    )),
    [towns]
  );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Active Connecticut Liquor Store Listings
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search by Business Name"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="town-select-label">Filter by Town</InputLabel>
              <Select
                labelId="town-select-label"
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
                label="Filter by Town"
              >
                {memoizedTownOptions}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button 
              fullWidth 
              variant="outlined" 
              color="secondary" 
              onClick={handleClear}
              size="medium"
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {memoizedLiquorStoreTable}
    </Container>
  );
}

export default LiquorStoresPage;
