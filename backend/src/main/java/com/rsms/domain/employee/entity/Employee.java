package com.rsms.domain.employee.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 직원 엔티티
 * - 조직 구성원(직원) 정보를 관리하는 엔티티
 * - organizations 테이블과 N:1 관계 (org_code FK)
 * - positions 테이블과 N:1 관계 (position_code FK)
 * - users 테이블과 1:1 관계 (emp_no)
 * - BaseEntity를 상속하지 않고 자체 감사 필드 관리 (employees 테이블 구조에 맞춤)
 */
@Entity
@Table(name = "employees", schema = "rsms")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Employee {

    /**
     * 직원번호 (PK)
     */
    @Id
    @Column(name = "emp_no", length = 20, nullable = false)
    private String empNo;

    /**
     * 소속조직코드 (FK → organizations)
     */
    @Column(name = "org_code", length = 20, nullable = false)
    private String orgCode;

    /**
     * 직책코드 (FK → positions)
     */
    @Column(name = "position_code", length = 20)
    private String positionCode;

    /**
     * 직원명
     */
    @Column(name = "emp_name", length = 100, nullable = false)
    private String empName;

    /**
     * 영문명
     */
    @Column(name = "emp_name_en", length = 100)
    private String empNameEn;

    /**
     * 인사시스템 사원번호
     */
    @Column(name = "employee_no", length = 50)
    private String employeeNo;

    /**
     * 생년월일
     */
    @Column(name = "birth_date")
    private LocalDate birthDate;

    /**
     * 성별 (M: 남성, F: 여성, O: 기타)
     */
    @Column(name = "gender", length = 1)
    private String gender;

    /**
     * 휴대전화번호
     */
    @Column(name = "mobile_no", length = 20)
    private String mobileNo;

    /**
     * 이메일
     */
    @Column(name = "email", length = 100)
    private String email;

    /**
     * 사무실 전화번호
     */
    @Column(name = "office_tel", length = 20)
    private String officeTel;

    /**
     * 비상연락처
     */
    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;

    /**
     * 비상연락처 이름
     */
    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    /**
     * 입사일자
     */
    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    /**
     * 퇴사일자
     */
    @Column(name = "resign_date")
    private LocalDate resignDate;

    /**
     * 재직상태 (ACTIVE: 재직, RESIGNED: 퇴사, LEAVE: 휴직)
     */
    @Column(name = "employment_status", length = 20, nullable = false)
    private String employmentStatus;

    /**
     * 고용형태 (REGULAR: 정규직, CONTRACT: 계약직, INTERN: 인턴, PART_TIME: 파트타임)
     */
    @Column(name = "employment_type", length = 20, nullable = false)
    private String employmentType;

    /**
     * 직급 (예: 사원, 대리, 과장, 차장, 부장)
     */
    @Column(name = "job_grade", length = 20)
    private String jobGrade;

    /**
     * 직함/직책명
     */
    @Column(name = "job_title", length = 100)
    private String jobTitle;

    /**
     * 직급레벨 (1~10, 높을수록 상위 직급)
     */
    @Column(name = "job_level")
    private Integer jobLevel;

    /**
     * 호봉
     */
    @Column(name = "salary_grade", length = 20)
    private String salaryGrade;

    /**
     * 연봉
     */
    @Column(name = "annual_salary", precision = 15, scale = 2)
    private BigDecimal annualSalary;

    /**
     * 근무지
     */
    @Column(name = "work_location", length = 100)
    private String workLocation;

    /**
     * 근무형태 (OFFICE: 사무실, REMOTE: 재택, HYBRID: 하이브리드)
     */
    @Column(name = "work_type", length = 20)
    private String workType;

    /**
     * 프로필 사진 URL
     */
    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    /**
     * 서명 이미지 URL
     */
    @Column(name = "signature_image_url", length = 500)
    private String signatureImageUrl;

    /**
     * 간단 소개
     */
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    /**
     * 보유 기술/스킬 (JSON 또는 CSV)
     */
    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    /**
     * 자격증 목록
     */
    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications;

    /**
     * 활성화 여부 ('Y', 'N')
     */
    @Column(name = "is_active", length = 1, nullable = false)
    private String isActive;

    /**
     * 생성자
     */
    @CreatedBy
    @Column(name = "created_by", length = 100, nullable = false, updatable = false)
    private String createdBy;

    /**
     * 생성일시
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정자
     */
    @LastModifiedBy
    @Column(name = "updated_by", length = 100, nullable = false)
    private String updatedBy;

    /**
     * 수정일시
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 삭제여부 ('Y', 'N')
     */
    @Column(name = "is_deleted", length = 1, nullable = false)
    @Builder.Default
    private String isDeleted = "N";

    /**
     * 직원 활성화
     * - is_active를 'Y'로 변경
     */
    public void activate() {
        this.isActive = "Y";
    }

    /**
     * 직원 비활성화
     * - is_active를 'N'으로 변경
     */
    public void deactivate() {
        this.isActive = "N";
    }

    /**
     * 재직상태 변경
     * @param status 새로운 재직상태
     */
    public void changeEmploymentStatus(String status) {
        this.employmentStatus = status;
    }

    /**
     * 퇴사 처리
     * @param resignDate 퇴사일자
     */
    public void resign(LocalDate resignDate) {
        this.resignDate = resignDate;
        this.employmentStatus = "RESIGNED";
        this.isActive = "N";
    }

    /**
     * 휴직 처리
     */
    public void takeLeave() {
        this.employmentStatus = "LEAVE";
    }

    /**
     * 복직 처리
     */
    public void returnToWork() {
        this.employmentStatus = "ACTIVE";
        this.isActive = "Y";
    }
}
