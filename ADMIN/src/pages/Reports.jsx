import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert } from 'react-bootstrap';
import { FaChartLine, FaFileAlt, FaMoneyBillWave, FaUtensils, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set default date range when component mounts
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(lastWeek.toISOString().split('T')[0]);
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/reports`, {
        params: {
          type: reportType,
          startDate,
          endDate
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();
    let startDateValue = new Date();
    
    switch(range) {
      case 'today':
        startDateValue = today;
        break;
      case 'week':
        startDateValue.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDateValue.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDateValue.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDateValue.setDate(today.getDate() - 7);
    }
    
    setStartDate(startDateValue.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const renderReportContent = () => {
    if (loading) return <Alert variant="info">Loading report data...</Alert>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!reportData) return <Alert variant="secondary">Select report options and click "Generate Report" to view data</Alert>;

    // Placeholder for actual report rendering
    return (
      <div className="mt-4">
        <h4>Report Results</h4>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Total</th>
              {reportType === 'sales' && <th>Orders</th>}
              {reportType === 'inventory' && <th>Items</th>}
              {reportType === 'customer' && <th>Customers</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="3" className="text-center">Sample data will be displayed here</td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2><FaChartLine className="me-2" />Reports Dashboard</h2>
          <p className="text-muted">Generate and analyze restaurant reports</p>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Header>Report Options</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select 
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="sales">Sales Report</option>
                    <option value="inventory">Inventory Report</option>
                    <option value="customer">Customer Report</option>
                    <option value="menu">Menu Performance</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date Range</Form.Label>
                  <Form.Select 
                    value={dateRange} 
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                  >
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </Form.Select>
                </Form.Group>

                {dateRange === 'custom' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                      />
                    </Form.Group>
                  </>
                )}

                <Button 
                  variant="primary" 
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <Card>
            <Card.Header>
              <Row>
                <Col>
                  {reportType === 'sales' && <><FaMoneyBillWave className="me-2" />Sales Report</>}
                  {reportType === 'inventory' && <><FaUtensils className="me-2" />Inventory Report</>}
                  {reportType === 'customer' && <><FaUsers className="me-2" />Customer Report</>}
                  {reportType === 'menu' && <><FaFileAlt className="me-2" />Menu Performance</>}
                </Col>
                <Col className="text-end">
                  <small className="text-muted">
                    {startDate} to {endDate}
                  </small>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {renderReportContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
