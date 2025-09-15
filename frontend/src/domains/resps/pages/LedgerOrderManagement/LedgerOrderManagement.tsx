/**
 * 원장차수 관리 페이지
 * 책무구조도 원장의 버전 및 라이프사이클 관리
 */

import React, { useState } from 'react';
import { Search, Plus, Edit, Eye, Clock, CheckCircle, X } from 'lucide-react';
import styles from './LedgerOrderManagement.module.scss';

interface LedgerOrder {
  id: number;
  orderNumber: number;
  title: string;
  description: string;
  status: 'draft' | 'approved' | 'active' | 'archived';
  effectiveFrom: string;
  effectiveTo: string;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
}

const mockData: LedgerOrder[] = [
  {
    id: 1,
    orderNumber: 1,
    title: '2024년 1분기 책무구조도',
    description: '2024년 1분기 조직개편에 따른 책무구조도 신규 작성',
    status: 'active',
    effectiveFrom: '2024-01-01',
    effectiveTo: '2024-03-31',
    createdAt: '2023-12-20',
    createdBy: '김관리',
    approvedAt: '2023-12-28',
    approvedBy: '이승인'
  },
  {
    id: 2,
    orderNumber: 2,
    title: '2024년 2분기 책무구조도',
    description: '신규 사업부 신설에 따른 책무 재정의',
    status: 'approved',
    effectiveFrom: '2024-04-01',
    effectiveTo: '2024-06-30',
    createdAt: '2024-03-15',
    createdBy: '박담당',
    approvedAt: '2024-03-25',
    approvedBy: '이승인'
  },
  {
    id: 3,
    orderNumber: 3,
    title: '2024년 3분기 책무구조도',
    description: '하반기 조직 구조 변경 대응',
    status: 'draft',
    effectiveFrom: '2024-07-01',
    effectiveTo: '2024-09-30',
    createdAt: '2024-06-10',
    createdBy: '최작성',
  }
];

const statusConfig = {
  draft: { label: '초안', color: '#ffa726', icon: Edit },
  approved: { label: '승인', color: '#42a5f5', icon: CheckCircle },
  active: { label: '시행', color: '#66bb6a', icon: CheckCircle },
  archived: { label: '보존', color: '#78909c', icon: Clock }
};

const LedgerOrderManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<LedgerOrder | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredData = mockData.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order: LedgerOrder) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    // TODO: 신규 원장차수 생성 모달
    alert('신규 원장차수 생성 기능 - 추후 구현 예정');
  };

  const StatusIcon = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return <Icon size={16} style={{ color: config.color }} />;
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>원장차수 관리</h1>
          <p className={styles.subtitle}>
            책무구조도 원장의 버전 및 라이프사이클을 관리합니다
          </p>
        </div>
        <button className={styles.createButton} onClick={handleCreateNew}>
          <Plus size={20} />
          신규 차수 생성
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="원장차수 제목 또는 설명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.statusFilter}
        >
          <option value="all">전체 상태</option>
          <option value="draft">초안</option>
          <option value="approved">승인</option>
          <option value="active">시행</option>
          <option value="archived">보존</option>
        </select>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {mockData.filter(o => o.status === 'active').length}
          </div>
          <div className={styles.statLabel}>시행 중</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {mockData.filter(o => o.status === 'approved').length}
          </div>
          <div className={styles.statLabel}>승인 대기</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {mockData.filter(o => o.status === 'draft').length}
          </div>
          <div className={styles.statLabel}>작성 중</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{mockData.length}</div>
          <div className={styles.statLabel}>전체</div>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span>원장차수 목록 ({filteredData.length}건)</span>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>차수</th>
                <th>제목</th>
                <th>상태</th>
                <th>효력기간</th>
                <th>작성일</th>
                <th>작성자</th>
                <th>승인일</th>
                <th>승인자</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.orderNumber}>#{order.orderNumber}</td>
                  <td>
                    <div className={styles.titleCell}>
                      <div className={styles.orderTitle}>{order.title}</div>
                      <div className={styles.orderDescription}>{order.description}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.statusCell}>
                      <StatusIcon status={order.status} />
                      <span 
                        className={styles.statusLabel}
                        style={{ color: statusConfig[order.status].color }}
                      >
                        {statusConfig[order.status].label}
                      </span>
                    </div>
                  </td>
                  <td className={styles.periodCell}>
                    <div>{order.effectiveFrom}</div>
                    <div className={styles.periodSeparator}>~</div>
                    <div>{order.effectiveTo}</div>
                  </td>
                  <td>{order.createdAt}</td>
                  <td>{order.createdBy}</td>
                  <td>{order.approvedAt || '-'}</td>
                  <td>{order.approvedBy || '-'}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleViewDetails(order)}
                      title="상세보기"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세보기 모달 */}
      {showModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>원장차수 상세 정보</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <label>차수 번호</label>
                  <span>#{selectedOrder.orderNumber}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>제목</label>
                  <span>{selectedOrder.title}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>설명</label>
                  <span>{selectedOrder.description}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>상태</label>
                  <div className={styles.statusCell}>
                    <StatusIcon status={selectedOrder.status} />
                    <span style={{ color: statusConfig[selectedOrder.status].color }}>
                      {statusConfig[selectedOrder.status].label}
                    </span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>효력 기간</label>
                  <span>{selectedOrder.effectiveFrom} ~ {selectedOrder.effectiveTo}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>작성 정보</label>
                  <span>{selectedOrder.createdAt} / {selectedOrder.createdBy}</span>
                </div>
                {selectedOrder.approvedAt && (
                  <div className={styles.detailItem}>
                    <label>승인 정보</label>
                    <span>{selectedOrder.approvedAt} / {selectedOrder.approvedBy}</span>
                  </div>
                )}
              </div>
              <div className={styles.modalActions}>
                <button className={styles.editButton}>수정</button>
                <button className={styles.responsibilityButton}>책무 관리</button>
                <button className={styles.specButton}>기술서 생성</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerOrderManagement;