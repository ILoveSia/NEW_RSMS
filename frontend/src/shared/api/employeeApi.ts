/**
 * 직원 API 클라이언트
 * - 직원 조회 및 검색 API 호출
 */

import axios from 'axios';
import { Employee, EmployeeSearchFilter } from '@/shared/types/employee';

const API_BASE_URL = '/api/employees';

/**
 * 직원 검색 API
 * - POST /api/employees/search
 * - 여러 조건으로 직원 검색 (조직명 JOIN 포함)
 *
 * @param filter 검색 조건
 * @returns 직원 목록
 */
export const searchEmployees = async (filter: EmployeeSearchFilter): Promise<Employee[]> => {
  try {
    const response = await axios.post<Employee[]>(`${API_BASE_URL}/search`, filter);
    return response.data;
  } catch (error) {
    console.error('직원 검색 실패:', error);
    throw error;
  }
};

/**
 * 활성화된 재직자 조회 API
 * - GET /api/employees/active
 * - 활성화 상태이면서 재직 중인 직원만 조회
 *
 * @returns 활성화된 재직자 목록
 */
export const getActiveEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await axios.get<Employee[]>(`${API_BASE_URL}/active`);
    return response.data;
  } catch (error) {
    console.error('활성화된 재직자 조회 실패:', error);
    throw error;
  }
};

/**
 * 직원번호로 직원 조회 API
 * - GET /api/employees/{empNo}
 * - 특정 직원의 상세 정보 조회
 *
 * @param empNo 직원번호
 * @returns 직원 정보
 */
export const getEmployeeByEmpNo = async (empNo: string): Promise<Employee> => {
  try {
    const response = await axios.get<Employee>(`${API_BASE_URL}/${empNo}`);
    return response.data;
  } catch (error) {
    console.error('직원 조회 실패:', error);
    throw error;
  }
};

/**
 * 조직별 직원 목록 조회 API
 * - GET /api/employees/org/{orgCode}
 * - 특정 조직에 소속된 직원 목록 조회
 *
 * @param orgCode 조직코드
 * @returns 직원 목록
 */
export const getEmployeesByOrgCode = async (orgCode: string): Promise<Employee[]> => {
  try {
    const response = await axios.get<Employee[]>(`${API_BASE_URL}/org/${orgCode}`);
    return response.data;
  } catch (error) {
    console.error('조직별 직원 조회 실패:', error);
    throw error;
  }
};

/**
 * 직급별 직원 목록 조회 API
 * - GET /api/employees/job-grade/{jobGrade}
 * - 특정 직급의 직원 목록 조회
 *
 * @param jobGrade 직급
 * @returns 직원 목록
 */
export const getEmployeesByJobGrade = async (jobGrade: string): Promise<Employee[]> => {
  try {
    const response = await axios.get<Employee[]>(`${API_BASE_URL}/job-grade/${jobGrade}`);
    return response.data;
  } catch (error) {
    console.error('직급별 직원 조회 실패:', error);
    throw error;
  }
};

// 기본 export
const employeeApi = {
  searchEmployees,
  getActiveEmployees,
  getEmployeeByEmpNo,
  getEmployeesByOrgCode,
  getEmployeesByJobGrade,
};

export default employeeApi;
