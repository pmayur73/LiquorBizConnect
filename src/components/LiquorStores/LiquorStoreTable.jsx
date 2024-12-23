import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function LiquorStoreTable({ groupedBusinesses }) {
  const [expandedTowns, setExpandedTowns] = useState({});

  const toggleTown = (town) => {
    setExpandedTowns(prev => ({
      ...prev,
      [town]: !prev[town]
    }));
  };

  if (!groupedBusinesses || Object.keys(groupedBusinesses).length === 0) {
    return <p>No data available</p>;
  }

  return (
    <>
      {Object.entries(groupedBusinesses).map(([town, businesses]) => (
        <Card key={town} style={{ marginBottom: '20px' }}>
          <CardHeader
            title={`${town} (${businesses?.length || 0} stores)`}
            style={{ backgroundColor: '#f5f5f5', cursor: 'pointer' }}
            onClick={() => toggleTown(town)}
            action={
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTown(town);
                }}
                aria-expanded={expandedTowns[town]}
                aria-label="show more"
              >
                {expandedTowns[town] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
          />
          <Collapse in={expandedTowns[town]} timeout="auto" unmountOnExit>
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>DBA</strong></TableCell>
                      <TableCell><strong>Address</strong></TableCell>
                      <TableCell><strong>Issue Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {businesses?.map((business) => (
                      <TableRow key={business?.license_number}>
                        <TableCell>{business?.dba}</TableCell>
                        <TableCell>{`${business?.address}, ${business?.city}, ${business?.state} ${business?.zip}`}</TableCell>
                        <TableCell>{business?.issuedate ? new Date(business.issuedate).toLocaleDateString() : ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Collapse>
        </Card>
      ))}
    </>
  );
}

export default LiquorStoreTable;
