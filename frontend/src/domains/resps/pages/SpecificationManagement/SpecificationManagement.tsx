/**
 * 책무기술서 관리 페이지
 * 책무에 대한 상세 기술서(업무매뉴얼) 작성 및 관리
 */

import React, { useState } from 'react';
import { Search, Plus, Edit, Eye, Download, FileText, Clock, CheckCircle, AlertTriangle, X, Users, Calendar } from 'lucide-react';
import styles from './SpecificationManagement.module.scss';

interface Specification {
  id: number;
  specId: string;
  title: string;
  description: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  category: string;
  responsibilityId: string;
  responsibilityTitle: string;
  authorId: string;
  authorName: string;
  reviewerId?: string;
  reviewerName?: string;
  approverId?: string;
  approverName?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  documentSize: string;
  downloadCount: number;
  viewCount: number;
  tags: string[];
}

const mockData: Specification[] = [
  {
    id: 1,
    specId: 'SPEC-2024-001',
    title: '내부통제시스템 운영 매뉴얼',
    description: '조직 내 리스크 관리 및 내부통제 시스템 운영을 위한 상세 업무 매뉴얼',
    version: 'v1.2',
    status: 'published',
    category: '내부통제',
    responsibilityId: 'R-2024-001',
    responsibilityTitle: '내부통제시스템 운영',
    authorId: 'emp001',
    authorName: '김부장',
    reviewerId: 'emp006',
    reviewerName: '이과장',
    approverId: 'emp007',
    approverName: '박이사',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-10',
    publishedAt: '2024-03-15',
    effectiveFrom: '2024-03-15',
    effectiveTo: '2024-12-31',
    documentSize: '2.4MB',
    downloadCount: 45,
    viewCount: 128,
    tags: ['매뉴얼', '내부통제', '리스크관리', 'SOP']
  },
  {
    id: 2,
    specId: 'SPEC-2024-002',
    title: '신용리스크 모니터링 가이드',
    description: '대출 포트폴리오 신용리스크 모니터링 절차 및 보고체계 가이드',
    version: 'v2.0',
    status: 'approved',
    category: '리스크관리',
    responsibilityId: 'R-2024-002',
    responsibilityTitle: '신용리스크 모니터링',
    authorId: 'emp002',
    authorName: '이차장',
    reviewerId: 'emp008',
    reviewerName: '김팀장',
    approverId: 'emp007',
    approverName: '박이사',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-20',
    publishedAt: '2024-03-25',
    effectiveFrom: '2024-04-01',
    documentSize: '3.1MB',
    downloadCount: 32,
    viewCount: 89,
    tags: ['가이드', '신용리스크', '모니터링', '포트폴리오']
  },
  {
    id: 3,
    specId: 'SPEC-2024-003',
    title: '규제준수 점검 체크리스트',
    description: '금융감독원 규제사항 준수여부 점검을 위한 체크리스트 및 절차서',
    version: 'v1.0',
    status: 'review',
    category: '컴플라이언스',
    responsibilityId: 'R-2024-003',
    responsibilityTitle: '규제준수 점검',
    authorId: 'emp003',
    authorName: '박과장',
    reviewerId: 'emp009',
    reviewerName: '정차장',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-18',
    documentSize: '1.8MB',
    downloadCount: 12,
    viewCount: 34,
    tags: ['체크리스트', '규제준수', '금융감독원', '컴플라이언스']
  },
  {
    id: 4,
    specId: 'SPEC-2024-004',
    title: '시장리스크 측정 방법론',
    description: '금리, 주가, 환율 등 시장리스크 요인의 측정 및 관리 방법론',
    version: 'v1.1',
    status: 'draft',
    category: '리스크관리',
    responsibilityId: 'R-2024-004',
    responsibilityTitle: '시장리스크 측정 및 관리',
    authorId: 'emp004',
    authorName: '최대리',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-19',
    documentSize: '2.7MB',
    downloadCount: 8,
    viewCount: 22,
    tags: ['방법론', '시장리스크', 'VaR', '측정']
  },
  {
    id: 5,
    specId: 'SPEC-2024-005',
    title: '운영리스크 관리 프로세스',
    description: '시스템 장애, 인적오류 등 운영리스크 식별 및 관리 프로세스',
    version: 'v1.3',
    status: 'archived',
    category: '운영관리',
    responsibilityId: 'R-2024-005',
    responsibilityTitle: '운영리스크 관리',
    authorId: 'emp005',
    authorName: '정주임',
    reviewerId: 'emp010',
    reviewerName: '한과장',
    approverId: 'emp007',
    approverName: '박이사',
    createdAt: '2024-01-10',
    updatedAt: '2024-02-28',
    publishedAt: '2024-03-01',
    effectiveFrom: '2024-03-01',
    effectiveTo: '2024-02-29',
    documentSize: '1.9MB',
    downloadCount: 67,
    viewCount: 156,
    tags: ['프로세스', '운영리스크', 'BCP', '시스템']
  }
];

