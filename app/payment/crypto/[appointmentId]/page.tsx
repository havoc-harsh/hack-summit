"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// ABI and Contract Configuration
const PAYMENT_PROCESSOR_ABI = [
  "function processPayment(string memory appointmentId, string memory hospitalId) external payable",
  "function appointmentFee() external view returns (uint256)",
  "function isPaymentCompleted(string memory appointmentId) external view returns (bool)"
];

const SEPOLIA_CONFIG = {
  chainId: "0xaa36a7", // 11155111 in hex
  chainName: "Sepolia Test Network",
  rpcUrl: process.env.NEXT_PUBLIC_NETWORK_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
  blockExplorerUrl: "https://sepolia.etherscan.io"
};

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const HOSPITAL_ID = process.env.NEXT_PUBLIC_HOSPITAL_ID!;

interface PaymentState {
  processing: boolean;
  success: boolean;
  error: string | null;
  fee: string;
  txHash: string | null;
}

export default function CryptoPaymentPage() {
  const params = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    processing: false,
    success: false,
    error: null,
    fee: "0.0001",
    txHash: null
  });
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>('');

  // Initialize Ethereum connection
  useEffect(() => {
    const initEthereum = async () => {
      try {
        if (!window.ethereum) {
          setPaymentState(prev => ({ ...prev, error: "MetaMask not detected" }));
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // Handle network changes
        const checkNetwork = async () => {
          const network = await provider.getNetwork();
          if (network.chainId !== 11155111) {
            await switchToSepoliaNetwork();
          }
        };

        // Handle account changes
        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length > 0) setAccount(accounts[0]);
        };

        window.ethereum.on('chainChanged', checkNetwork);
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        // Initial setup
        await checkNetwork();
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const signer = provider.getSigner();
          setSigner(signer);
          loadContractFee(provider);
        }

        return () => {
          window.ethereum?.removeListener('chainChanged', checkNetwork);
          window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        };
      } catch (error) {
        handleEthereumError(error);
      }
    };

    initEthereum();
  }, []);

  const loadContractFee = async (provider: ethers.providers.Web3Provider) => {
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        provider
      );
      const fee = await contract.appointmentFee();
      setPaymentState(prev => ({ ...prev, fee: ethers.utils.formatEther(fee) }));
    } catch (error) {
      handleEthereumError(error);
    }
  };

  const switchToSepoliaNetwork = async () => {
    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }]
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CONFIG.chainId,
              chainName: SEPOLIA_CONFIG.chainName,
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [SEPOLIA_CONFIG.rpcUrl],
              blockExplorerUrls: [SEPOLIA_CONFIG.blockExplorerUrl]
            }]
          });
        } catch (addError) {
          throw new Error("Failed to add Sepolia network");
        }
      }
      throw new Error("Failed to switch to Sepolia network");
    }
  };

  const handlePayment = async () => {
    if (!signer || !account) {
      setPaymentState(prev => ({ ...prev, error: "Wallet not connected" }));
      return;
    }

    // Verify network before transaction
    try {
      const network = await provider!.getNetwork();
      if (network.chainId !== 11155111) {
        await switchToSepoliaNetwork();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      handleEthereumError(error);
      return;
    }

    setPaymentState(prev => ({ ...prev, processing: true, error: null }));

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        signer
      );

      // Validate contract deployment
      const code = await provider!.getCode(CONTRACT_ADDRESS);
      if (!code || code === '0x') {
        throw new Error("Contract not deployed");
      }

      // Execute transaction
      const tx = await contract.processPayment(
        params.appointmentId.toString(),
        HOSPITAL_ID,
        {
          value: ethers.utils.parseEther(paymentState.fee),
          gasLimit: 300000
        }
      );

      setPaymentState(prev => ({ ...prev, txHash: tx.hash }));
      
      await tx.wait();
      
      // Verify payment
      const isCompleted = await contract.isPaymentCompleted(params.appointmentId.toString());
      if (!isCompleted) throw new Error("Payment verification failed");

      // Update backend
      await fetch(`/api/appointments/${params.appointmentId}/update-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'paid',
          transactionHash: tx.hash
        })
      });

      setPaymentState(prev => ({ ...prev, success: true }));

    } catch (error) {
      handleEthereumError(error);
    } finally {
      setPaymentState(prev => ({ ...prev, processing: false }));
    }
  };

  const handleEthereumError = (error: unknown) => {
    const defaultMessage = "Ethereum operation failed";
    if (error instanceof Error) {
      setPaymentState(prev => ({
        ...prev,
        error: error.message || defaultMessage
      }));
    } else {
      setPaymentState(prev => ({ ...prev, error: defaultMessage }));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Crypto Payment</h1>
          <Link href="/" className="text-sky-600 hover:text-sky-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <p className="text-gray-600 text-sm">Appointment ID: {params.appointmentId}</p>
          <p className="text-lg font-bold mt-2">{paymentState.fee} ETH</p>
        </div>

        {paymentState.success ? (
          <SuccessView txHash={paymentState.txHash} onReturn={() => router.push('/')} />
        ) : (
          <PaymentFlow 
            account={account}
            processing={paymentState.processing}
            error={paymentState.error}
            onConnect={async () => {
              await switchToSepoliaNetwork();
              window.location.reload();
            }}
            onSubmit={handlePayment}
          />
        )}
      </motion.div>
    </div>
  );
}

const SuccessView = ({ txHash, onReturn }: { txHash: string | null; onReturn: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6 text-center"
  >
    <div className="flex justify-center">
      <div className="bg-green-100 p-4 rounded-full">
        <Check className="w-8 h-8 text-green-500" />
      </div>
    </div>
    <h2 className="text-xl font-bold text-green-600">Payment Successful!</h2>
    {txHash && (
      <div className="transaction-info">
        <p className="text-sm text-gray-600">Transaction Hash:</p>
        <code className="text-xs break-all">{txHash}</code>
      </div>
    )}
    <Button
      onClick={onReturn}
      className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white py-4 rounded-xl"
    >
      Return to Dashboard
    </Button>
  </motion.div>
);

const PaymentFlow = ({ account, processing, error, onConnect, onSubmit }: {
  account: string;
  processing: boolean;
  error: string | null;
  onConnect: () => Promise<void>;
  onSubmit: () => Promise<void>;
}) => (
  <div className="space-y-6">
    {!account ? (
      <ConnectButton onConnect={onConnect} />
    ) : (
      <PaymentForm 
        account={account}
        processing={processing}
        onSubmit={onSubmit}
      />
    )}

    {error && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-50 rounded-lg"
      >
        <AlertCircle className="w-4 h-4" />
        <p>{error}</p>
      </motion.div>
    )}

    <NetworkNotice />
  </div>
);

const ConnectButton = ({ onConnect }: { onConnect: () => Promise<void> }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Button
      onClick={onConnect}
      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg rounded-xl relative overflow-hidden group flex items-center justify-center gap-3"
    >
      <Wallet className="w-5 h-5" />
      <span>Connect MetaMask</span>
    </Button>
  </motion.div>
);

const PaymentForm = ({ account, processing, onSubmit }: {
  account: string;
  processing: boolean;
  onSubmit: () => Promise<void>;
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div className="flex items-center justify-between bg-purple-50 p-4 rounded-xl">
      <div className="flex items-center gap-3">
        <Wallet className="text-purple-600 w-5 h-5" />
        <div>
          <p className="text-sm font-medium">Connected Wallet</p>
          <p className="text-xs text-gray-500">
            {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
          </p>
        </div>
      </div>
    </div>

    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={onSubmit}
        disabled={processing}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg rounded-xl relative overflow-hidden group flex items-center justify-center gap-3"
      >
        {processing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Pay with Ethereum"
        )}
      </Button>
    </motion.div>
  </motion.div>
);

const NetworkNotice = () => (
  <div className="text-center text-sm p-3 bg-blue-50 rounded-lg border border-blue-200">
    <p className="font-medium text-blue-700">
      🌐 Connected to Sepolia Test Network
    </p>
    <p className="text-blue-600 mt-1">
      Transactions will appear on{' '}
      <a
        href="https://sepolia.etherscan.io"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        Sepolia Etherscan
      </a>
    </p>
  </div>
);