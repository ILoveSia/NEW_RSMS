package com.rsms.domain.employee.service;

import com.rsms.domain.employee.dto.EmployeeResponse;
import com.rsms.domain.employee.dto.EmployeeSearchRequest;
import com.rsms.domain.employee.entity.Employee;
import com.rsms.domain.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 직원 서비스
 * - 직원 데이터 조회 및 검색 비즈니스 로직
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    /**
     * 직원 검색 (조직명 JOIN 포함)
     * - 여러 조건으로 직원 검색
     * - 조직명을 포함한 결과 반환
     *
     * @param request 검색 조건
     * @return 직원 목록 (조직명 포함)
     */
    public List<EmployeeResponse> searchEmployees(EmployeeSearchRequest request) {
        log.debug("직원 검색 시작: {}", request);

        // Repository에서 조직명과 함께 조회
        List<Object[]> results = employeeRepository.searchEmployeesWithOrgName(
                request.getEmpNo(),
                request.getEmpName(),
                request.getOrgCode(),
                request.getEmploymentStatus()
        );

        // Object[] -> EmployeeResponse 변환
        List<EmployeeResponse> responses = results.stream()
                .map(result -> {
                    Employee employee = (Employee) result[0];
                    String orgName = result.length > 1 && result[1] != null ? (String) result[1] : null;
                    return EmployeeResponse.fromWithOrgName(employee, orgName);
                })
                .collect(Collectors.toList());

        log.debug("직원 검색 완료: {} 건", responses.size());
        return responses;
    }

    /**
     * 활성화된 재직자만 조회
     * @return 활성화된 재직자 목록
     */
    public List<EmployeeResponse> getActiveEmployees() {
        log.debug("활성화된 재직자 조회");

        List<Employee> employees = employeeRepository.findActiveEmployees();

        return employees.stream()
                .map(EmployeeResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 직원번호로 직원 조회
     * @param empNo 직원번호
     * @return 직원 정보
     */
    public EmployeeResponse getEmployeeByEmpNo(String empNo) {
        log.debug("직원 조회: empNo={}", empNo);

        Employee employee = employeeRepository.findByEmpNoAndNotDeleted(empNo)
                .orElseThrow(() -> new IllegalArgumentException("직원을 찾을 수 없습니다: " + empNo));

        return EmployeeResponse.from(employee);
    }

    /**
     * 조직코드로 직원 목록 조회
     * @param orgCode 조직코드
     * @return 직원 목록
     */
    public List<EmployeeResponse> getEmployeesByOrgCode(String orgCode) {
        log.debug("조직별 직원 조회: orgCode={}", orgCode);

        List<Employee> employees = employeeRepository.findByOrgCodeAndNotDeleted(orgCode);

        return employees.stream()
                .map(EmployeeResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 직급으로 직원 목록 조회
     * @param jobGrade 직급
     * @return 직원 목록
     */
    public List<EmployeeResponse> getEmployeesByJobGrade(String jobGrade) {
        log.debug("직급별 직원 조회: jobGrade={}", jobGrade);

        List<Employee> employees = employeeRepository.findByJobGradeAndNotDeleted(jobGrade);

        return employees.stream()
                .map(EmployeeResponse::from)
                .collect(Collectors.toList());
    }
}