const statusConfig = {
  draft: { label: '초안', color: '#ff9800', icon: Edit },
  review: { label: '검토중', color: '#9c27b0', icon: Eye },
  approved: { label: '승인', color: '#2196f3', icon: CheckCircle },
  published: { label: '배포', color: '#4caf50', icon: CheckCircle },
  archived: { label: '보관', color: '#757575', icon: Clock }
};

const SpecificationManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSpec, setSelectedSpec] = useState<Specification | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredData = mockData.filter(spec => {
    const matchesSearch = spec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spec.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || spec.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || spec.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewDetails = (spec: Specification) => {
    setSelectedSpec(spec);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    alert('신규 기술서 생성 기능 - 추후 구현 예정');
  };

  const handleDownload = (spec: Specification) => {
    alert(`${spec.title} 다운로드 기능 - 추후 구현 예정`);
  };

  const handleEdit = () => {
    alert('기술서 편집 기능 - 추후 구현 예정');
  };

  const handleApprove = () => {
    alert('기술서 승인 기능 - 추후 구현 예정');
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
          <h1 className={styles.title}>책무기술서 관리</h1>
          <p className={styles.subtitle}>
            책무 수행을 위한 상세 기술서와 업무 매뉴얼을 관리합니다
          </p>
        </div>
        <button className={styles.createButton} onClick={handleCreateNew}>
          <Plus size={20} />
          신규 기술서 작성
        </button>
      </div>

      {/* 필터 섹션 */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="기술서명, 작성자명으로 검색..."
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
          <option value="draft">초안</option>
          <option value="review">검토중</option>
          <option value="approved">승인</option>
          <option value="published">배포</option>
          <option value="archived">보관</option>
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
            {mockData.filter(s => s.status === 'published').length}
          </div>
          <div className={styles.statLabel}>배포중</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {mockData.filter(s => s.status === 'review').length}
          </div>
          <div className={styles.statLabel}>검토중</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {mockData.reduce((sum, s) => sum + s.downloadCount, 0)}
          </div>
          <div className={styles.statLabel}>총 다운로드</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{mockData.length}</div>
          <div className={styles.statLabel}>전체 기술서</div>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span>기술서 목록 ({filteredData.length}건)</span>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>기술서번호</th>
                <th>제목</th>
                <th>버전</th>
                <th>상태</th>
                <th>카테고리</th>
                <th>작성자</th>
                <th>검토자</th>
                <th>승인자</th>
                <th>다운로드</th>
                <th>조회수</th>
                <th>최종수정일</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((spec) => (
                <tr key={spec.id} className={styles.tableRow}>
                  <td className={styles.specId}>{spec.specId}</td>
                  <td>
                    <div className={styles.titleCell}>
                      <div className={styles.specTitle}>{spec.title}</div>
                      <div className={styles.specDescription}>{spec.description}</div>
                      <div className={styles.tagContainer}>
                        {spec.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                        {spec.tags.length > 2 && (
                          <span className={styles.tagMore}>+{spec.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.version}>{spec.version}</td>
                  <td>
                    <div className={styles.statusCell}>
                      <StatusIcon status={spec.status} />
                      <span 
                        className={styles.statusLabel}
                        style={{ color: statusConfig[spec.status].color }}
                      >
                        {statusConfig[spec.status].label}
                      </span>
                    </div>
                  </td>
                  <td className={styles.category}>{spec.category}</td>
                  <td className={styles.author}>{spec.authorName}</td>
                  <td className={styles.reviewer}>{spec.reviewerName || '-'}</td>
                  <td className={styles.approver}>{spec.approverName || '-'}</td>
                  <td className={styles.downloadCount}>
                    <div className={styles.countCell}>
                      <Download size={14} />
                      <span>{spec.downloadCount}</span>
                    </div>
                  </td>
                  <td className={styles.viewCount}>
                    <div className={styles.countCell}>
                      <Eye size={14} />
                      <span>{spec.viewCount}</span>
                    </div>
                  </td>
                  <td className={styles.updatedAt}>{spec.updatedAt}</td>
                  <td>
                    <div className={styles.actionButtonGroup}>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleViewDetails(spec)}
                        title="상세보기"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleDownload(spec)}
                        title="다운로드"
                      >
                        <Download size={16} />
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
      {showModal && selectedSpec && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>기술서 상세 정보</h2>
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
                  <label>기술서번호</label>
                  <span>{selectedSpec.specId}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>제목</label>
                  <span>{selectedSpec.title}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>설명</label>
                  <span>{selectedSpec.description}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>버전</label>
                  <span>{selectedSpec.version}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>상태</label>
                  <div className={styles.statusCell}>
                    <StatusIcon status={selectedSpec.status} />
                    <span style={{ color: statusConfig[selectedSpec.status].color }}>
                      {statusConfig[selectedSpec.status].label}
                    </span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>카테고리</label>
                  <span>{selectedSpec.category}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>연관 책무</label>
                  <span>{selectedSpec.responsibilityTitle} ({selectedSpec.responsibilityId})</span>
                </div>
                <div className={styles.detailItem}>
                  <label>작성자</label>
                  <span>{selectedSpec.authorName}</span>
                </div>
                {selectedSpec.reviewerName && (
                  <div className={styles.detailItem}>
                    <label>검토자</label>
                    <span>{selectedSpec.reviewerName}</span>
                  </div>
                )}
                {selectedSpec.approverName && (
                  <div className={styles.detailItem}>
                    <label>승인자</label>
                    <span>{selectedSpec.approverName}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <label>문서 크기</label>
                  <span>{selectedSpec.documentSize}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>다운로드 수</label>
                  <span>{selectedSpec.downloadCount}회</span>
                </div>
                <div className={styles.detailItem}>
                  <label>조회수</label>
                  <span>{selectedSpec.viewCount}회</span>
                </div>
                {selectedSpec.effectiveFrom && (
                  <div className={styles.detailItem}>
                    <label>효력 기간</label>
                    <span>{selectedSpec.effectiveFrom} ~ {selectedSpec.effectiveTo}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <label>태그</label>
                  <div className={styles.tagContainer}>
                    {selectedSpec.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>작성일</label>
                  <span>{selectedSpec.createdAt}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>최종수정일</label>
                  <span>{selectedSpec.updatedAt}</span>
                </div>
                {selectedSpec.publishedAt && (
                  <div className={styles.detailItem}>
                    <label>배포일</label>
                    <span>{selectedSpec.publishedAt}</span>
                  </div>
                )}
              </div>
              <div className={styles.modalActions}>
                <button className={styles.downloadButton} onClick={() => handleDownload(selectedSpec)}>
                  <Download size={16} />
                  다운로드
                </button>
                <button className={styles.editButton} onClick={handleEdit}>
                  <Edit size={16} />
                  편집
                </button>
                <button className={styles.approveButton} onClick={handleApprove}>
                  <CheckCircle size={16} />
                  승인
                </button>
                <button className={styles.historyButton}>
                  <Clock size={16} />
                  이력
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecificationManagement;