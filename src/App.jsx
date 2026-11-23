import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ethers } from 'ethers';
import { useWeb3 } from './context/Web3Context';
import { INITIAL_MOCK_TRIPS, CONTRACT_DEPLOY_BLOCK } from './config/constants';

// Components
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import TripHub from './components/TripHub';
import RedesignedTripDetail from './components/RedesignedTripDetail';

// Modals
import CreateTripModal from './components/CreateTripModal';
import AddMilestoneModal from './components/AddMilestoneModal';
import ContributeModal from './components/ContributeModal';
import DropoutModal from './components/DropoutModal';
import CancelTripModal from './components/CancelTripModal';
import InviteModal from './components/InviteModal';
import ContractConfigModal from './components/ContractConfigModal';
import JoinTripModal from './components/JoinTripModal';

export default function App() {
  const { account, contract, isDemoMode, isSepolia } = useWeb3();

  // Theme State: 'dark' (Dark Theme #0C0A09) or 'light' (Sunset Campfire #FAF9F6)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kepttrip_theme');
      if (saved) return saved;
    }
    return 'dark'; // Default to dark theme matching modern KeptTrip style
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('kepttrip_theme', next);
      }
      return next;
    });
  };

  // Trips State
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('kepttrip_trips_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return INITIAL_MOCK_TRIPS;
      }
    }
    return INITIAL_MOCK_TRIPS;
  });

  // URL Query Sync (?trip=ID)
  const [selectedTripId, setSelectedTripId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tripParam = params.get('trip') || params.get('tripId');
      if (tripParam && !isNaN(Number(tripParam))) {
        return Number(tripParam);
      }
    }
    return 1;
  });

  // View state: 'landing' (Landing Page), 'hub' (หน้ารวมทริป / My Trips), or 'trip' (หน้ารายละเอียดทริป)
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tripParam = params.get('trip') || params.get('tripId');
      if (tripParam && !isNaN(Number(tripParam))) {
        return 'trip';
      }
    }
    return 'landing'; // Default to landing page as requested
  });

  const currentTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  // สลับไปยังหน้ารายละเอียดทริป
  const handleSelectTrip = (id) => {
    setSelectedTripId(id);
    setCurrentView('trip');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('trip', id);
      window.history.pushState({}, '', url.toString());
    }
  };

  // ไปยังหน้า Landing Page
  const handleGoLanding = () => {
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('trip');
      url.searchParams.delete('tripId');
      window.history.pushState({}, '', url.pathname);
    }
  };

  // ไปยังหน้า Trip Hub (หน้ารวมทริป)
  const handleGoHub = () => {
    setCurrentView('hub');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('trip');
      url.searchParams.delete('tripId');
      window.history.pushState({}, '', url.pathname);
    }
  };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeDefaultAmount, setContributeDefaultAmount] = useState('0.05');
  const [isDropoutOpen, setIsDropoutOpen] = useState(false);
  const [isCancelTripOpen, setIsCancelTripOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [isInviteArrival, setIsInviteArrival] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return !!(params.get('trip') || params.get('tripId'));
    }
    return false;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Status Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // บันทึก State ลง LocalStorage
  useEffect(() => {
    localStorage.setItem('kepttrip_trips_v3', JSON.stringify(trips));
  }, [trips]);

  // ซิงค์ข้อมูลทริปและสมาชิกข้ามแท็บแบบ Real-time (BroadcastChannel + storage event)
  useEffect(() => {
    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('kepttrip_channel');
        bc.onmessage = (e) => {
          if (e.data?.type === 'TRIPS_SYNC' && Array.isArray(e.data.trips)) {
            setTrips(e.data.trips);
          }
        };
      } catch (e) {}
    }

    const handleStorage = (e) => {
      if (e.key === 'kepttrip_trips_v3' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setTrips(parsed);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // ตรวจสอบเมื่อเข้าเว็บผ่าน Invite Link (?trip=ID)
  // หากยังไม่ได้เป็นสมาชิกและไม่ใช่หัวหน้าทริป ให้เด้ง Modal ถามยืนยันการเข้าร่วมทริปทันที
  useEffect(() => {
    if (isInviteArrival && currentTrip && currentTrip.isActive && !currentTrip.isCancelled) {
      if (!account) return;
      const isCreator = currentTrip.creator && currentTrip.creator.toLowerCase() === account.toLowerCase();
      const isMember = (currentTrip.members || []).some(
        m => m.address && m.address.toLowerCase() === account.toLowerCase()
      );
      if (!isCreator && !isMember) {
        setIsJoinOpen(true);
      } else {
        setIsJoinOpen(false);
      }
    }
  }, [isInviteArrival, currentTrip, account]);

  // Helper สำหรับดึง Event Logs แบบแบ่งช่วงบล็อก (Chunked) เพื่อไม่ให้เกินขีดจำกัด RPC (10,000 บล็อก) และไม่ทำข้อมูลเก่าสูญหาย
  const queryFilterChunked = async (contractInstance, filter, fromBlock, toBlock, chunkSize = 7500) => {
    let allLogs = [];
    let start = fromBlock;
    while (start <= toBlock) {
      const end = Math.min(start + chunkSize - 1, toBlock);
      try {
        const logs = await contractInstance.queryFilter(filter, start, end);
        allLogs = allLogs.concat(logs);
      } catch (err) {
        console.warn(`Query logs chunk ${start}-${end} failed, retrying with smaller window:`, err);
        const mid = Math.floor((start + end) / 2);
        try {
          const l1 = await contractInstance.queryFilter(filter, start, mid);
          const l2 = await contractInstance.queryFilter(filter, mid + 1, end);
          allLogs = allLogs.concat(l1, l2);
        } catch (e2) {
          console.warn(`Query fallback chunk failed:`, e2);
        }
      }
      start = end + 1;
    }
    return allLogs;
  };

  // F-05: ดึงข้อมูลทริปและ Milestone จาก Smart Contract บนบล็อกเชน Sepolia
  const syncOnChainTrips = async () => {
    if (!contract || isDemoMode) return;
    try {
      const countBig = await contract.tripCount();
      const count = Number(countBig);
      if (count === 0) return;

      // ดึง Current Block Number ครั้งเดียว สำหรับใช้กับทุกทริป
      let currentBlock = 0;
      try {
        const provider = contract.runner?.provider || contract.provider;
        if (provider) {
          currentBlock = await provider.getBlockNumber();
        }
      } catch (bErr) {
        console.warn("Could not determine current block number:", bErr);
      }

      const deployBlock = CONTRACT_DEPLOY_BLOCK || 12188800;
      const targetToBlock = currentBlock > 0 ? currentBlock : "latest";

      // ดึงชื่อเล่นที่สมาชิกเคยตั้งไว้ในเครื่อง
      const savedMemberNames = (() => {
        try {
          return JSON.parse(localStorage.getItem('kepttrip_member_names') || '{}');
        } catch {
          return {};
        }
      })();

      const loadedTrips = [];
      for (let i = 1; i <= count; i++) {
        try {
          const summary = await contract.getTripSummary(i);
          let charter = {};
          try {
            charter = JSON.parse(summary.tripCharterURI);
          } catch {
            charter = { description: summary.tripCharterURI };
          }

          const mCount = Number(summary.milestoneCount);
          // ดึง Milestones แบบขนาน (Promise.all) แทน Sequential Loop
          const milestonePromises = Array.from({ length: mCount }, async (_, m) => {
            try {
              const mData = await contract.getMilestone(i, m);
              let approvedByMe = false;
              if (account) {
                approvedByMe = await contract.hasApproved(i, m, account);
              }
              return {
                id: m,
                title: mData.title,
                amount: ethers.formatEther(mData.amount),
                recipient: mData.recipient,
                proofData: mData.proofData,
                isRequested: mData.isRequested,
                isPaid: mData.isPaid,
                approvalCount: Number(mData.approvalCount),
                requiredVotes: Number(mData.requiredVotes),
                approvedByMe,
                statusLabel: mData.isPaid ? "เบิกจ่ายแล้ว" : mData.isRequested ? "กำลังเปิดโหวต" : "Upcoming",
                statusDetail: mData.isPaid ? "ผ่านการโหวตอนุมัติและจ่ายเงินแล้ว" : mData.isRequested ? `กำลังเปิดโหวต (${mData.approvalCount}/${mData.requiredVotes} เสียง)` : "รอส่งเอกสารขอเบิกจ่าย"
              };
            } catch (mErr) {
              console.warn(`Failed to load milestone ${m} for trip ${i}:`, mErr);
              return null;
            }
          });
          const loadedMilestones = (await Promise.all(milestonePromises)).filter(Boolean);

          let userContributed = "0.000";
          let userIsMember = false;
          let userHasVotedCancel = false;
          if (account) {
            try {
              const [userContribWei, isMem, hasVoted] = await Promise.all([
                contract.getContribution(i, account),
                contract.isMember(i, account),
                contract.hasVotedCancel(i, account)
              ]);
              userContributed = ethers.formatEther(userContribWei);
              userIsMember = isMem;
              userHasVotedCancel = hasVoted;
            } catch (uErr) {
              console.warn("User status query err:", uErr);
            }
          }

          // Query Real On-Chain Events & Members from Sepolia Contract Logs
          const onChainEvents = [];
          const membersMap = new Map();
          const droppedOutSet = new Set();

          const creatorKey = summary.creator.toLowerCase();
          const creatorNickname = savedMemberNames[creatorKey];
          // เพิ่ม Creator เป็นสมาชิกแรก
          membersMap.set(creatorKey, {
            address: summary.creator,
            name: account && creatorKey === account.toLowerCase()
              ? (creatorNickname ? `${creatorNickname} (คุณ - หัวหน้าทริป)` : "คุณ (หัวหน้าทริป)")
              : (creatorNickname ? `${creatorNickname} (หัวหน้าทริป)` : "หัวหน้าทริป"),
            contributed: account && creatorKey === account.toLowerCase() ? userContributed : "0.000",
            status: "paid"
          });

          try {
            // ดึง Event logs ทั้ง 5 ประเภทพร้อมกันแบบขนาน และแบ่งช่วงบล็อกไม่เกิน 7,500 บล็อก
            const [contribLogs, paidLogs, approvedLogs, dropoutLogs, cancelLogs] = await Promise.all([
              queryFilterChunked(contract, contract.filters.FundsContributed(i), deployBlock, targetToBlock),
              queryFilterChunked(contract, contract.filters.MilestonePaid(i), deployBlock, targetToBlock),
              queryFilterChunked(contract, contract.filters.MilestoneApproved(i), deployBlock, targetToBlock),
              queryFilterChunked(contract, contract.filters.MemberDroppedOut(i), deployBlock, targetToBlock),
              queryFilterChunked(contract, contract.filters.TripCancelled(i), deployBlock, targetToBlock)
            ]);

            // 1. ประมวลผล FundsContributed
            for (const log of contribLogs) {
              const parsed = contract.interface.parseLog(log);
              const contributorAddr = parsed.args.contributor;
              const cEth = ethers.formatEther(parsed.args.amount);
              const key = contributorAddr.toLowerCase();
              const customName = savedMemberNames[key];

              onChainEvents.push({
                type: "FundsContributed",
                title: "โอนเงินสมทบกองกลาง",
                amount: `+${cEth} ETH`,
                actor: customName || `${contributorAddr.substring(0, 8)}...`,
                time: "บันทึกบน Sepolia",
                txHash: log.transactionHash
              });

              const existing = membersMap.get(key) || {
                address: contributorAddr,
                name: account && key === account.toLowerCase()
                  ? (customName ? `${customName} (คุณ)` : "คุณ")
                  : (customName || `สมาชิก (${contributorAddr.substring(0, 6)}...)`),
                contributed: "0.000",
                status: "paid"
              };
              const newTot = (parseFloat(existing.contributed) + parseFloat(cEth)).toFixed(3);
              membersMap.set(key, { ...existing, contributed: newTot });
            }

            // 2. ประมวลผล MilestonePaid
            for (const log of paidLogs) {
              const parsed = contract.interface.parseLog(log);
              onChainEvents.push({
                type: "MilestonePaid",
                title: `เบิกจ่าย Milestone #${Number(parsed.args.milestoneId) + 1} สำเร็จ`,
                amount: `${ethers.formatEther(parsed.args.amount)} ETH`,
                actor: `${parsed.args.recipient.substring(0, 8)}...`,
                time: "บันทึกบน Sepolia",
                txHash: log.transactionHash
              });
            }

            // 3. ประมวลผล MilestoneApproved
            for (const log of approvedLogs) {
              const parsed = contract.interface.parseLog(log);
              onChainEvents.push({
                type: "MilestoneApproved",
                title: `โหวตอนุมัติ Milestone #${Number(parsed.args.milestoneId) + 1}`,
                amount: "",
                actor: `${parsed.args.approver.substring(0, 8)}...`,
                time: "บันทึกบน Sepolia",
                txHash: log.transactionHash
              });
            }

            // 4. ประมวลผล MemberDroppedOut
            for (const log of dropoutLogs) {
              const parsed = contract.interface.parseLog(log);
              onChainEvents.push({
                type: "MemberDroppedOut",
                title: "สมาชิกถอนตัวและรับเงินคืนตามสัดส่วน",
                amount: `+${ethers.formatEther(parsed.args.refundAmount)} ETH คืน`,
                actor: `${parsed.args.member.substring(0, 8)}...`,
                time: "บันทึกบน Sepolia",
                txHash: log.transactionHash
              });
              const droppedAddr = parsed.args.member.toLowerCase();
              droppedOutSet.add(droppedAddr);
              membersMap.delete(droppedAddr);
            }

            // 5. ประมวลผล TripCancelled
            for (const log of cancelLogs) {
              const parsed = contract.interface.parseLog(log);
              onChainEvents.push({
                type: "TripCancelled",
                title: "ทริปถูกยกเลิกอย่างเป็นทางการ",
                amount: `คืนเงินคงเหลือ ${ethers.formatEther(parsed.args.unspentBalance)} ETH`,
                actor: `${parsed.args.caller.substring(0, 8)}...`,
                time: "บันทึกบน Sepolia",
                txHash: log.transactionHash
              });
            }
          } catch (evErr) {
            console.warn("Could not query on-chain events:", evErr);
          }

          onChainEvents.reverse();

          const targetEth = ethers.formatEther(summary.targetAmount);
          const collectedEth = ethers.formatEther(summary.totalCollected);
          const spentEth = ethers.formatEther(summary.totalSpent);
          const unspentEth = ethers.formatEther(summary.unspentBalance);

          loadedTrips.push({
            id: i,
            tripName: summary.tripName,
            destination: summary.tripName,
            dates: charter.dueDate ? `กำหนดชำระ ${charter.dueDate}` : "กำลังดำเนินการ",
            friendsLabel: `${membersMap.size || Number(summary.activeMembersCount)} คน`,
            memberShare: charter.expectedPerMember ? `${charter.expectedPerMember} ETH` : `${(parseFloat(targetEth) / Math.max(membersMap.size, 1)).toFixed(3)} ETH`,
            tripCharterURI: summary.tripCharterURI,
            creator: summary.creator,
            targetAmount: targetEth,
            deadline: Number(summary.deadline),
            totalCollected: collectedEth,
            totalSpent: spentEth,
            unspentBalance: unspentEth,
            droppedOutMembers: Array.from(droppedOutSet),
            userHasDroppedOut: account ? droppedOutSet.has(account.toLowerCase()) : false,
            activeMembersCount: membersMap.size || Number(summary.activeMembersCount),
            milestoneCount: mCount,
            isActive: summary.isActive,
            isCancelled: summary.isCancelled,
            cancelVotesCount: Number(summary.cancelVotesCount),
            hasVotedCancel: userHasVotedCancel,
            isCompleted: !summary.isActive && !summary.isCancelled,
            milestones: loadedMilestones,
            members: Array.from(membersMap.values()),
            events: onChainEvents
          });
        } catch (tripErr) {
          console.warn(`Failed to load trip ${i}:`, tripErr);
        }
      }

      if (loadedTrips.length > 0) {
        setTrips(prev => {
          let currentLocalTrips = [];
          try {
            const raw = localStorage.getItem('kepttrip_trips_v3');
            if (raw) currentLocalTrips = JSON.parse(raw);
          } catch (e) {}

          const map = new Map();
          // ใส่จาก local storage ก่อน
          if (Array.isArray(currentLocalTrips)) {
            currentLocalTrips.forEach(t => {
              if (t && t.id !== undefined) map.set(Number(t.id), t);
            });
          }
          // ใส่จาก prev state (ถ้ามี)
          prev.forEach(t => {
            if (t && t.id !== undefined) {
              const k = Number(t.id);
              const ex = map.get(k);
              if (!ex) {
                map.set(k, t);
              } else {
                const allM = [...(ex.members || []), ...(t.members || [])];
                const uniqM = Array.from(new Map(allM.filter(m => m && m.address).map(m => [m.address.toLowerCase(), m])).values());
                map.set(k, { ...ex, ...t, members: uniqM });
              }
            }
          });

          // รวมเข้ากับ loadedTrips จาก Smart Contract บน Sepolia
          loadedTrips.forEach(t => {
            const k = Number(t.id);
            const existing = map.get(k);
            const droppedSet = new Set((t.droppedOutMembers || []).map(a => a.toLowerCase()));
            let mergedMembers = (t.members || []).filter(m => m && m.address && !droppedSet.has(m.address.toLowerCase()));
            if (existing && Array.isArray(existing.members)) {
              const localOnlyMembers = existing.members.filter(em =>
                em && em.address &&
                !droppedSet.has(em.address.toLowerCase()) &&
                !mergedMembers.some(mm => mm.address && mm.address.toLowerCase() === em.address.toLowerCase())
              );
              mergedMembers = [...mergedMembers, ...localOnlyMembers];
            }

            map.set(k, {
              ...(existing || {}),
              ...t,
              members: mergedMembers,
              droppedOutMembers: t.droppedOutMembers,
              activeMembersCount: mergedMembers.length
            });
          });

          const result = Array.from(map.values());
          // ส่ง Broadcast ให้แท็บอื่นอัปเดตแบบเรียลไทม์ทันที
          if (typeof BroadcastChannel !== 'undefined') {
            try {
              const bc = new BroadcastChannel('kepttrip_channel');
              bc.postMessage({ type: 'TRIPS_SYNC', trips: result });
              bc.close();
            } catch (e) {}
          }
          return result;
        });
      }
    } catch (err) {
      console.warn("Could not sync on-chain trips:", err);
    }
  };

  // เรียก sync เมื่อ contract พร้อมใช้งาน
  useEffect(() => {
    if (contract && !isDemoMode) {
      syncOnChainTrips();
    }
  }, [contract, account, isDemoMode]);

  // Confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // ========================================================
  // Action Handlers
  // ========================================================

  // 1. สร้างทริปใหม่
  const handleCreateTrip = async (data) => {
    if (isSubmittingTx) return;
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask ก่อนสร้างทริป", "error");
      return;
    }
    if (!contract) {
      showToast("ไม่พบการเชื่อมต่อ Smart Contract กรุณาตรวจสอบว่าเชื่อมต่อ Sepolia", "error");
      return;
    }

    let createdTripId = null;
    let realTxHash = null;

    try {
      setIsSubmittingTx(true);
      showToast("กำลังส่งคำสั่งสร้างทริปไปยังบล็อกเชน Sepolia...", "info");
      const tx = await contract.createTrip(
        data.tripName,
        data.tripCharterURI,
        ethers.parseEther(data.targetAmount),
        data.durationInDays
      );
      showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
      const receipt = await tx.wait();
      realTxHash = tx.hash;

      // F-02: ดึง tripId ที่แท้จริงจาก Event TripCreated
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed && parsed.name === 'TripCreated') {
              createdTripId = Number(parsed.args.tripId || parsed.args[0]);
              break;
            }
          } catch (e) {}
        }
      }

      if (!createdTripId) {
        try {
          const count = await contract.tripCount();
          createdTripId = Number(count);
        } catch (e) {}
      }

      // F-04: หากมี initialMilestone ส่งขึ้นบล็อกเชนด้วย
      if (data.initialMilestone && createdTripId) {
        try {
          showToast("กำลังบันทึก Milestone แรกไปยังบล็อกเชน...", "info");
          const mTx = await contract.addMilestone(
            createdTripId,
            data.initialMilestone.title,
            ethers.parseEther(data.initialMilestone.amount),
            account
          );
          await mTx.wait();
        } catch (mErr) {
          console.warn("Could not add initial milestone on-chain:", mErr);
        }
      }

      showToast(`สร้างทริปสำเร็จบน Sepolia! (Tx: ${tx.hash.substring(0, 10)}...)`);
      triggerConfetti();
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการสร้างทริป", "error");
      return;
    } finally {
      setIsSubmittingTx(false);
    }

    const newId = createdTripId || (trips.length > 0 ? Math.max(...trips.map(t => Number(t.id) || 0)) + 1 : 1);
    const newTrip = {
      id: newId,
      tripName: data.tripName,
      destination: data.tripName,
      dates: `Next ${data.durationInDays} Days`,
      friendsLabel: "1 Friend (You)",
      memberShare: `${(parseFloat(data.targetAmount) / 4).toFixed(3)} ETH`,
      tripCharterURI: data.tripCharterURI,
      creator: account || "0x71C8395B239d1bC59a16D3c8375815eA49b54e3A",
      targetAmount: data.targetAmount,
      deadline: Math.floor(Date.now() / 1000) + data.durationInDays * 86400,
      totalCollected: "0.000",
      totalSpent: "0.000",
      unspentBalance: "0.000",
      activeMembersCount: 1,
      milestoneCount: data.initialMilestone ? 1 : 0,
      isActive: true,
      isCompleted: false,
      hasActionRequired: false,
      actionBadgeText: "New Trip Created",
      actionMessage: "ทริปใหม่เริ่มต้นแล้ว สมาชิกสามารถเริ่มทยอยโอนเงินสมทบได้",
      userStatus: {
        label: "Your Status: Creator (Pending Deposit)",
        isPaid: false,
        amount: "0.000 ETH Paid",
        detail: "Creator of this trip",
        statusText: "Pending"
      },
      members: [
        {
          address: account || "0x71C8395B239d1bC59a16D3c8375815eA49b54e3A",
          name: "Creator (You)",
          contributed: "0.000",
          lastPaidAt: new Date().toISOString().split('T')[0],
          status: "grace"
        }
      ],
      milestones: data.initialMilestone ? [
        {
          id: 0,
          title: data.initialMilestone.title,
          amount: data.initialMilestone.amount,
          recipient: account || "0x71C8395B239d1bC59a16D3c8375815eA49b54e3A",
          proofData: "",
          isRequested: false,
          isPaid: false,
          approvalCount: 0,
          requiredVotes: 1,
          approvedByMe: false,
          statusLabel: "Upcoming",
          statusDetail: "เตรียมเปิดให้เบิกจ่ายเมื่อมีงบประมาณเพียงพอ"
        }
      ] : [],
      events: [
        {
          type: "TripCreated",
          title: `สร้างทริป: ${data.tripName}`,
          amount: `เป้าหมาย ${data.targetAmount} ETH`,
          actor: account ? `${account.substring(0, 8)}...` : "ผู้สร้างทริป",
          time: "เมื่อสักครู่",
          txHash: realTxHash || `${account ? account.substring(0, 10) : '0x'}`
        }
      ]
    };

    setTrips(prev => [newTrip, ...prev]);
    setSelectedTripId(newId);
    setCurrentView('trip');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('trip', newId);
      window.history.pushState({}, '', url.toString());
    }
    triggerConfetti();
    showToast(`สร้างทริป "${data.tripName}" สำเร็จ!`);
    syncOnChainTrips();
  };

  // 2. เพิ่ม Milestone
  const handleAddMilestone = async (data) => {
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask ก่อนเพิ่ม Milestone", "error");
      return;
    }
    if (!contract) {
      showToast("ไม่พบการเชื่อมต่อ Smart Contract บน Sepolia", "error");
      return;
    }

    let realTxHash = null;
    try {
      showToast("กำลังส่งคำขอเพิ่ม Milestone ไปยัง Sepolia...", "info");
      const tx = await contract.addMilestone(
        currentTrip.id,
        data.title,
        ethers.parseEther(data.amount),
        data.recipient
      );
      showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
      await tx.wait();
      realTxHash = tx.hash;
      showToast(`เพิ่ม Milestone สำเร็จบน Sepolia!`);
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการเพิ่ม Milestone", "error");
      return;
    }

    setTrips(prev => prev.map(t => {
      if (t.id === currentTrip.id) {
        const newMId = (t.milestones || []).length;
        const newM = {
          id: newMId,
          title: data.title,
          amount: data.amount,
          recipient: data.recipient,
          proofData: "",
          isRequested: false,
          isPaid: false,
          approvalCount: 0,
          requiredVotes: Math.floor((t.activeMembersCount || 1) / 2) + 1,
          approvedByMe: false,
          statusLabel: "Upcoming",
          statusDetail: "เพิ่งเพิ่มเข้าระบบ รอส่งเอกสารขอเบิกจ่าย"
        };

        const addAmt = parseFloat(data.expansionAmount || 0);
        const newTarget = addAmt > 0
          ? (parseFloat(t.targetAmount || "0") + addAmt).toFixed(3)
          : t.targetAmount;

        const newEvent = {
          type: "MilestoneAdded",
          title: `เพิ่มรายการ: ${data.title}`,
          amount: `${data.amount} ETH`,
          actor: account ? `${account.substring(0, 8)}...` : "ผู้จัดทริป",
          time: "เมื่อสักครู่",
          txHash: realTxHash || `${account ? account.substring(0, 10) : '0x'}`
        };

        return {
          ...t,
          targetAmount: newTarget,
          milestoneCount: (t.milestones || []).length + 1,
          milestones: [...(t.milestones || []), newM],
          events: [newEvent, ...(t.events || [])]
        };
      }
      return t;
    }));

    showToast(`เพิ่มรายการ "${data.title}" สำเร็จ!`);
    syncOnChainTrips();
  };

  // 3. สมทบเงิน
  const handleContribute = async (amount) => {
    if (isSubmittingTx) return;
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask เพื่อทำรายการ", "error");
      return;
    }
    if (!contract) {
      showToast("ไม่พบการเชื่อมต่อ Smart Contract กรุณาตรวจสอบว่าเชื่อมต่อ Sepolia", "error");
      return;
    }

    let realTxHash = null;
    try {
      setIsSubmittingTx(true);
      showToast("กำลังส่งธุรกรรมสมทบเงินไปยัง Sepolia...", "info");
      const tx = await contract.contribute(currentTrip.id, {
        value: ethers.parseEther(amount)
      });
      showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
      await tx.wait();
      realTxHash = tx.hash;
      showToast(`สมทบเงิน ${amount} ETH สำเร็จบน Sepolia!`);
      triggerConfetti();
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการสมทบเงิน", "error");
      return;
    } finally {
      setIsSubmittingTx(false);
    }

    setTrips(prev => prev.map(t => {
      if (t.id === currentTrip.id) {
        const addAmt = parseFloat(amount);
        const oldCollected = parseFloat(t.totalCollected || "0");
        const newCollected = (oldCollected + addAmt).toFixed(3);
        const oldSpent = parseFloat(t.totalSpent || "0");
        const newUnspent = (parseFloat(newCollected) - oldSpent).toFixed(3);

        const myAddr = account || "0x71C8395B239d1bC59a16D3c8375815eA49b54e3A";
        let memberFound = false;
        const updatedMembers = (t.members || []).map(m => {
          if (m.address.toLowerCase() === myAddr.toLowerCase()) {
            memberFound = true;
            const newContributed = (parseFloat(m.contributed || "0") + addAmt).toFixed(3);
            return {
              ...m,
              contributed: newContributed,
              lastPaidAt: new Date().toISOString().split('T')[0],
              status: "paid"
            };
          }
          return m;
        });

        if (!memberFound) {
          updatedMembers.push({
            address: myAddr,
            name: "Member (You)",
            contributed: amount,
            lastPaidAt: new Date().toISOString().split('T')[0],
            status: "paid"
          });
        }

        const newEvent = {
          type: "FundsContributed",
          title: "โอนเงินสมทบกองกลาง",
          amount: `+${amount} ETH`,
          actor: `${myAddr.substring(0, 8)}...`,
          time: "เมื่อสักครู่",
          txHash: realTxHash || `${myAddr.substring(0, 10)}...`
        };

        return {
          ...t,
          totalCollected: newCollected,
          unspentBalance: newUnspent,
          activeMembersCount: updatedMembers.length,
          userStatus: {
            label: `Your Status: Fully Paid (${updatedMembers.find(m => m.address.toLowerCase() === myAddr.toLowerCase())?.contributed || amount} ETH)`,
            isPaid: true,
            amount: `${updatedMembers.find(m => m.address.toLowerCase() === myAddr.toLowerCase())?.contributed || amount} ETH Paid`,
            detail: "Recently deposited into vault",
            statusText: "Settled"
          },
          members: updatedMembers,
          events: [newEvent, ...(t.events || [])]
        };
      }
      return t;
    }));

    triggerConfetti();
    showToast(`สมทบเงิน ${amount} ETH เข้ากองกลางเรียบร้อย!`);
    syncOnChainTrips();
  };

  // 4. ส่งเอกสารขอเบิกจ่าย
  const handleRequestRelease = async (mId, proof, recipient) => {
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask เพื่อทำรายการ", "error");
      return;
    }
    if (!contract) {
      showToast("ไม่พบการเชื่อมต่อ Smart Contract บน Sepolia", "error");
      return;
    }

    let realTxHash = null;
    try {
      showToast("กำลังส่งคำขอเบิกจ่ายไปยัง Sepolia...", "info");
      const targetRecipient = recipient || currentTrip.creator;
      const tx = await contract.requestMilestoneRelease(currentTrip.id, mId, proof, targetRecipient);
      showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
      await tx.wait();
      realTxHash = tx.hash;
      showToast(`ส่งหลักฐานขอเบิกจ่ายสำเร็จ!`);
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการส่งคำขอเบิกเงิน", "error");
      return;
    }

    setTrips(prev => prev.map(t => {
      if (t.id === currentTrip.id) {
        const updatedM = (t.milestones || []).map(m => {
          if (m.id === mId) {
            return {
              ...m,
              isRequested: true,
              proofData: proof || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
              approvalCount: m.approvalCount || 0,
              approvedByMe: false,
              statusLabel: "กำลังเปิดโหวต",
              statusDetail: `กำลังเปิดโหวต (${m.approvalCount || 0} เสียงเห็นชอบ)`
            };
          }
          return m;
        });

        const newEvent = {
          type: "MilestoneRequested",
          title: `ยื่นเอกสารขอเบิกจ่าย Milestone #${mId + 1}`,
          amount: "",
          actor: account ? `${account.substring(0, 8)}...` : "ผู้ขอเบิก",
          time: "เมื่อสักครู่",
          txHash: realTxHash || `${account ? account.substring(0, 10) : '0x'}`
        };

        return {
          ...t,
          milestones: updatedM,
          events: [newEvent, ...(t.events || [])]
        };
      }
      return t;
    }));

    showToast("ส่งหลักฐานใบเสร็จและเปิดโหวตอนุมัติแล้ว");
    syncOnChainTrips();
  };

  // 5. โหวตอนุมัติ
  const handleApproveMilestone = async (mId) => {
    if (isSubmittingTx) return;
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask เพื่อทำรายการ", "error");
      return;
    }
    if (!contract) {
      showToast("ไม่พบการเชื่อมต่อ Smart Contract บน Sepolia", "error");
      return;
    }

    let realTxHash = null;
    try {
      setIsSubmittingTx(true);
      showToast("กำลังส่งผลโหวตไปยังบล็อกเชน Sepolia...", "info");
      const tx = await contract.approveMilestone(currentTrip.id, mId);
      showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
      await tx.wait();
      realTxHash = tx.hash;
      showToast(`บันทึกคะแนนโหวตสำเร็จบน Sepolia!`);
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการโหวต", "error");
      return;
    } finally {
      setIsSubmittingTx(false);
    }

    setTrips(prev => prev.map(t => {
      if (t.id === currentTrip.id) {
        let isNowPaid = false;
        let paidAmount = "0";

        const totalTripMembers = t.members?.length || t.activeMembersCount || 1;
        const threshold = Math.floor(totalTripMembers / 2) + 1;

        const updatedM = (t.milestones || []).map(m => {
          if (m.id === mId) {
            const newCount = (m.approvalCount || 0) + 1;
            const shouldPay = newCount >= threshold && !m.isPaid;
            if (shouldPay) {
              isNowPaid = true;
              paidAmount = m.amount;
            }
            return {
              ...m,
              approvalCount: newCount,
              approvedByMe: true,
              isPaid: m.isPaid || shouldPay,
              statusLabel: shouldPay ? "เบิกจ่ายแล้ว" : "กำลังเปิดโหวต",
              statusDetail: shouldPay
                ? `ผ่านการโหวต ${newCount}/${threshold} เสียง • เบิกจ่ายแล้ว`
                : `กำลังเปิดโหวต (เห็นชอบแล้ว ${newCount} จากสมาชิก ${totalTripMembers} คน • เกณฑ์ ${threshold} เสียง)`
            };
          }
          return m;
        });

        const hasUnapprovedRequested = updatedM.some(m => m.isRequested && !m.isPaid && !m.approvedByMe);
        const remainingVoting = updatedM.filter(m => m.isRequested && !m.isPaid).length;

        const newSpent = isNowPaid
          ? (parseFloat(t.totalSpent || "0") + parseFloat(paidAmount)).toFixed(3)
          : t.totalSpent;
        const newUnspent = (parseFloat(t.totalCollected || "0") - parseFloat(newSpent)).toFixed(3);

        const newEvent = {
          type: isNowPaid ? "MilestonePaid" : "MilestoneApproved",
          title: isNowPaid
            ? `จ่ายเงินสำเร็จ: Milestone #${mId + 1} (${paidAmount} ETH)`
            : `โหวตอนุมัติ Milestone #${mId + 1}`,
          amount: isNowPaid ? `${paidAmount} ETH` : "",
          actor: account ? `${account.substring(0, 8)}...` : "สมาชิก",
          time: "เมื่อสักครู่",
          txHash: realTxHash || `${account ? account.substring(0, 10) : '0x'}`
        };

        if (isNowPaid) triggerConfetti();

        return {
          ...t,
          totalSpent: newSpent,
          unspentBalance: newUnspent,
          milestones: updatedM,
          hasActionRequired: hasUnapprovedRequested,
          actionBadgeText: hasUnapprovedRequested
            ? `ต้องดำเนินการ: รอการโหวต ${updatedM.filter(m => m.isRequested && !m.isPaid && !m.approvedByMe).length} รายการ`
            : (remainingVoting > 0 ? `กำลังเปิดโหวต (${remainingVoting} รายการ)` : (isNowPaid ? "เบิกจ่ายสำเร็จแล้ว" : t.actionBadgeText)),
          events: [newEvent, ...(t.events || [])]
        };
      }
      return t;
    }));

    showToast("โหวตอนุมัติเรียบร้อยแล้ว!");
    syncOnChainTrips();
  };

  // 6. ถอนตัวกลางคัน (Fair Pro-Rata Member Dropout)
  const handleDropout = async (refundAmount) => {
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask เพื่อทำรายการ", "error");
      return;
    }
    if (!contract) {
      showToast("ไม่พบการเชื่อมต่อ Smart Contract บน Sepolia", "error");
      return;
    }

    const userAddr = account.toLowerCase();
    let realTxHash = null;

    try {
      showToast("กำลังส่งคำขอถอนตัวไปยังบล็อกเชน Sepolia...", "info");
      const tx = await contract.dropoutTrip(currentTrip.id);
      showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
      await tx.wait();
      realTxHash = tx.hash;
      showToast("ยืนยันการถอนตัวบน Sepolia สำเร็จ!");
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการถอนตัว", "error");
      return;
    }

    setTrips(prev => prev.map(t => {
      if (t.id === currentTrip.id) {
        const droppingMember = (t.members || []).find(
          m => m.address && m.address.toLowerCase() === userAddr
        ) || (t.members || []).find(m => m.name && (m.name.includes('(You') || m.name.toLowerCase() === 'you'));

        const contributedAmt = droppingMember ? parseFloat(droppingMember.contributed || "0") : 0;
        const refAmt = parseFloat(refundAmount || "0");

        const remainingMembers = (t.members || []).filter(
          m => m.address && m.address.toLowerCase() !== userAddr && (!m.name || (!m.name.includes('(You') && m.name.toLowerCase() !== 'you'))
        );

        const updatedMilestones = (t.milestones || []).map(m => {
          if (!m.isPaid && m.approvedByMe) {
            return {
              ...m,
              approvedByMe: false,
              approvalCount: Math.max((m.approvalCount || 1) - 1, 0)
            };
          }
          return m;
        });

        const newTotalCollected = Math.max(parseFloat(t.totalCollected || "0") - contributedAmt, 0).toFixed(3);
        const newUnspent = Math.max(parseFloat(t.unspentBalance || "0") - refAmt, 0).toFixed(3);

        const newEvent = {
          type: "MemberDroppedOut",
          title: "คุณได้ถอนตัวออกจากทริปและรับเงินคืนตามสัดส่วน",
          amount: `+${refAmt.toFixed(4)} ETH คืนเข้ากระเป๋า`,
          actor: account ? `${account.substring(0, 8)}...` : "คุณ",
          time: "เมื่อสักครู่",
          txHash: realTxHash || `${account ? account.substring(0, 10) : '0x'}`
        };

        return {
          ...t,
          members: remainingMembers,
          activeMembersCount: Math.max(remainingMembers.length, 0),
          totalCollected: newTotalCollected,
          unspentBalance: newUnspent,
          milestones: updatedMilestones,
          droppedOutMembers: [...(t.droppedOutMembers || []), userAddr],
          userHasDroppedOut: true,
          events: [newEvent, ...(t.events || [])]
        };
      }
      return t;
    }));

    showToast(`ถอนตัวเรียบร้อย คืนเงิน ${refundAmount || "0"} ETH เข้ากระเป๋าของคุณ`);
    handleGoHub();
    syncOnChainTrips();
  };

  // 7. โอนสิทธิ์ผู้สร้างทริป
  const handleTransferCreator = async (newCreatorAddr) => {
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask เพื่อทำรายการ", "error");
      return;
    }
    if (!contract) {
      showToast("ไม่พบการเชื่อมต่อ Smart Contract บน Sepolia", "error");
      return;
    }

    try {
      showToast("กำลังส่งคำสั่งโอนสิทธิ์หัวหน้าทริปไปยัง Sepolia...", "info");
      const tx = await contract.transferTripCreator(currentTrip.id, newCreatorAddr);
      showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
      await tx.wait();
      showToast("โอนสิทธิ์หัวหน้าทริปบน Sepolia สำเร็จ!");
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการโอนสิทธิ์หัวหน้าทริป", "error");
      return;
    }

    setTrips(prev => prev.map(t => {
      if (t.id === currentTrip.id) {
        return {
          ...t,
          creator: newCreatorAddr
        };
      }
      return t;
    }));
    showToast(`โอนสิทธิ์หัวหน้าทริปให้ ${newCreatorAddr.substring(0, 8)}... เรียบร้อยแล้ว`);
    syncOnChainTrips();
  };

  // 8. โหวตยกเลิกทริป (Vote to Cancel Trip)
  const handleVoteCancelTrip = async () => {
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask เพื่อทำรายการ", "error");
      return;
    }
    if (!contract) {
      showToast("ไม่พบการเชื่อมต่อ Smart Contract บน Sepolia", "error");
      return;
    }

    let realTxHash = null;
    try {
      showToast("กำลังส่งผลโหวตยกเลิกทริปไปยังบล็อกเชน Sepolia...", "info");
      const tx = await contract.voteCancelTrip(currentTrip.id);
      showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
      await tx.wait();
      realTxHash = tx.hash;
      showToast("บันทึกการโหวตยกเลิกทริปบน Sepolia สำเร็จ!");
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการโหวตยกเลิกทริป", "error");
      return;
    }

    setTrips(prev => prev.map(t => {
      if (t.id === currentTrip.id) {
        const activeM = t.activeMembersCount || t.members?.length || 1;
        const reqVotes = Math.floor(activeM / 2) + 1;
        const newCancelVotes = (t.cancelVotesCount || 0) + 1;
        const isNowCancelled = newCancelVotes >= reqVotes || activeM <= 1;

        const newEvent = {
          type: "TripCancelled",
          title: isNowCancelled ? "ทริปถูกยกเลิกอย่างเป็นทางการ (มติสมาชิกเกิน 50%)" : "สมาชิกลงคะแนนโหวตขอยกเลิกทริป",
          amount: isNowCancelled ? `เงินคงเหลือ ${t.unspentBalance || "0"} ETH เปิดให้เคลมคืน` : "",
          actor: account ? `${account.substring(0, 8)}...` : "คุณ",
          time: "เมื่อสักครู่",
          txHash: realTxHash || `${account ? account.substring(0, 10) : '0x'}`
        };

        return {
          ...t,
          cancelVotesCount: newCancelVotes,
          hasVotedCancel: true,
          isCancelled: isNowCancelled,
          isActive: !isNowCancelled && t.isActive,
          actionBadgeText: isNowCancelled ? "ทริปถูกยกเลิก (ขอรับเงินคืนได้)" : `โหวตยกเลิกแล้ว (${newCancelVotes}/${reqVotes})`,
          events: [newEvent, ...(t.events || [])]
        };
      }
      return t;
    }));

    showToast("คุณได้ลงคะแนนโหวตขอยกเลิกทริปแล้ว");
    handleGoHub();
    syncOnChainTrips();
  };

  // 9. เคลมเงินคืนเมื่อทริปล่ม
  const handleClaimRefund = async (refundAmount) => {
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask เพื่อทำรายการ", "error");
      return;
    }
    if (!contract) {
      showToast("ไม่พบการเชื่อมต่อ Smart Contract บน Sepolia", "error");
      return;
    }

    try {
      showToast("กำลังขอเงินคืนจากสัญญา Smart Contract...", "info");
      const tx = await contract.claimRefund(currentTrip.id);
      showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
      await tx.wait();
      showToast("ขอรับเงินคืนสำเร็จบน Sepolia!");
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการขอเงินคืน", "error");
      return;
    }

    setTrips(prev => prev.map(t => {
      if (t.id === currentTrip.id) {
        return {
          ...t,
          hasClaimedRefund: true
        };
      }
      return t;
    }));

    showToast(`โอนเงินคืนตามสัดส่วน ${refundAmount} ETH เข้ากระเป๋าของคุณเรียบร้อยแล้ว`);
    syncOnChainTrips();
  };

  // 11. เข้าร่วมทริปเมื่อได้รับคำเชิญ (Join Trip via Invitation)
  const handleJoinTrip = async (tripId, memberName, contributeAmount) => {
    if (!account) {
      showToast("กรุณาเชื่อมต่อกระเป๋า MetaMask เพื่อเข้าร่วมทริป", "error");
      return;
    }

    const numTripId = Number(tripId);
    const targetTrip = trips.find(t => Number(t.id) === numTripId);
    if (!targetTrip) return;

    // ตรวจสอบว่าเคยเป็นสมาชิกอยู่แล้วหรือไม่
    const alreadyMember = (targetTrip.members || []).some(
      m => m.address && m.address.toLowerCase() === account.toLowerCase()
    );
    if (alreadyMember) {
      showToast("คุณเป็นสมาชิกของทริปนี้อยู่แล้ว", "info");
      setIsJoinOpen(false);
      return;
    }

    const displayName = memberName?.trim() || `สมาชิก (${account.substring(0, 6)}...)`;

    // บันทึกชื่อเล่นไว้ใน LocalStorage เพื่อให้แสดงชื่อได้ถูกต้องทุกที่
    try {
      const savedNames = JSON.parse(localStorage.getItem('kepttrip_member_names') || '{}');
      savedNames[account.toLowerCase()] = displayName;
      localStorage.setItem('kepttrip_member_names', JSON.stringify(savedNames));
    } catch (e) {}

    let realTxHash = null;
    const hasDeposit = contributeAmount && parseFloat(contributeAmount) > 0;

    // หากเลือกสมทบเงินกองกลางทันที ให้ส่งคำสั่งผ่าน Smart Contract บนบล็อกเชน Sepolia
    if (hasDeposit) {
      if (!contract) {
        showToast("ไม่พบการเชื่อมต่อ Smart Contract กรุณาตรวจสอบเครือข่าย Sepolia", "error");
        return;
      }
      try {
        showToast("กำลังส่งคำสั่งสมทบเงินเข้ากองกลางไปยังบล็อกเชน Sepolia ผ่าน MetaMask...", "info");
        const valWei = ethers.parseEther(contributeAmount);
        const tx = await contract.contribute(numTripId, { value: valWei });
        showToast(`ส่งธุรกรรมแล้ว (Tx: ${tx.hash.substring(0, 10)}...) รอการยืนยันบล็อก...`, "info");
        await tx.wait();
        realTxHash = tx.hash;
        showToast(`โอนเงินสมทบ ${contributeAmount} ETH และเข้าร่วมทริปบน Sepolia สำเร็จ!`);
      } catch (err) {
        console.error(err);
        showToast(err.reason || err.shortMessage || err.message || "เกิดข้อผิดพลาดในการโอนเงินสมทบ", "error");
        return;
      }
    }

    const newMember = {
      address: account,
      name: displayName,
      contributed: hasDeposit ? parseFloat(contributeAmount).toFixed(3) : "0.000",
      lastPaidAt: hasDeposit ? new Date().toISOString().split('T')[0] : "-",
      status: hasDeposit ? "paid" : "grace"
    };

    const newEvent = {
      type: hasDeposit ? "FundsContributed" : "MemberJoined",
      title: hasDeposit
        ? `${displayName} ได้เข้าร่วมทริปและโอนเงินสมทบกองกลาง`
        : `${displayName} ได้ตอบรับคำเชิญและเข้าร่วมทริปแล้ว`,
      amount: hasDeposit ? `+${parseFloat(contributeAmount).toFixed(3)} ETH` : "-",
      actor: `${account.substring(0, 8)}...`,
      time: "เมื่อสักครู่",
      txHash: realTxHash || ""
    };

    setTrips(prev => {
      const updated = prev.map(t => {
        if (Number(t.id) === numTripId) {
          const updatedMembers = [...(t.members || []), newMember];
          const newTotalCol = hasDeposit 
            ? (parseFloat(t.totalCollected || "0") + parseFloat(contributeAmount)).toFixed(3)
            : t.totalCollected;
          const newUnspent = hasDeposit
            ? (parseFloat(t.unspentBalance || "0") + parseFloat(contributeAmount)).toFixed(3)
            : t.unspentBalance;
          return {
            ...t,
            members: updatedMembers,
            activeMembersCount: updatedMembers.length,
            friendsLabel: `${updatedMembers.length} คน`,
            totalCollected: newTotalCol,
            unspentBalance: newUnspent,
            events: [newEvent, ...(t.events || [])]
          };
        }
        return t;
      });

      // ส่งสัญญาณข้ามแท็บแบบ Real-time ทันที
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('kepttrip_channel');
          bc.postMessage({ type: 'TRIPS_SYNC', trips: updated });
          bc.close();
        } catch (e) {}
      }

      return updated;
    });

    triggerConfetti();
    showToast(`ยินดีต้อนรับสู่ทริป "${targetTrip.tripName}"! คุณได้เข้าร่วมเป็นสมาชิกเรียบร้อยแล้ว`, "success");
    setIsJoinOpen(false);
    setIsInviteArrival(false);

    if (hasDeposit) {
      syncOnChainTrips();
    }
  };

  // ปฏิเสธคำเชิญเข้าร่วมทริป
  const handleDeclineJoin = () => {
    setIsJoinOpen(false);
    setIsInviteArrival(false);
    handleGoHub();
  };

  // Quick Pay helper
  const handleQuickPay = (amt) => {
    setContributeDefaultAmount(amt || "0.05");
    setIsContributeOpen(true);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-['Prompt','Plus_Jakarta_Sans',sans-serif] antialiased transition-colors duration-200 ${
      isDark
        ? 'bg-[#0C0A09] text-[#F5F5F4] selection:bg-[#EA580C]/30 selection:text-white'
        : 'bg-[#FAF9F6] text-[#1C1917] selection:bg-[#FFEDD5] selection:text-[#C2410C]'
    }`}>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-medium flex items-center gap-2.5 backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-800 text-rose-200'
              : toast.type === 'info'
              ? isDark ? 'bg-[#1C1917]/95 border-[#292524] text-[#F5F5F4]' : 'bg-white/95 border-stone-200 text-stone-800'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === 'error' ? 'bg-rose-500' : toast.type === 'info' ? 'bg-[#EA580C]' : 'bg-emerald-500'
            }`} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navbar Matching FigCraft */}
      <Navbar
        currentView={currentView}
        onGoLanding={handleGoLanding}
        onGoHub={handleGoHub}
        onOpenCreateTrip={() => setIsCreateOpen(true)}
        onOpenShareLink={() => setIsInviteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentTrip={currentTrip}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] 2xl:max-w-[1536px] w-full mx-auto px-6 lg:px-12 py-8">
        {currentView === 'landing' ? (
          /* 1. Landing Page (Welcome Page with Hero, Features, Quick Access) */
          <LandingPage
            trips={trips}
            onSelectTrip={handleSelectTrip}
            onOpenCreateTrip={() => setIsCreateOpen(true)}
            onGoToHub={handleGoHub}
            theme={theme}
          />
        ) : currentView === 'hub' ? (
          /* 2. Trip Hub (หน้ารวมทริป - Frame Home in FigCraft) */
          <TripHub
            trips={trips}
            currentAccount={account}
            onSelectTrip={handleSelectTrip}
            onOpenCreateTrip={() => setIsCreateOpen(true)}
            theme={theme}
          />
        ) : currentTrip ? (
          /* 3. Redesigned Trip Detail (Trip Detail Frame in FigCraft) */
          <RedesignedTripDetail
            trip={currentTrip}
            currentAccount={account}
            theme={theme}
            onOpenContribute={() => {
              setContributeDefaultAmount("0.05");
              setIsContributeOpen(true);
            }}
            onOpenDropout={() => setIsDropoutOpen(true)}
            onOpenCancelTrip={() => setIsCancelTripOpen(true)}
            onClaimRefund={() => setIsCancelTripOpen(true)}
            onOpenAddMilestone={() => setIsAddMilestoneOpen(true)}
            onRequestRelease={handleRequestRelease}
            onApproveMilestone={handleApproveMilestone}
            onQuickPay={handleQuickPay}
            onOpenInvite={() => setIsInviteOpen(true)}
            onOpenJoinTrip={() => setIsJoinOpen(true)}
          />
        ) : (
          <div className={`text-center py-20 rounded-2xl border space-y-4 ${
            isDark ? 'bg-[#1C1917] border-[#292524]' : 'bg-[#FFFFFF] border-[#E7E5E4]'
          }`}>
            <p className={`text-sm ${isDark ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>ไม่พบข้อมูลทริปที่ต้องการ</p>
            <button
              onClick={handleGoHub}
              className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              กลับไปที่หน้ารวมทริป
            </button>
          </div>
        )}
      </main>

      {/* Footer Matching FigCraft theme */}
      <footer className={`border-t py-8 text-center text-xs transition-colors ${
        isDark
          ? 'border-[#292524] bg-[#0C0A09] text-[#78716C]'
          : 'border-[#E7E5E4] bg-[#FFFFFF] text-[#78716C]'
      }`}>
        <div className="max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className={isDark ? 'text-[#A8A29E]' : 'text-[#1C1917]'}>
              KeptTrip (เก็บทริป) — ระบบบริหารเงินกองกลางท่องเที่ยวโปร่งใสบน Ethereum Sepolia
            </span>
          </p>
          <p className="font-mono text-[11px] text-[#78716C]">
            สัญญา Smart Contract ผ่านการตรวจสอบ • ระบบควบคุมเงินกองกลาง Multisig • ตรวจสอบได้บนบล็อกเชน
          </p>
        </div>
      </footer>

      {/* Modals */}
      <CreateTripModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTrip={handleCreateTrip}
        theme={theme}
      />

      <AddMilestoneModal
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
        onAddMilestone={handleAddMilestone}
        trip={currentTrip}
        theme={theme}
      />

      <ContributeModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        onContribute={handleContribute}
        trip={currentTrip}
        defaultAmount={contributeDefaultAmount}
        theme={theme}
      />

      <DropoutModal
        isOpen={isDropoutOpen}
        onClose={() => setIsDropoutOpen(false)}
        onConfirmDropout={handleDropout}
        onTransferCreator={handleTransferCreator}
        onOpenCancelTrip={() => setIsCancelTripOpen(true)}
        trip={currentTrip}
        currentAccount={account}
        theme={theme}
      />

      <CancelTripModal
        isOpen={isCancelTripOpen}
        onClose={() => setIsCancelTripOpen(false)}
        trip={currentTrip}
        currentAccount={account}
        onVoteCancelTrip={handleVoteCancelTrip}
        onClaimRefund={handleClaimRefund}
        theme={theme}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        trip={currentTrip}
        theme={theme}
      />

      <JoinTripModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        trip={currentTrip}
        currentAccount={account}
        onJoinTrip={handleJoinTrip}
        onDecline={handleDeclineJoin}
        theme={theme}
      />

      <ContractConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
      />

    </div>
  );
}
