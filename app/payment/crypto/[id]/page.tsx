"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Constants
const PAYMENT_PROCESSOR_ABI = [
  "function processPayment(string appointmentId, uint256 hospitalId) public payable",
  "function isPaymentCompleted(string appointmentId) public view returns (bool)",
];
const PAYMENT_PROCESSOR_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const HOSPITAL_ID = 1;

// Types
interface PaymentState {
  loading: boolean;
  error: string | null;
  success: boolean;
  fee: number;
  transaction: string | null;
}

export default function CryptoPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    loading: false,
    error: null,
    success: false,
    fee: 0.01, // Default fee in ETH
    transaction: null,
  });

  // Function to handle crypto payment
  const handleCryptoPayment = async () => {
    if (!window.ethereum) {
      setPaymentState(prev => ({
        ...prev,
        error: "MetaMask is not installed. Please install MetaMask to proceed."
      }));
      return;
    }

    setPaymentState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Connect to contract
      const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        signer
      );
      
      // Calculate payment amount
      const paymentAmount = ethers.utils.parseEther(paymentState.fee.toString());
      
      // Execute transaction
      const tx = await contract.processPayment(
        params.id.toString(),
        HOSPITAL_ID,
        {
          value: paymentAmount,
          gasLimit: 1000000
        }
      );
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Verify payment
      const isCompleted = await contract.isPaymentCompleted(params.id.toString());
      if (!isCompleted) throw new Error("Payment verification failed");
      
      // Get hospital info for the appointment
      const appointmentResponse = await fetch(`/api/appointments/${params.id}`);
      const appointmentData = await appointmentResponse.json();
      const hospitalName = appointmentData?.hospital?.name || "the hospital";
      
      // Update backend
      await fetch(`/api/appointments/${params.id}/update-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transactionHash: tx.hash,
          status: 'completed'
        }),
      });
      
      // Dispatch custom event for payment completed
      if (typeof window !== 'undefined') {
        const customEvent = new CustomEvent('appointment_status_update', {
          detail: {
            appointmentId: params.id,
            status: 'completed',
            hospitalName,
            payment: true
          }
        });
        window.dispatchEvent(customEvent);
      }
      
      // Update state
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        success: true,
        transaction: tx.hash,
      }));
      
      // Auto redirect after success
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "An unknown error occurred"
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Crypto Payment</h1>
          
          <div className="border-b border-gray-200 pb-4">
            <p className="text-gray-600 text-sm">Appointment ID: {params.id}</p>
            <p className="text-lg font-bold mt-2">{paymentState.fee} ETH</p>
          </div>
          
          {!paymentState.success ? (
            <div className="w-full mt-6">
              <Button
                onClick={handleCryptoPayment}
                disabled={paymentState.loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-md"
              >
                {paymentState.loading ? "Processing..." : "Pay with MetaMask"}
              </Button>
              
              {paymentState.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-md text-sm">
                  {paymentState.error}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full mt-6 text-center">
              <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-md">
                Payment successful! Redirecting to dashboard...
              </div>
              {paymentState.transaction && (
                <p className="mt-4 text-xs text-gray-500">
                  Transaction: {paymentState.transaction.substring(0, 10)}...
                </p>
              )}
            </div>
          )}
          
          <button
            onClick={() => router.back()}
            className="mt-6 text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel and go back
          </button>
        </div>
      </Card>
    </div>
  );
} 