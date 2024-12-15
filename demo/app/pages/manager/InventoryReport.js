import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './InventoryReport.module.css';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

const InventoryReport = ({ onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productUsage, setProductUsage] = useState([]);
  const [restockReport, setRestockReport] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [isProductUsageReport, setIsProductUsageReport] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemName, setDeleteItemName] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const chartRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inventoryId, setInventoryId] = useState('');
  const [updatedCost, setUpdatedCost] = useState('');
  
  const fetchProductUsageReport = async () => {
    if (!startDate || !endDate) {
      setAlertMessage('Please enter both start and end dates.');
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios.get('/api/inventory/product-usage', {
        params: { startDate, endDate },
      });
      setProductUsage(response.data.productUsage);
      setIsReportVisible(true);
      setIsProductUsageReport(true);
    } catch (error) {
      console.error('Error fetching product usage report:', error.message);
      setAlertMessage('Error fetching product usage data.');
      setShowAlert(true);
    }
  };

  const fetchRestockReport = async () => {
    try {
      const response = await axios.get('/api/inventory/restock-report');
      setRestockReport(response.data.restockReport);
      setIsReportVisible(true);
      setIsProductUsageReport(false);
    } catch (error) {
      console.error('Error fetching restock report:', error.message);
      setAlertMessage('Error fetching restock data.');
      setShowAlert(true);
    }
  };

  const handleRestock = async () => {
    try {
      const response = await axios.post('/api/inventory/restock');
      setAlertMessage(response.data.message);
      setShowAlert(true);
      fetchRestockReport();
    } catch (error) {
      console.error('Error restocking inventory:', error.message);
      setAlertMessage('Error during restocking.');
      setShowAlert(true);
    }
  };

  // Functions to open and close the delete modal
  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteItemName('');
    setDeleteErrorMessage('');
  };

  // Function to handle deleting an inventory item
  const handleDeleteItem = async () => {
    if (!deleteItemName) {
      setDeleteErrorMessage('Please enter the name of the inventory item to delete');
      return;
    }
    console.log("Deleting item:", deleteItemName);
    try {
      
      const response = await axios.post('/api/inventory/delete-item', {
        name: deleteItemName,
      });
      setAlertMessage(response.data.message);
      setShowAlert(true);
      closeDeleteModal();
      fetchRestockReport();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      setDeleteErrorMessage('Failed to delete inventory item');
    }
  };

  const closeAlert = () => setShowAlert(false);
  const goBack = () => {
    setIsReportVisible(false);
    setProductUsage([]);
    setRestockReport([]);
    setAlertMessage('');
    setShowAlert(false); 
  };

  // Create the chart after data is fetched
  useEffect(() => {
    if (chartRef.current && restockReport.length > 0) {
      const ctx = chartRef.current.getContext('2d');

      // Destroy any previous chart instance to prevent duplication
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      // Create new chart instance
      chartRef.current.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: restockReport.map(item => item.name),
          datasets: [
            {
              label: 'Current Quantity',
              data: restockReport.map(item => item.quantity),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
            {
              label: 'Minimum Required Quantity',
              data: restockReport.map(item => item.minRequiredQuantity),
              type: 'line',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              pointRadius: 5,
              fill: false,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [restockReport]);

  // Open the popup
  const openPopup = () => {
    setIsOpen(true);
  };

  // Close the popup
  const closePopup = () => {
    setIsOpen(false);
    setInventoryId('');
    setUpdatedCost('');
  };

  const popupStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  
  const popupContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Inventory ID:', inventoryId);
    console.log('Updated Cost:', updatedCost);
    try {
      // Make the API request to update the unit cost using axios
      const response = await axios.put(
        '/api/update-unit-cost',
        { 
          inventoryId, 
          newUnitCost: updatedCost 
        },
        {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.status === 200) {
      // Success - display success message
      console.log('Success');
      setAlertMessage('Successfully updated Inventory Unit Price');
    } else {
      // Error - display error message
      console.log('Error');
    }
  } catch (err) {
    console.error('Error:', err);
  }
  closePopup();
};

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <h2>Inventory Report</h2>

        {/* Display the Report Buttons when no report is visible */}
        {!isReportVisible && (
          <div>
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={fetchProductUsageReport} className={styles.generateReportButton}>
              Generate Product Usage Report
            </button>
            <button onClick={fetchRestockReport} className={styles.generateReportButton}>
              Fetch Restock Report
            </button>
            <button onClick={openPopup} className={styles.generateReportButton}>
              Change Unit Cost
            </button>
          </div>
        )}

        {/* Render the Back Button when a report is visible */}
        {isReportVisible && (
          <button onClick={goBack} className={styles.backButton}>
            Back
          </button>
        )}

        {/* Display Product Usage Report */}
        {isProductUsageReport && productUsage.length > 0 && (
          <div className={styles.reportContent}>
            <h3>Product Usage Report</h3>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Inventory Item</th>
                  <th>Amount Used</th>
                </tr>
              </thead>
              <tbody>
                {productUsage.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.amountUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Display Restock Report */}
        {!isProductUsageReport && restockReport.length > 0 && (
          <div className={styles.reportContent}>
            <h3>Restock Report</h3>

            {/* Chart Container */}
            <div style={{ height: '400px', width: '100%' }}>
              <canvas ref={chartRef}></canvas>
            </div>

            {/* Restock Table */}
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Inventory Item</th>
                  <th>Current Quantity</th>
                  <th>Minimum Required Quantity</th>
                </tr>
              </thead>
              <tbody>
                {restockReport.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.minRequiredQuantity}</td>
                  </tr>
        ))}
      </tbody>
    </table>

    {/* Restock Inventory Button */}
    <button onClick={handleRestock} className={styles.restockButton}>
      Restock Inventory
    </button>

    <button onClick={openDeleteModal} className={styles.deleteButton}>
      Delete Inventory Item
    </button>
  </div>
  )}
  {/* Delete Item Modal */}
  {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <h2>Confirm</h2>
            <input
              type="text"
              placeholder="Enter inventory item name"
              value={deleteItemName}
              onChange={(e) => setDeleteItemName(e.target.value)}
              className={styles.inputField}
            />
            {deleteErrorMessage && <p className={styles.error}>{deleteErrorMessage}</p>}
            <div className={styles.modalButtonContainer}>
              <button onClick={handleDeleteItem} className={styles.confirmDeleteButton}>
                Delete Item
              </button>
              <button onClick={closeDeleteModal} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

        {showAlert && <div className={styles.modalAlert}>{alertMessage}</div>}
      </div>

      {isOpen && (
        <div className={styles.popupStyle}>
          <div className={styles.popupContentStyle}>
            <h3>Update Cost</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Inventory ID:</label>
                <input
                  type="text"
                  value={inventoryId}
                  onChange={(e) => setInventoryId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Updated Cost:</label>
                <input
                  type="number"
                  value={updatedCost}
                  onChange={(e) => setUpdatedCost(e.target.value)}
                  required
                />
              </div>
              <div>
                <button type="submit">Update</button>
                <button type="button" onClick={closePopup}>
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReport;