/**
 * 책무 관리 페이지
 * 책무구조도 원장의 개별 책무 항목들을 관리
 */

import React, { useState } from 'react';
import { Search, Plus, Edit, Eye, FileText, Users, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import styles from './ResponsibilityManagement.module.scss';

interface Responsibility {
  id: number;
  respId: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'review' | 'completed' | 'inactive';
  assigneeId: string;
  assigneeName: string;
  departmentName: string;
  dueDate: string;
  completionRate: number;
  ledgerOrderId: number;
  ledgerOrderTitle: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const mockData: Responsibility[] = [
  {
    id: 1,
    respId: 'R-2024-001',
    title: '내부통제시스템 운영',
    description: '조직 내 리스크 관리 및 내부통제 시스템의 효과적 운영을 담당',
    category: '내부통제',
    priority: 'high',
    status: 'active',
    assigneeId: 'emp001',
    assigneeName: '김부장',
    departmentName: '경영관리부',
    dueDate: '2024-12-31',
    completionRate: 75,
    ledgerOrderId: 1,
    ledgerOrderTitle: '2024년 1분기 책무구조도',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-15',
    tags: ['리스크관리', '내부통제', '컴플라이언스']
  },
  {
    id: 2,
    respId: 'R-2024-002',
    title: '신용리스크 모니터링',
    description: '대출 포트폴리오의 신용리스크 모니터링 및 보고체계 관리',
    category: '리스크관리',
    priority: 'high',
    status: 'active',
    assigneeId: 'emp002',
    assigneeName: '이차장',
    departmentName: '리스크관리부',
    dueDate: '2024-06-30',
    completionRate: 92,
    ledgerOrderId: 1,
    ledgerOrderTitle: '2024년 1분기 책무구조도',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-20',
    tags: ['신용리스크', '모니터링', '보고']
  },
  {
    id: 3,
    respId: 'R-2024-003',
    title: '규제준수 점검',
    description: '금융감독원 규제사항 준수여부 정기 점검 및 개선방안 수립',
    category: '컴플라이언스',
    priority: 'medium',
    status: 'review',
    assigneeId: 'emp003',
    assigneeName: '박과장',
    departmentName: '준법감시부',
    dueDate: '2024-04-30',
    completionRate: 60,
    ledgerOrderId: 2,
    ledgerOrderTitle: '2024년 2분기 책무구조도',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-18',
    tags: ['규제준수', '금융감독원', '컴플라이언스']
  },
  {
    id: 4,
    respId: 'R-2024-004',
    title: '시장리스크 측정 및 관리',
    description: '금리, 주가, 환율 등 시장리스크 요인의 측정 및 관리',
    category: '리스크관리',
    priority: 'high',
    status: 'pending',
    assigneeId: 'emp004',
    assigneeName: '최대리',
    departmentName: '시장리스크부',
    dueDate: '2024-05-31',
    completionRate: 30,
    ledgerOrderId: 2,
    ledgerOrderTitle: '2024년 2분기 책무구조도',
    createdAt: '2024-02-15',
    updatedAt: '2024-03-10',
    tags: ['시장리스크', '금리리스크', 'VaR']
  },
  {
    id: 5,
    respId: 'R-2024-005',
    title: '운영리스크 관리',
    description: '시스템 장애, 인적오류 등 운영리스크 식별 및 관리',
    category: '운영관리',
    priority: 'medium',
    status: 'completed',
    assigneeId: 'emp005',
    assigneeName: '정주임',
    departmentName: '운영지원부',
    dueDate: '2024-03-31',
    completionRate: 100,
    ledgerOrderId: 1,
    ledgerOrderTitle: '2024년 1분기 책무구조도',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-25',
    tags: ['운영리스크', '시스템관리', 'BCP']
  }
];

const statusConfig = {
  active: { label: '진행중', color: '#1976d2', icon: Clock },
  pending: { label: '대기중', color: '#ff9800', icon: AlertTriangle },
  review: { label: '검토중', color: '#9c27b0', icon: Eye },
  completed: { label: '완료', color: '#4caf50', icon: CheckCircle },
  inactive: { label: '비활성', color: '#757575', icon: X }
};

const priorityConfig = {
  high: { label: '높음', color: '#f44336' },
  medium: { label: '보통', color: '#ff9800' },
  low: { label: '낮음', color: '#4caf50' }
};

const ResponsibilityManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedResp, setSelectedResp] = useState<Responsibility | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredData = mockData.filter(resp => {
    const matchesSearch = resp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resp.assigneeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || resp.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || resp.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || resp.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleViewDetails = (resp: Responsibility) => {
    setSelectedResp(resp);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    alert('신규 책무 생성 기능 - 추후 구현 예정');
  };

  const handleAssign = () => {
    alert('책무 할당 기능 - 추후 구현 예정');
  };

  const handleGenerateSpec = () => {
    alert('책무기술서 생성 기능 - 추후 구현 예정');
  };

  const StatusIcon = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return <Icon size={16} style={{ color: config.color }} />;
  };

  const getCompletionBarColor = (rate: number) => {
    if (rate >= 90) return '#4caf50';
    if (rate >= 70) return '#2196f3';
    if (rate >= 50) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>책무 관리</h1>
          <p className={styles.subtitle}>
            조직의 책무 항목들을 할당하고 진행상황을 모니터링합니다
          </p>
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.assignButton} onClick={handleAssign}>
            <Users size={20} />
            책무 할당
          </button>
          <button className={styles.createButton} onClick={handleCreateNew}>
            <Plus size={20} />
            신규 책무 생성
          </button>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="책무명, 담당자명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filter}
        >
          <option value="all">전체 상태</option>
          <option value="active">진행중</option>
          <option value="pending">대기중</option>
          <option value="review">검토중</option>
          <option value="completed">완료</option>
          <option value="inactive">비활성</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className={styles.filter}
        >
          <option value="all">전체 우선순위</option>
          <option value="high">높음</option>
          <option value="medium">보통</option>
          <option value="low">낮음</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={styles.filter}
        >
          <option value="all">전체 카테고리</option>
          <option value="내부통제">내부통제</option>
          <option value="리스크관리">리스크관리</option>
          <option value="컴플라이언스">컴플라이언스</option>
          <option value="운영관리">운영관리</option>
        </select>
      </div>

      {/* 통계 섹션 */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {mockData.filter(r => r.status === 'active').length}
          </div>
          <div className={styles.statLabel}>진행중</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {mockData.filter(r => r.status === 'pending').length}
          </div>
          <div className={styles.statLabel}>대기중</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {Math.round(mockData.reduce((sum, r) => sum + r.completionRate, 0) / mockData.length)}%
          </div>
          <div className={styles.statLabel}>평균 진행률</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{mockData.length}</div>
          <div className={styles.statLabel}>전체 책무</div>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span>책무 목록 ({filteredData.length}건)</span>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>책무번호</th>
                <th>책무명</th>
                <th>카테고리</th>
                <th>우선순위</th>
                <th>상태</th>
                <th>담당자</th>
                <th>부서</th>
                <th>진행률</th>
                <th>완료예정일</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((resp) => (
                <tr key={resp.id} className={styles.tableRow}>
                  <td className={styles.respId}>{resp.respId}</td>
                  <td>
                    <div className={styles.titleCell}>
                      <div className={styles.respTitle}>{resp.title}</div>
                      <div className={styles.respDescription}>{resp.description}</div>
                      <div className={styles.tagContainer}>
                        {resp.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                        {resp.tags.length > 2 && (
                          <span className={styles.tagMore}>+{resp.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.category}>{resp.category}</td>
                  <td>
                    <span 
                      className={styles.priority}
                      style={{ 
                        color: priorityConfig[resp.priority].color,
                        backgroundColor: `${priorityConfig[resp.priority].color}20`
                      }}
                    >
                      {priorityConfig[resp.priority].label}
                    </span>
                  </td>
                  <td>
                    <div className={styles.statusCell}>
                      <StatusIcon status={resp.status} />
                      <span 
                        className={styles.statusLabel}
                        style={{ color: statusConfig[resp.status].color }}
                      >
                        {statusConfig[resp.status].label}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.assigneeCell}>
                      <div className={styles.assigneeName}>{resp.assigneeName}</div>
                    </div>
                  </td>
                  <td className={styles.department}>{resp.departmentName}</td>
                  <td>
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ 
                            width: `${resp.completionRate}%`,
                            backgroundColor: getCompletionBarColor(resp.completionRate)
                          }}
                        />
                      </div>
                      <span className={styles.progressText}>{resp.completionRate}%</span>
                    </div>
                  </td>
                  <td className={styles.dueDate}>{resp.dueDate}</td>
                  <td>
                    <div className={styles.actionButtonGroup}>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleViewDetails(resp)}
                        title="상세보기"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={handleGenerateSpec}
                        title="기술서 생성"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세보기 모달 */}
      {showModal && selectedResp && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>책무 상세 정보</h2>
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
                  <label>책무번호</label>
                  <span>{selectedResp.respId}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>책무명</label>
                  <span>{selectedResp.title}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>설명</label>
                  <span>{selectedResp.description}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>카테고리</label>
                  <span>{selectedResp.category}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>우선순위</label>
                  <span style={{ color: priorityConfig[selectedResp.priority].color }}>
                    {priorityConfig[selectedResp.priority].label}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label>상태</label>
                  <div className={styles.statusCell}>
                    <StatusIcon status={selectedResp.status} />
                    <span style={{ color: statusConfig[selectedResp.status].color }}>
                      {statusConfig[selectedResp.status].label}
                    </span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>담당자</label>
                  <span>{selectedResp.assigneeName} ({selectedResp.departmentName})</span>
                </div>
                <div className={styles.detailItem}>
                  <label>진행률</label>
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ 
                          width: `${selectedResp.completionRate}%`,
                          backgroundColor: getCompletionBarColor(selectedResp.completionRate)
                        }}
                      />
                    </div>
                    <span className={styles.progressText}>{selectedResp.completionRate}%</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>완료예정일</label>
                  <span>{selectedResp.dueDate}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>원장차수</label>
                  <span>{selectedResp.ledgerOrderTitle}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>태그</label>
                  <div className={styles.tagContainer}>
                    {selectedResp.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>작성일</label>
                  <span>{selectedResp.createdAt}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>최종수정일</label>
                  <span>{selectedResp.updatedAt}</span>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.editButton}>수정</button>
                <button className={styles.specButton}>기술서 생성</button>
                <button className={styles.historyButton}>이력 보기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsibilityManagement;