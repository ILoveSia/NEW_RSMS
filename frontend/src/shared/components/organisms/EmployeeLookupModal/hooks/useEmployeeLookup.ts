import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { searchEmployees as searchEmployeesApi } from '@/shared/api/employeeApi';
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

  /**
   * 직원 검색 함수 (실제 API 호출)
   */
  const searchEmployees = useCallback(async (filters: EmployeeLookupFilters) => {
    setLoading(true);
    setError(undefined);

    try {
      // 실제 API 호출
      const response = await searchEmployeesApi({
        empName: filters.name,
        empNo: filters.employeeId,
        jobGrade: filters.department,
        orgCode: filters.branchCode
      });

      // Employee 타입으로 매핑
      const mappedEmployees: Employee[] = response.map((emp: any) => ({
        id: emp.empNo,
        employeeId: emp.empNo,
        name: emp.empName,
        branchCode: emp.orgCode || '',
        branchName: emp.orgName || '',
        department: emp.jobGrade || '',
        position: emp.positionTitle || '',
        status: emp.isActive ? 'ACTIVE' : 'INACTIVE',
        email: emp.email,
        phone: emp.phone,
        hireDate: emp.hireDate,
        retireDate: emp.retireDate,
        specialtyArea: emp.specialtyArea,
        isActive: emp.isActive,
        createdAt: emp.createdAt || new Date().toISOString(),
        updatedAt: emp.updatedAt || new Date().toISOString()
      }));

      setEmployees(mappedEmployees);
      setTotalCount(mappedEmployees.length);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '직원 검색 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error('직원 목록을 불러오는데 실패했습니다.');
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