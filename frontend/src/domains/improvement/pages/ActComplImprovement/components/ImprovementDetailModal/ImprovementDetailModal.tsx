import React from 'react';
import type {
  ActComplImprovement,
  ActComplImprovementFormData
} from '../../types/actComplImprovement.types';

interface ImprovementDetailModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  itemData?: ActComplImprovement | null;
  onClose: () => void;
  onSave?: (data: ActComplImprovementFormData) => void;
  onUpdate?: (id: string, data: ActComplImprovementFormData) => void;
  loading?: boolean;
}

const ImprovementDetailModal: React.FC<ImprovementDetailModalProps> = ({
  open,
  mode,
  itemData,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%'
      }}>
        <h2>{mode === 'create' ? '개선이행 등록' : '개선이행 상세'}</h2>
        <p>개선이행 모달 컴포넌트 (구현 예정)</p>
        {itemData && (
          <div>
            <p><strong>관리활동명:</strong> {itemData.activityName}</p>
            <p><strong>부품명:</strong> {itemData.departmentName}</p>
            <p><strong>진행상태:</strong> {itemData.status}</p>
          </div>
        )}
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button onClick={onClose} style={{ marginRight: '8px' }}>닫기</button>
          {mode === 'create' && <button disabled={loading}>등록</button>}
          {mode === 'detail' && <button disabled={loading}>수정</button>}
        </div>
      </div>
    </div>
  );
};

export default ImprovementDetailModal;