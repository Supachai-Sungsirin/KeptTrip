// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KeptTripFund
 * @notice ระบบบริหารจัดการกองทุนทริปท่องเที่ยวและเบิกจ่ายตามแผนงานด้วยบล็อกเชน (Ethereum / Sepolia)
 * @dev รองรับ Dynamic Milestones, Flexible On-demand Funding, Fair Pro-rata Member Dropout,
 *      Creator Leadership Transfer, Collective Trip Cancellation, และ Auto Budget Expansion
 */
contract KeptTripFund {
    // -------------------------------------------------------------
    // ป้องกัน Reentrancy Attack แบบ Native
    // -------------------------------------------------------------
    uint256 private _status;
    modifier nonReentrant() {
        require(_status != 2, "ReentrancyGuard: reentrant call");
        _status = 2;
        _;
        _status = 1;
    }

    // -------------------------------------------------------------
    // โครงสร้างข้อมูล (Data Structures)
    // -------------------------------------------------------------
    struct Milestone {
        string title;                      // เช่น "ค่าตั๋วเครื่องบินไป-กลับ", "ค่าจองโรงแรม 3 คืน"
        uint256 amount;                    // จำนวนเงินที่ต้องจ่าย (หน่วย Wei)
        address payable recipient;         // กระเป๋าปลายทางที่จะรับเงิน
        string proofData;                  // ลิงก์หลักฐานใบเสร็จ/ใบจอง (URL หรือ IPFS Hash)
        bool isRequested;                  // สถานะ: มีการส่งคำขอเบิกแล้วหรือไม่
        bool isPaid;                       // สถานะ: เบิกจ่ายเงินออกไปเรียบร้อยแล้วหรือไม่
        uint256 approvalCount;             // จำนวนเสียงโหวตเห็นชอบปัจจุบัน
        mapping(address => bool) approvals;// ตรวจสอบว่าสมาชิกคนไหนโหวตไปแล้วบ้าง
    }

    struct Trip {
        string tripName;                   // ชื่อทริป
        string tripCharterURI;             // ลิงก์/ข้อความข้อตกลงและกฎประจำทริป (URL หรือ IPFS)
        address creator;                   // กระเป๋าผู้สร้างทริป/หัวหน้าทริป
        uint256 targetAmount;              // เป้าหมายงบประมาณรวมที่ตั้งไว้ (Wei)
        uint256 deadline;                  // วันสิ้นสุดระยะเวลาเก็บเงิน (Unix Timestamp)
        uint256 totalCollected;            // ยอดเงินรวมที่สมาชิกร่วมกันโอนเข้ามา (Wei)
        uint256 totalSpent;                // ยอดเงินรวมที่ถูกเบิกจ่ายออกจริงแล้ว (Wei)
        uint256 activeMembersCount;        // จำนวนสมาชิกปัจจุบันที่ยังมีสิทธิ์โหวต
        uint256 milestoneCount;            // จำนวนรายการย่อย (Milestones)
        bool isActive;                     // สถานะของทริป
        bool isCancelled;                  // สถานะ: ทริปล่ม/ถูกขอยกเลิกหรือไม่
        uint256 cancelVotesCount;          // จำนวนเสียงโหวตขอยกเลิกทริป
        mapping(address => uint256) contributions; // ยอดเงินที่สมาชิกแต่ละคนโอนสมทบ
        mapping(address => bool) isMember;         // เช็กว่าเป็นสมาชิกของทริปหรือไม่
        mapping(address => bool) cancelVotes;      // เช็กว่าใครโหวตยกเลิกทริปไปแล้วบ้าง
        mapping(uint256 => Milestone) milestones;  // รายการ Milestones ทั้งหมดของทริป
    }

    uint256 public tripCount;
    mapping(uint256 => Trip) public trips;

    // -------------------------------------------------------------
    // Events
    // -------------------------------------------------------------
    event TripCreated(
        uint256 indexed tripId,
        string tripName,
        address indexed creator,
        uint256 targetAmount,
        uint256 deadline,
        string tripCharterURI
    );
    event TripBudgetExpanded(
        uint256 indexed tripId,
        uint256 oldTargetAmount,
        uint256 newTargetAmount
    );
    event TripCreatorTransferred(
        uint256 indexed tripId,
        address indexed oldCreator,
        address indexed newCreator
    );
    event TripCancelVoteCast(
        uint256 indexed tripId,
        address indexed voter,
        uint256 currentVotes,
        uint256 requiredVotes
    );
    event TripCancelled(
        uint256 indexed tripId,
        address indexed caller,
        uint256 unspentBalance
    );
    event MilestoneAdded(
        uint256 indexed tripId,
        uint256 indexed milestoneId,
        string title,
        uint256 amount,
        address recipient
    );
    event FundsContributed(
        uint256 indexed tripId,
        address indexed contributor,
        uint256 amount,
        uint256 totalCollected
    );
    event MilestoneRequested(
        uint256 indexed tripId,
        uint256 indexed milestoneId,
        string proofData,
        address recipient,
        uint256 amount
    );
    event MilestoneApproved(
        uint256 indexed tripId,
        uint256 indexed milestoneId,
        address indexed approver,
        uint256 approvalCount,
        uint256 requiredApprovals
    );
    event MilestonePaid(
        uint256 indexed tripId,
        uint256 indexed milestoneId,
        uint256 amount,
        address recipient
    );
    event MemberDroppedOut(
        uint256 indexed tripId,
        address indexed member,
        uint256 refundAmount,
        uint256 remainingUnspentBalance
    );
    event RefundIssued(
        uint256 indexed tripId,
        address indexed contributor,
        uint256 amount
    );

    constructor() {
        _status = 1;
    }

    // -------------------------------------------------------------
    // 1. ฟังก์ชันสร้างทริป (Create Trip)
    // -------------------------------------------------------------
    function createTrip(
        string memory _tripName,
        string memory _tripCharterURI,
        uint256 _targetAmount,
        uint256 _durationInDays
    ) external returns (uint256) {
        require(bytes(_tripName).length > 0, "Trip name required");
        require(_targetAmount > 0, "Target amount must be > 0");
        require(_durationInDays > 0, "Duration must be > 0");

        tripCount++;
        Trip storage newTrip = trips[tripCount];
        newTrip.tripName = _tripName;
        newTrip.tripCharterURI = _tripCharterURI;
        newTrip.creator = msg.sender;
        newTrip.targetAmount = _targetAmount;
        newTrip.deadline = block.timestamp + (_durationInDays * 1 days);
        newTrip.isActive = true;
        newTrip.isCancelled = false;

        emit TripCreated(
            tripCount,
            _tripName,
            msg.sender,
            _targetAmount,
            newTrip.deadline,
            _tripCharterURI
        );

        return tripCount;
    }

    // -------------------------------------------------------------
    // 2. ฟังก์ชันเพิ่มรายการย่อย (พร้อม Auto Budget Expansion)
    // -------------------------------------------------------------
    /**
     * @notice เพิ่มรายการค่าใช้จ่าย หากงบรวมเกินเป้าหมายเดิม ระบบจะขยายเป้าหมายงบประมาณอัตโนมัติ
     */
    function addMilestone(
        uint256 _tripId,
        string memory _title,
        uint256 _amount,
        address payable _recipient
    ) external {
        Trip storage trip = trips[_tripId];
        require(trip.isActive && !trip.isCancelled, "Trip is not active");
        require(msg.sender == trip.creator, "Only trip creator can add milestone");
        require(bytes(_title).length > 0, "Milestone title required");
        require(_amount > 0, "Milestone amount must be > 0");

        // คำนวณงบประมาณของทุกรายการที่มีอยู่เดิม
        uint256 currentTotalBudget = 0;
        for (uint256 i = 0; i < trip.milestoneCount; i++) {
            currentTotalBudget += trip.milestones[i].amount;
        }

        // หากงบประมาณของรายการใหม่เกินเป้าหมายเดิม -> ขยายเป้าหมายงบประมาณอัตโนมัติ
        if (currentTotalBudget + _amount > trip.targetAmount) {
            uint256 oldTarget = trip.targetAmount;
            trip.targetAmount = currentTotalBudget + _amount;
            emit TripBudgetExpanded(_tripId, oldTarget, trip.targetAmount);
        }

        uint256 milestoneId = trip.milestoneCount;
        Milestone storage m = trip.milestones[milestoneId];
        m.title = _title;
        m.amount = _amount;
        m.recipient = _recipient != address(0) ? _recipient : payable(msg.sender);
        trip.milestoneCount++;

        emit MilestoneAdded(_tripId, milestoneId, _title, _amount, m.recipient);
    }

    // -------------------------------------------------------------
    // 3. ฟังก์ชันขยายงบประมาณทริปโดยตรง (Expand Trip Budget)
    // -------------------------------------------------------------
    function expandTripBudget(uint256 _tripId, uint256 _additionalAmount) external {
        Trip storage trip = trips[_tripId];
        require(trip.isActive && !trip.isCancelled, "Trip is not active");
        require(msg.sender == trip.creator, "Only trip creator can expand budget");
        require(_additionalAmount > 0, "Additional amount must be > 0");

        uint256 oldTarget = trip.targetAmount;
        trip.targetAmount += _additionalAmount;

        emit TripBudgetExpanded(_tripId, oldTarget, trip.targetAmount);
    }

    // -------------------------------------------------------------
    // 4. แต่งตั้ง/โอนตำแหน่งหัวหน้าทริป (Transfer Leadership)
    // -------------------------------------------------------------
    /**
     * @notice ผู้สร้างทริปสามารถโอนสิทธิ์ความเป็นหัวหน้าทริปให้สมาชิกคนอื่นได้
     */
    function transferTripCreator(uint256 _tripId, address _newCreator) external {
        Trip storage trip = trips[_tripId];
        require(trip.isActive && !trip.isCancelled, "Trip is not active");
        require(msg.sender == trip.creator, "Only current creator can transfer leadership");
        require(trip.isMember[_newCreator], "New creator must be an active member of this trip");
        require(_newCreator != trip.creator, "Already the trip creator");

        address oldCreator = trip.creator;
        trip.creator = _newCreator;

        emit TripCreatorTransferred(_tripId, oldCreator, _newCreator);
    }

    // -------------------------------------------------------------
    // 5. โหวตขอยกเลิกทริปกลางคัน (Vote to Cancel Trip)
    // -------------------------------------------------------------
    /**
     * @notice สมาชิกร่วมกันโหวตยุบทริป เมื่อเสียงเกินกึ่งหนึ่ง ทริปจะถูกยกเลิกและเปิดให้ทุกคนดึงเงินส่วนที่เหลือคืน
     */
    function voteCancelTrip(uint256 _tripId) external nonReentrant {
        Trip storage trip = trips[_tripId];
        require(trip.isActive && !trip.isCancelled, "Trip is not active");
        require(trip.isMember[msg.sender] || msg.sender == trip.creator, "Only active members or creator can vote to cancel");
        require(!trip.cancelVotes[msg.sender], "You have already voted to cancel this trip");

        trip.cancelVotes[msg.sender] = true;
        trip.cancelVotesCount++;

        uint256 requiredVotes = (trip.activeMembersCount / 2) + 1;
        emit TripCancelVoteCast(_tripId, msg.sender, trip.cancelVotesCount, requiredVotes);

        // หากเสียงโหวตยกเลิกเกินกึ่งหนึ่ง หรือหัวหน้าทริปขอยกเลิกตอนมีสมาชิกไม่เกิน 1 คน (หรือยังไม่มีใครสมทบ)
        if (trip.cancelVotesCount >= requiredVotes || (msg.sender == trip.creator && trip.activeMembersCount <= 1)) {
            trip.isActive = false;
            trip.isCancelled = true;

            uint256 unspentBalance = trip.totalCollected >= trip.totalSpent ? trip.totalCollected - trip.totalSpent : 0;
            emit TripCancelled(_tripId, msg.sender, unspentBalance);
        }
    }

    // -------------------------------------------------------------
    // 6. สมทบเงินเข้ากองกลาง (Flexible On-demand Contribution)
    // -------------------------------------------------------------
    function contribute(uint256 _tripId) external payable nonReentrant {
        Trip storage trip = trips[_tripId];
        require(trip.isActive && !trip.isCancelled, "Trip is not active");
        require(block.timestamp < trip.deadline, "Contribution deadline passed");
        require(msg.value > 0, "Contribution must be > 0");

        if (!trip.isMember[msg.sender]) {
            trip.isMember[msg.sender] = true;
            trip.activeMembersCount++;
        }

        trip.contributions[msg.sender] += msg.value;
        trip.totalCollected += msg.value;

        emit FundsContributed(_tripId, msg.sender, msg.value, trip.totalCollected);
    }

    // -------------------------------------------------------------
    // 7. ผู้จัดส่งคำขอเบิกเงิน (Request Milestone Release)
    // -------------------------------------------------------------
    function requestMilestoneRelease(
        uint256 _tripId,
        uint256 _milestoneId,
        string memory _proofData,
        address payable _recipient
    ) external {
        Trip storage trip = trips[_tripId];
        require(trip.isActive && !trip.isCancelled, "Trip is not active");
        require(msg.sender == trip.creator, "Only trip creator can request release");
        require(_milestoneId < trip.milestoneCount, "Milestone does not exist");

        Milestone storage m = trip.milestones[_milestoneId];
        require(!m.isPaid, "Milestone already paid");
        require(bytes(_proofData).length > 0, "Proof data link required");

        m.proofData = _proofData;
        if (_recipient != address(0)) {
            m.recipient = _recipient;
        }
        m.isRequested = true;

        emit MilestoneRequested(_tripId, _milestoneId, _proofData, m.recipient, m.amount);
    }

    // -------------------------------------------------------------
    // 8. สมาชิกโหวตอนุมัติ (Approve Milestone)
    // -------------------------------------------------------------
    function approveMilestone(uint256 _tripId, uint256 _milestoneId) external nonReentrant {
        Trip storage trip = trips[_tripId];
        require(trip.isActive && !trip.isCancelled, "Trip is not active");
        require(trip.isMember[msg.sender], "Only active contributors can vote");
        require(_milestoneId < trip.milestoneCount, "Milestone does not exist");

        Milestone storage m = trip.milestones[_milestoneId];
        require(m.isRequested, "Milestone not requested yet");
        require(!m.isPaid, "Milestone already paid");
        require(!m.approvals[msg.sender], "You have already approved this milestone");

        m.approvals[msg.sender] = true;
        m.approvalCount++;

        uint256 requiredVotes = (trip.activeMembersCount / 2) + 1;
        emit MilestoneApproved(_tripId, _milestoneId, msg.sender, m.approvalCount, requiredVotes);

        if (m.approvalCount >= requiredVotes) {
            uint256 unspentBalance = trip.totalCollected >= trip.totalSpent ? trip.totalCollected - trip.totalSpent : 0;
            // หากเงินคงเหลือในกองกลางมีเพียงพอ จ่ายเงินให้ Vendor / ผู้รับทันที
            if (unspentBalance >= m.amount) {
                m.isPaid = true;
                trip.totalSpent += m.amount;

                (bool success, ) = m.recipient.call{value: m.amount}("");
                require(success, "Payout transfer to recipient failed");

                emit MilestonePaid(_tripId, _milestoneId, m.amount, m.recipient);
            }
        }
    }

    // -------------------------------------------------------------
    // 8.1 เบิกจ่ายเงินเมื่อกองกลางมีเงินเพียงพอ (Execute Milestone Payout)
    // -------------------------------------------------------------
    /**
     * @notice เบิกจ่ายเงินให้ Milestone ที่ได้รับการโหวตอนุมัติแล้ว เมื่อมีเงินสมทบเข้ามาเพียงพอ
     */
    function executeMilestonePayout(uint256 _tripId, uint256 _milestoneId) external nonReentrant {
        Trip storage trip = trips[_tripId];
        require(trip.isActive && !trip.isCancelled, "Trip is not active");
        require(_milestoneId < trip.milestoneCount, "Milestone does not exist");

        Milestone storage m = trip.milestones[_milestoneId];
        require(m.isRequested, "Milestone not requested yet");
        require(!m.isPaid, "Milestone already paid");

        uint256 requiredVotes = (trip.activeMembersCount / 2) + 1;
        require(m.approvalCount >= requiredVotes, "Milestone approval threshold not reached");

        uint256 unspentBalance = trip.totalCollected >= trip.totalSpent ? trip.totalCollected - trip.totalSpent : 0;
        require(unspentBalance >= m.amount, "Insufficient trip pool balance. Please top up funds first.");

        m.isPaid = true;
        trip.totalSpent += m.amount;

        (bool success, ) = m.recipient.call{value: m.amount}("");
        require(success, "Payout transfer to recipient failed");

        emit MilestonePaid(_tripId, _milestoneId, m.amount, m.recipient);
    }

    // -------------------------------------------------------------
    // 9. ถอนตัวกลางคัน (Fair Pro-rata Member Dropout)
    // -------------------------------------------------------------
    /**
     * @notice สมาชิกถอนตัว (หัวหน้าทริปถอนตัวโดยตรงไม่ได้ ต้องแต่งตั้งคนอื่นก่อน หรือโหวตยกเลิกทริป)
     */
    function dropoutTrip(uint256 _tripId) external nonReentrant {
        Trip storage trip = trips[_tripId];
        require(trip.isActive && !trip.isCancelled, "Trip is not active");
        require(trip.isMember[msg.sender], "Not an active member of this trip");
        
        // กฎสำคัญ: ผู้สร้างทริปไม่สามารถกดถอนตัวได้โดยตรง
        require(msg.sender != trip.creator, "Trip creator cannot dropout directly. Transfer leadership first or cancel trip.");

        uint256 userContributed = trip.contributions[msg.sender];
        require(userContributed > 0, "No contributed funds to refund");

        uint256 unspentPool = trip.totalCollected >= trip.totalSpent ? trip.totalCollected - trip.totalSpent : 0;

        // คำนวณเงินคืนตามสัดส่วนที่ยังไม่ได้ใช้จริง
        uint256 refundAmount = trip.totalCollected > 0 ? (userContributed * unspentPool) / trip.totalCollected : 0;
        uint256 userSpentShare = userContributed - refundAmount;

        trip.totalCollected -= userContributed;
        trip.totalSpent -= userSpentShare;
        trip.contributions[msg.sender] = 0;
        trip.isMember[msg.sender] = false;
        trip.activeMembersCount--;

        // ล้างคะแนนโหวตใน Milestone ที่ยังไม่ได้จ่าย
        for (uint256 i = 0; i < trip.milestoneCount; i++) {
            if (!trip.milestones[i].isPaid && trip.milestones[i].approvals[msg.sender]) {
                trip.milestones[i].approvals[msg.sender] = false;
                if (trip.milestones[i].approvalCount > 0) {
                    trip.milestones[i].approvalCount--;
                }
            }
        }

        // ล้างคะแนนโหวตยกเลิกทริป (ถ้าเคยโหวตไว้)
        if (trip.cancelVotes[msg.sender]) {
            trip.cancelVotes[msg.sender] = false;
            if (trip.cancelVotesCount > 0) {
                trip.cancelVotesCount--;
            }
        }

        if (refundAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund transfer failed");
        }

        emit MemberDroppedOut(_tripId, msg.sender, refundAmount, trip.totalCollected >= trip.totalSpent ? trip.totalCollected - trip.totalSpent : 0);
    }

    // -------------------------------------------------------------
    // 10. ขอเงินคืนกรณีทริปถูกยกเลิก หรือหมดเวลาไม่ถึงเป้า (Claim Refund)
    // -------------------------------------------------------------
    /**
     * @notice คืนเงินตามสัดส่วนเงินคงเหลือในกองกลางให้สมาชิกแต่ละคน
     */
    function claimRefund(uint256 _tripId) external nonReentrant {
        Trip storage trip = trips[_tripId];
        require(
            trip.isCancelled || (!trip.isActive) || (block.timestamp >= trip.deadline && trip.totalCollected < trip.targetAmount),
            "Trip is not eligible for refund at this stage"
        );

        uint256 userContributed = trip.contributions[msg.sender];
        require(userContributed > 0, "No funds to refund");

        uint256 unspentPool = trip.totalCollected >= trip.totalSpent ? trip.totalCollected - trip.totalSpent : 0;
        uint256 refundAmount = trip.totalCollected > 0 ? (userContributed * unspentPool) / trip.totalCollected : 0;

        trip.contributions[msg.sender] = 0;
        trip.isMember[msg.sender] = false;
        if (trip.activeMembersCount > 0) {
            trip.activeMembersCount--;
        }

        if (refundAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund transfer failed");
        }

        emit RefundIssued(_tripId, msg.sender, refundAmount);
    }

    // -------------------------------------------------------------
    // View Functions
    // -------------------------------------------------------------
    struct TripSummary {
        string tripName;
        string tripCharterURI;
        address creator;
        uint256 targetAmount;
        uint256 deadline;
        uint256 totalCollected;
        uint256 totalSpent;
        uint256 unspentBalance;
        uint256 activeMembersCount;
        uint256 milestoneCount;
        bool isActive;
        bool isCancelled;
        uint256 cancelVotesCount;
    }

    function getTripSummary(uint256 _tripId) external view returns (TripSummary memory) {
        Trip storage trip = trips[_tripId];
        uint256 unspent = trip.totalCollected >= trip.totalSpent ? trip.totalCollected - trip.totalSpent : 0;
        return TripSummary({
            tripName: trip.tripName,
            tripCharterURI: trip.tripCharterURI,
            creator: trip.creator,
            targetAmount: trip.targetAmount,
            deadline: trip.deadline,
            totalCollected: trip.totalCollected,
            totalSpent: trip.totalSpent,
            unspentBalance: unspent,
            activeMembersCount: trip.activeMembersCount,
            milestoneCount: trip.milestoneCount,
            isActive: trip.isActive,
            isCancelled: trip.isCancelled,
            cancelVotesCount: trip.cancelVotesCount
        });
    }

    function getMilestone(uint256 _tripId, uint256 _milestoneId) external view returns (
        string memory title,
        uint256 amount,
        address recipient,
        string memory proofData,
        bool isRequested,
        bool isPaid,
        uint256 approvalCount,
        uint256 requiredVotes
    ) {
        Trip storage trip = trips[_tripId];
        Milestone storage m = trip.milestones[_milestoneId];
        uint256 reqVotes = (trip.activeMembersCount / 2) + 1;
        return (
            m.title,
            m.amount,
            m.recipient,
            m.proofData,
            m.isRequested,
            m.isPaid,
            m.approvalCount,
            reqVotes
        );
    }

    function getMilestoneShortage(uint256 _tripId, uint256 _milestoneId) external view returns (
        bool isSufficient,
        uint256 shortageAmount
    ) {
        Trip storage trip = trips[_tripId];
        Milestone storage m = trip.milestones[_milestoneId];
        uint256 unspent = trip.totalCollected >= trip.totalSpent ? trip.totalCollected - trip.totalSpent : 0;

        if (unspent >= m.amount) {
            return (true, 0);
        } else {
            return (false, m.amount - unspent);
        }
    }

    function hasApproved(uint256 _tripId, uint256 _milestoneId, address _user) external view returns (bool) {
        return trips[_tripId].milestones[_milestoneId].approvals[_user];
    }

    function hasVotedCancel(uint256 _tripId, address _user) external view returns (bool) {
        return trips[_tripId].cancelVotes[_user];
    }

    function getContribution(uint256 _tripId, address _user) external view returns (uint256) {
        return trips[_tripId].contributions[_user];
    }

    function isMember(uint256 _tripId, address _user) external view returns (bool) {
        return trips[_tripId].isMember[_user];
    }
}
