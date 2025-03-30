"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Define the context shape
interface EthContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  network: ethers.providers.Network | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Create the context with a default value
const EthContext = createContext<EthContextType>({
  provider: null,
  signer: null,
  account: null,
  network: null,
  balance: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
});

// Provider component
export function EthProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<ethers.providers.Network | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const network = await provider.getNetwork();
            const signer = provider.getSigner();
            const balance = await provider.getBalance(accounts[0]);
            
            setProvider(provider);
            setSigner(signer);
            setAccount(accounts[0]);
            setNetwork(network);
            setBalance(ethers.utils.formatEther(balance));
            setIsConnected(true);
          }
        } catch (err) {
          console.error('Failed to check existing connection:', err);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Setup event listeners for account and network changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && isConnected) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          
          if (provider) {
            const balance = await provider.getBalance(accounts[0]);
            setBalance(ethers.utils.formatEther(balance));
          }
        }
      };
      
      const handleChainChanged = () => {
        window.location.reload();
      };
      
      const handleDisconnect = () => {
        disconnect();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [isConnected, provider, account]);

  // Connect to MetaMask
  const connect = async () => {
    setError(null);
    setIsConnecting(true);
    
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Request account access
        await provider.send('eth_requestAccounts', []);
        
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(account);
        
        setProvider(provider);
        setSigner(signer);
        setAccount(account);
        setNetwork(network);
        setBalance(ethers.utils.formatEther(balance));
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to connect to wallet:', err);
        setError('Failed to connect to MetaMask');
      }
    } else {
      setError('MetaMask not detected. Please install MetaMask to continue.');
    }
    
    setIsConnecting(false);
  };

  // Disconnect from MetaMask
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setNetwork(null);
    setBalance(null);
    setIsConnected(false);
  };

  const value = {
    provider,
    signer,
    account,
    network,
    balance,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  };

  return <EthContext.Provider value={value}>{children}</EthContext.Provider>;
}

// Custom hook to use the Ethereum context
export function useEthereum() {
  return useContext(EthContext);
} 