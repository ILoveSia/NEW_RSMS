package com.rsms.domain.employee.dto;

import com.rsms.domain.employee.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 직원 응답 DTO
 * - 직원 정보를 클라이언트로 전달하는 DTO
 * - 조직명(orgName)을 포함한 확장 정보 제공
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {

    private String empNo;                   // 직원번호
    private String orgCode;                 // 조직코드
    private String orgName;                 // 조직명 (JOIN)
    private String positionCode;            // 직책코드
    private String positionName;            // 직책명 (JOIN)
    private String empName;                 // 직원명
    private String empNameEn;               // 영문명
    private String employeeNo;              // 인사시스템 사원번호
    private LocalDate birthDate;            // 생년월일
    private String gender;                  // 성별
    private String mobileNo;                // 휴대전화
    private String email;                   // 이메일
    private String officeTel;               // 사무실 전화
    private String emergencyContact;        // 비상연락처
    private String emergencyContactName;    // 비상연락처 이름
    private LocalDate joinDate;             // 입사일자
    private LocalDate resignDate;           // 퇴사일자
    private String employmentStatus;        // 재직상태
    private String employmentType;          // 고용형태
    private String jobGrade;                // 직급
    private String jobTitle;                // 직함
    private Integer jobLevel;               // 직급레벨
    private String salaryGrade;             // 호봉
    private BigDecimal annualSalary;        // 연봉
    private String workLocation;            // 근무지
    private String workType;                // 근무형태
    private String profileImageUrl;         // 프로필 사진 URL
    private String signatureImageUrl;       // 서명 이미지 URL
    private String bio;                     // 간단 소개
    private String skills;                  // 보유 기술
    private String certifications;          // 자격증
    private String isActive;                // 활성화 여부
    private String createdBy;               // 생성자
    private LocalDateTime createdAt;        // 생성일시
    private String updatedBy;               // 수정자
    private LocalDateTime updatedAt;        // 수정일시

    /**
     * Employee 엔티티를 EmployeeResponse DTO로 변환
     * @param employee Employee 엔티티
     * @return EmployeeResponse DTO
     */
    public static EmployeeResponse from(Employee employee) {
        return EmployeeResponse.builder()
                .empNo(employee.getEmpNo())
                .orgCode(employee.getOrgCode())
                .orgName(null)  // JOIN 필요 시 별도 설정
                .positionCode(employee.getPositionCode())
                .positionName(null)  // JOIN 필요 시 별도 설정
                .empName(employee.getEmpName())
                .empNameEn(employee.getEmpNameEn())
                .employeeNo(employee.getEmployeeNo())
                .birthDate(employee.getBirthDate())
                .gender(employee.getGender())
                .mobileNo(employee.getMobileNo())
                .email(employee.getEmail())
                .officeTel(employee.getOfficeTel())
                .emergencyContact(employee.getEmergencyContact())
                .emergencyContactName(employee.getEmergencyContactName())
                .joinDate(employee.getJoinDate())
                .resignDate(employee.getResignDate())
                .employmentStatus(employee.getEmploymentStatus())
                .employmentType(employee.getEmploymentType())
                .jobGrade(employee.getJobGrade())
                .jobTitle(employee.getJobTitle())
                .jobLevel(employee.getJobLevel())
                .salaryGrade(employee.getSalaryGrade())
                .annualSalary(employee.getAnnualSalary())
                .workLocation(employee.getWorkLocation())
                .workType(employee.getWorkType())
                .profileImageUrl(employee.getProfileImageUrl())
                .signatureImageUrl(employee.getSignatureImageUrl())
                .bio(employee.getBio())
                .skills(employee.getSkills())
                .certifications(employee.getCertifications())
                .isActive(employee.getIsActive())
                .createdBy(employee.getCreatedBy())
                .createdAt(employee.getCreatedAt())
                .updatedBy(employee.getUpdatedBy())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }

    /**
     * Employee 엔티티와 조직명을 포함한 EmployeeResponse DTO로 변환
     * @param employee Employee 엔티티
     * @param orgName 조직명
     * @return EmployeeResponse DTO
     */
    public static EmployeeResponse fromWithOrgName(Employee employee, String orgName) {
        EmployeeResponse response = from(employee);
        return EmployeeResponse.builder()
                .empNo(response.getEmpNo())
                .orgCode(response.getOrgCode())
                .orgName(orgName)
                .positionCode(response.getPositionCode())
                .positionName(response.getPositionName())
                .empName(response.getEmpName())
                .empNameEn(response.getEmpNameEn())
                .employeeNo(response.getEmployeeNo())
                .birthDate(response.getBirthDate())
                .gender(response.getGender())
                .mobileNo(response.getMobileNo())
                .email(response.getEmail())
                .officeTel(response.getOfficeTel())
                .emergencyContact(response.getEmergencyContact())
                .emergencyContactName(response.getEmergencyContactName())
                .joinDate(response.getJoinDate())
                .resignDate(response.getResignDate())
                .employmentStatus(response.getEmploymentStatus())
                .employmentType(response.getEmploymentType())
                .jobGrade(response.getJobGrade())
                .jobTitle(response.getJobTitle())
                .jobLevel(response.getJobLevel())
                .salaryGrade(response.getSalaryGrade())
                .annualSalary(response.getAnnualSalary())
                .workLocation(response.getWorkLocation())
                .workType(response.getWorkType())
                .profileImageUrl(response.getProfileImageUrl())
                .signatureImageUrl(response.getSignatureImageUrl())
                .bio(response.getBio())
                .skills(response.getSkills())
                .certifications(response.getCertifications())
                .isActive(response.getIsActive())
                .createdBy(employee.getCreatedBy())
                .createdAt(employee.getCreatedAt())
                .updatedBy(employee.getUpdatedBy())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
}
