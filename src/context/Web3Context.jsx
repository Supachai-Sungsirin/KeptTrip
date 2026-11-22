import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import KeptTripFundABI from '../contracts/KeptTripFundABI.json';
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX, SEPOLIA_RPC, DEFAULT_CONTRACT_ADDRESS } from '../config/constants';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ล้างค่า demo mode และ contract address เก่าในเครื่อง เพื่อบังคับใช้สัญญาที่ Deploy จริง
    localStorage.removeItem('kepttrip_demo_mode');
    localStorage.removeItem('kepttrip_contract_address');
  }, []);

  const isSepolia = chainId === SEPOLIA_CHAIN_ID;

  // บันทึกการเปลี่ยนแปลง Contract Address
  const updateContractAddress = (newAddr) => {
    setContractAddress(newAddr);
    localStorage.setItem('kepttrip_contract_address', newAddr);
    if (newAddr && newAddr !== DEFAULT_CONTRACT_ADDRESS && ethers.isAddress(newAddr)) {
      setIsDemoMode(false);
      localStorage.setItem('kepttrip_demo_mode', 'false');
    }
  };

  const toggleDemoMode = (val) => {
    const nextVal = typeof val === 'boolean' ? val : !isDemoMode;
    setIsDemoMode(nextVal);
    localStorage.setItem('kepttrip_demo_mode', nextVal.toString());
  };

  // ตรวจสอบสถานะการเชื่อมต่อครั้งแรก (รันครั้งเดียวเมื่อโหลด หรือเมื่อ contractAddress เปลี่ยน)
  useEffect(() => {
    // กำหนด Read-only Contract เป็นค่าเริ่มต้นเพื่อให้สามารถอ่านข้อมูลทริปได้แม้ยังไม่ได้เชื่อมต่อกระเป๋า
    if (contractAddress && ethers.isAddress(contractAddress) && contractAddress !== ethers.ZeroAddress) {
      try {
        const readOnlyProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        setContract(new ethers.Contract(contractAddress, KeptTripFundABI, readOnlyProvider));
      } catch (err) {
        console.warn("Could not setup read-only provider:", err);
      }
    }

    if (typeof window === 'undefined' || !window.ethereum) return;

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(browserProvider);

    // ดึงค่า Chain ID
    browserProvider.getNetwork().then((network) => {
      setChainId(Number(network.chainId));
    }).catch(console.error);

    // ตรวจสอบว่าผู้ใช้เคยกด Disconnect ด้วยตนเองหรือไม่
    const isManuallyDisconnected = localStorage.getItem('kepttrip_disconnected') === 'true';

    if (!isManuallyDisconnected) {
      browserProvider.listAccounts().then(async (accounts) => {
        if (accounts.length > 0) {
          const signerInstance = await browserProvider.getSigner();
          const userAddr = typeof accounts[0] === 'string' ? accounts[0] : (accounts[0].address || (await signerInstance.getAddress()));
          setAccount(userAddr);
          setSigner(signerInstance);

          if (contractAddress && ethers.isAddress(contractAddress) && contractAddress !== ethers.ZeroAddress) {
            const contractInstance = new ethers.Contract(contractAddress, KeptTripFundABI, signerInstance);
            setContract(contractInstance);
          }
        }
      }).catch(console.error);
    }

    // ฟัง Event เมื่อผู้ใช้สลับกระเป๋าใน MetaMask
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        // หากผู้ใช้สลับบัญชีใน MetaMask ให้ล้างสถานะ disconnected
        localStorage.removeItem('kepttrip_disconnected');
        setAccount(accounts[0]);
        try {
          const signerInstance = await browserProvider.getSigner();
          setSigner(signerInstance);
          if (contractAddress && ethers.isAddress(contractAddress) && contractAddress !== ethers.ZeroAddress) {
            setContract(new ethers.Contract(contractAddress, KeptTripFundABI, signerInstance));
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setAccount(null);
        setSigner(null);
        if (contractAddress && ethers.isAddress(contractAddress) && contractAddress !== ethers.ZeroAddress) {
          try {
            const readOnlyProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
            setContract(new ethers.Contract(contractAddress, KeptTripFundABI, readOnlyProvider));
          } catch {
            setContract(null);
          }
        }
      }
    };

    const handleChainChanged = (hexChainId) => {
      setChainId(parseInt(hexChainId, 16));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [contractAddress]);

  // เชื่อมต่อ MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("กรุณาติดตั้งส่วนขยาย MetaMask Wallet เพื่อเชื่อมต่อ");
      console.warn("MetaMask extension is not installed.");
      return;
    }
    setIsConnecting(true);
    setError(null);

    try {
      localStorage.removeItem('kepttrip_disconnected');
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const signerInstance = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setAccount(accounts[0]);
      setSigner(signerInstance);
      setChainId(Number(network.chainId));

      if (contractAddress && ethers.isAddress(contractAddress) && contractAddress !== ethers.ZeroAddress) {
        setContract(new ethers.Contract(contractAddress, KeptTripFundABI, signerInstance));
      }
    } catch (err) {
      console.error("Connect wallet error:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // ตัดการเชื่อมต่อกระเป๋า (Disconnect Wallet)
  const disconnectWallet = () => {
    localStorage.setItem('kepttrip_disconnected', 'true');
    setAccount(null);
    setSigner(null);
    if (contractAddress && ethers.isAddress(contractAddress) && contractAddress !== ethers.ZeroAddress) {
      try {
        const readOnlyProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        setContract(new ethers.Contract(contractAddress, KeptTripFundABI, readOnlyProvider));
      } catch {
        setContract(null);
      }
    } else {
      setContract(null);
    }
  };

  // สลับไปยังเครือข่าย Sepolia
  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID_HEX,
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: [SEPOLIA_RPC],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Sepolia network:", addError);
        }
      }
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        isSepolia,
        provider,
        signer,
        contract,
        contractAddress,
        updateContractAddress,
        isDemoMode,
        toggleDemoMode,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        switchToSepolia,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
