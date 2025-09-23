import { useState, useCallback } from 'react';
import type {
  Employee,
  EmployeeLookupFilters,
  EmployeeLookupResult,
  UseEmployeeLookupReturn
} from '../types/employeeLookup.types';

/**
 * 직원조회 커스텀 훅
 * 직원 검색 및 데이터 관리 로직을 캡슐화
 */
export const useEmployeeLookup = (): UseEmployeeLookupReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Mock 데이터 (실제 환경에서는 API 호출로 대체)
  const mockEmployees: Employee[] = [
    {
      id: 'EMP_001',
      employeeId: '0000000',
      name: '관리자',
      branchCode: '0000',
      branchName: '본점',
      department: '팀장',
      position: '관리자',
      status: 'ACTIVE',
      email: 'admin@rsms.com',
      phone: '02-1234-5678',
      hireDate: '2020-01-01',
      specialtyArea: '시스템관리',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'EMP_002',
      employeeId: '0000001',
      name: 'FIT 1',
      branchCode: '2010',
      branchName: '정당건전부',
      department: '대리',
      position: '팀원',
      status: 'ACTIVE',
      email: 'fit1@rsms.com',
      phone: '02-2345-6789',
      hireDate: '2021-03-15',
      specialtyArea: '업무감사',
      isActive: true,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    },
    {
      id: 'EMP_003',
      employeeId: '0000002',
      name: 'FIT 2',
      branchCode: '2010',
      branchName: '정당건전부',
      department: '대리',
      position: '팀원',
      status: 'ACTIVE',
      email: 'fit2@rsms.com',
      phone: '02-3456-7890',
      hireDate: '2021-06-01',
      specialtyArea: '법률검토',
      isActive: true,
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03'
    },
    {
      id: 'EMP_004',
      employeeId: '0000003',
      name: 'FIT 3',
      branchCode: '2041',
      branchName: '감사부',
      department: '과장',
      position: '팀장',
      status: 'ACTIVE',
      email: 'fit3@rsms.com',
      phone: '02-4567-8901',
      hireDate: '2019-09-01',
      specialtyArea: '내부감사',
      isActive: true,
      createdAt: '2024-01-04',
      updatedAt: '2024-01-04'
    },
    {
      id: 'EMP_005',
      employeeId: '0000004',
      name: '김영희',
      branchCode: '0001',
      branchName: '강남지점',
      department: '사원',
      position: '팀원',
      status: 'INACTIVE',
      email: 'kim.younghee@rsms.com',
      phone: '02-5678-9012',
      hireDate: '2020-05-01',
      retireDate: '2023-12-31',
      specialtyArea: '고객관리',
      isActive: false,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-05'
    },
    {
      id: 'EMP_006',
      employeeId: '0000005',
      name: '박철수',
      branchCode: '0002',
      branchName: '부산지점',
      department: '주임',
      position: '팀원',
      status: 'ACTIVE',
      email: 'park.cheolsu@rsms.com',
      phone: '051-6789-0123',
      hireDate: '2022-01-15',
      specialtyArea: '영업관리',
      isActive: true,
      createdAt: '2024-01-06',
      updatedAt: '2024-01-06'
    }
  ];

  /**
   * 직원 검색 함수
   */
  const searchEmployees = useCallback(async (filters: EmployeeLookupFilters) => {
    setLoading(true);
    setError(undefined);

    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션

      // 클라이언트 사이드 필터링 (실제 환경에서는 서버에서 처리)
      let filteredEmployees = mockEmployees;

      if (filters.name) {
        filteredEmployees = filteredEmployees.filter(employee =>
          employee.name.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }

      if (filters.employeeId) {
        filteredEmployees = filteredEmployees.filter(employee =>
          employee.employeeId.toLowerCase().includes(filters.employeeId!.toLowerCase())
        );
      }

      if (filters.department) {
        filteredEmployees = filteredEmployees.filter(employee =>
          employee.department.toLowerCase().includes(filters.department!.toLowerCase())
        );
      }

      if (filters.branchCode) {
        filteredEmployees = filteredEmployees.filter(employee =>
          employee.branchCode.toLowerCase().includes(filters.branchCode!.toLowerCase())
        );
      }

      setEmployees(filteredEmployees);
      setTotalCount(filteredEmployees.length);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '직원 검색 중 오류가 발생했습니다.';
      setError(errorMessage);
      setEmployees([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 검색 결과 초기화
   */
  const clearResults = useCallback(() => {
    setEmployees([]);
    setTotalCount(0);
    setError(undefined);
  }, []);

  return {
    employees,
    loading,
    error,
    searchEmployees,
    clearResults,
    totalCount
  };
};