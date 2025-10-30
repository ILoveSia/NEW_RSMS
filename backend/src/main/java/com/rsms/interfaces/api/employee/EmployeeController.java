package com.rsms.interfaces.api.employee;

import com.rsms.domain.employee.dto.EmployeeResponse;
import com.rsms.domain.employee.dto.EmployeeSearchRequest;
import com.rsms.domain.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 직원 API 컨트롤러
 * - 직원 조회 및 검색 REST API 제공
 * - 공통 직원조회 팝업에서 사용
 */
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Slf4j
public class EmployeeController {

    private final EmployeeService employeeService;

    /**
     * 직원 검색 API
     * - POST /api/employees/search
     * - 여러 조건으로 직원 검색 (조직명 JOIN 포함)
     *
     * @param request 검색 조건
     * @return 직원 목록
     */
    @PostMapping("/search")
    public ResponseEntity<List<EmployeeResponse>> searchEmployees(
            @RequestBody EmployeeSearchRequest request) {
        log.info("직원 검색 API 호출: {}", request);

        List<EmployeeResponse> employees = employeeService.searchEmployees(request);

        log.info("직원 검색 완료: {} 건", employees.size());
        return ResponseEntity.ok(employees);
    }

    /**
     * 활성화된 재직자 조회 API
     * - GET /api/employees/active
     * - 활성화 상태이면서 재직 중인 직원만 조회
     *
     * @return 활성화된 재직자 목록
     */
    @GetMapping("/active")
    public ResponseEntity<List<EmployeeResponse>> getActiveEmployees() {
        log.info("활성화된 재직자 조회 API 호출");

        List<EmployeeResponse> employees = employeeService.getActiveEmployees();

        log.info("활성화된 재직자 조회 완료: {} 건", employees.size());
        return ResponseEntity.ok(employees);
    }

    /**
     * 직원번호로 직원 조회 API
     * - GET /api/employees/{empNo}
     * - 특정 직원의 상세 정보 조회
     *
     * @param empNo 직원번호
     * @return 직원 정보
     */
    @GetMapping("/{empNo}")
    public ResponseEntity<EmployeeResponse> getEmployeeByEmpNo(
            @PathVariable String empNo) {
        log.info("직원 조회 API 호출: empNo={}", empNo);

        EmployeeResponse employee = employeeService.getEmployeeByEmpNo(empNo);

        log.info("직원 조회 완료: {}", empNo);
        return ResponseEntity.ok(employee);
    }

    /**
     * 조직별 직원 목록 조회 API
     * - GET /api/employees/org/{orgCode}
     * - 특정 조직에 소속된 직원 목록 조회
     *
     * @param orgCode 조직코드
     * @return 직원 목록
     */
    @GetMapping("/org/{orgCode}")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByOrgCode(
            @PathVariable String orgCode) {
        log.info("조직별 직원 조회 API 호출: orgCode={}", orgCode);

        List<EmployeeResponse> employees = employeeService.getEmployeesByOrgCode(orgCode);

        log.info("조직별 직원 조회 완료: {} 건", employees.size());
        return ResponseEntity.ok(employees);
    }

    /**
     * 직급별 직원 목록 조회 API
     * - GET /api/employees/job-grade/{jobGrade}
     * - 특정 직급의 직원 목록 조회
     *
     * @param jobGrade 직급
     * @return 직원 목록
     */
    @GetMapping("/job-grade/{jobGrade}")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByJobGrade(
            @PathVariable String jobGrade) {
        log.info("직급별 직원 조회 API 호출: jobGrade={}", jobGrade);

        List<EmployeeResponse> employees = employeeService.getEmployeesByJobGrade(jobGrade);

        log.info("직급별 직원 조회 완료: {} 건", employees.size());
        return ResponseEntity.ok(employees);
    }
}
