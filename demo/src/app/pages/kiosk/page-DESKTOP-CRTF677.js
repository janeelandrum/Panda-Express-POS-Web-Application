"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './kioskview.css';

// Pop-up for when you click on an item and it prompts user to pick a size
const SizeSelectionModal = ({ prices, onClose, onSelect }) => {
    const availableSizes = Object.keys(prices).filter(size => prices[size] > 0);

    return (
        <div className="modal">
            <div className="modalContent">
                <h3>Select Size</h3>
                {availableSizes.length > 0 ? (
                    availableSizes.map(size => (
                        <button key={size} onClick={() => {
                            onSelect(prices[size]);
                            onClose();
                        }}>
                            {size.charAt(0).toUpperCase() + size.slice(1)} {/* Capitalize size name */}
                        </button>
                    ))
                ) : (
                    <p>No available sizes for this item.</p>
                )}
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

// Pop-up for when user clicks 'View Order'
const OrderSummaryModal = ({ orderItems, totalAmount, onClose }) => {
    return (
        <div className="modal">
            <div className="modalContent">
                <h3>Order Summary</h3>
                <ul>
                    {orderItems.map((item, index) => (
                        <li key={index}>
                            {item.name} - ${item.price.toFixed(2)}
                        </li>
                    ))}
                </ul>
                <div className="totalAmount">Total: ${totalAmount.toFixed(2)}</div>
                <button onClick={onClose}>Cash Out</button>
            </div>
        </div>
    );
};

// Pop-up message for if the user tries to click 'View Order' but hasn't selected any items
const EmptyOrderModal = ({ onClose }) => {
    return (
        <div className="modal">
            <div className="modalContent">
                <h3>Please add at least one item to your order</h3>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default function KioskView() {
    const [activeMenu, setActiveMenu] = useState('entrees');
    const [totalAmount, setTotalAmount] = useState(0);
    const [menuItems, setMenuItems] = useState({ sides: [], entrees: [], appetizers: [], desserts: [], drinks: [] });
    const [spicyEntrees, setSpicyEntrees] = useState([]);       //EDITED
    const [wokSmartEntrees, setWokSmartEntrees] = useState([]);       //ADDED
    const [premiumEntrees, setPremiumEntrees] = useState([]);       //ADDED
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prices, setPrices] = useState({});
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [orderItems, setOrderItems] = useState([]); // To store the order items
    const [showOrderModal, setShowOrderModal] = useState(false); // To control order summary modal
    const [showEmptyOrderModal, setShowEmptyOrderModal] = useState(false); // To control empty order modal

    useEffect(() => {
        // Fetches all menu items and their prices, categorizes them by type
        const fetchMenuItems = async () => {
            try {
                const response = await axios.get('http://l