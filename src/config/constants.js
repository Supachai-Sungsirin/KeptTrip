export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';
export const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';
export const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

// สามารถแก้ไขหรือใส่ที่อยู่ contract ที่ deploy จริงได้ที่นี่ หรือกรอกผ่าน UI Settings
export const DEFAULT_CONTRACT_ADDRESS = '0xa871634825c27Aa999F10EF0226d27fE785d78f4';
// บล็อกที่ Deploy สัญญา KeptTripFund.sol เพื่อใช้จำกัดขอบเขต eth_getLogs ไม่ให้เกินขีดจำกัด 10,000 บล็อกของ RPC
export const CONTRACT_DEPLOY_BLOCK = 12188800;

// เคลียร์ข้อมูล Mock ทั้งหมดเพื่อเตรียมพร้อมสำหรับ Deploy สัญญา KeptTripFund.sol และใช้งานจริง
export const INITIAL_MOCK_TRIPS = [];
export const INITIAL_MOCK_TRIP = null;
