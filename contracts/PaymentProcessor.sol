// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PaymentProcessor
 * @dev Contract for handling medical appointment payments
 */
contract PaymentProcessor is Ownable, ReentrancyGuard {
    // Payment details
    struct Payment {
        uint256 amount;
        uint256 timestamp;
        address payer;
        string appointmentId;
        bool completed;
    }

    // Mapping from appointment ID to payment
    mapping(string => Payment) public payments;
    
    // Standard fee for appointments in wei (0.0001 ETH)
    uint256 public appointmentFee = 100000000000000;
    
    // Hospital wallet addresses
    mapping(string => address) public hospitals;
    
    // Events
    event PaymentCompleted(string appointmentId, address indexed payer, uint256 amount, uint256 timestamp);
    event HospitalAdded(string hospitalId, address wallet);
    event FeeUpdated(uint256 newFee);
    
    constructor() {}
    
    /**
     * @dev Add or update a hospital's payment address
     * @param hospitalId Unique identifier for the hospital
     * @param wallet Hospital's wallet address
     */
    function addHospital(string memory hospitalId, address wallet) external onlyOwner {
        require(wallet != address(0), "Invalid wallet address");
        hospitals[hospitalId] = wallet;
        emit HospitalAdded(hospitalId, wallet);
    }
    
    /**
     * @dev Update the standard appointment fee
     * @param newFee New fee in wei
     */
    function updateFee(uint256 newFee) external onlyOwner {
        appointmentFee = newFee;
        emit FeeUpdated(newFee);
    }
    
    /**
     * @dev Process a payment for an appointment
     * @param appointmentId Unique identifier for the appointment
     * @param hospitalId Identifier for the hospital receiving payment
     */
    function processPayment(string memory appointmentId, string memory hospitalId) external payable nonReentrant {
        require(msg.value >= appointmentFee, "Insufficient payment amount");
        require(hospitals[hospitalId] != address(0), "Hospital not registered");
        require(payments[appointmentId].completed == false, "Payment already completed");
        
        // Create payment record
        payments[appointmentId] = Payment({
            amount: msg.value,
            timestamp: block.timestamp,
            payer: msg.sender,
            appointmentId: appointmentId,
            completed: true
        });
        
        // Transfer payment to hospital
        (bool sent, ) = hospitals[hospitalId].call{value: msg.value}("");
        require(sent, "Failed to send payment to hospital");
        
        emit PaymentCompleted(appointmentId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Check payment status
     * @param appointmentId Appointment identifier
     * @return Whether payment is completed
     */
    function isPaymentCompleted(string memory appointmentId) external view returns (bool) {
        return payments[appointmentId].completed;
    }
    
    /**
     * @dev Get payment details
     * @param appointmentId Appointment identifier
     * @return Payment details
     */
    function getPaymentDetails(string memory appointmentId) external view returns (Payment memory) {
        return payments[appointmentId];
    }
} 