CREATE DATABASE IF NOT EXISTS schedule_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE schedule_system;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `regulations_rule`;
DROP TABLE IF EXISTS `organization_setting`;
DROP TABLE IF EXISTS `system_config`;
DROP TABLE IF EXISTS `notification`;
DROP TABLE IF EXISTS `notification_template_variable`;
DROP TABLE IF EXISTS `notification_template`;
DROP TABLE IF EXISTS `variable`;
DROP TABLE IF EXISTS `todo`;
DROP TABLE IF EXISTS `feedback`;
DROP TABLE IF EXISTS `event_scope`;
DROP TABLE IF EXISTS `special_event`;
DROP TABLE IF EXISTS `payroll_detail`;
DROP TABLE IF EXISTS `payroll`;
DROP TABLE IF EXISTS `test_result`;
DROP TABLE IF EXISTS `test_assignment`;
DROP TABLE IF EXISTS `test_option`;
DROP TABLE IF EXISTS `test_question`;
DROP TABLE IF EXISTS `test`;
DROP TABLE IF EXISTS `employee_work_summary`;
DROP TABLE IF EXISTS `evaluation_detail`;
DROP TABLE IF EXISTS `employee_evaluation`;
DROP TABLE IF EXISTS `evaluation_criteria`;
DROP TABLE IF EXISTS `bonus_detail`;
DROP TABLE IF EXISTS `bonus_record`;
DROP TABLE IF EXISTS `violation`;
DROP TABLE IF EXISTS `disciplinary_record`;
DROP TABLE IF EXISTS `rule`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `emergency_request`;
DROP TABLE IF EXISTS `shift_assignment`;
DROP TABLE IF EXISTS `shift_by_date`;
DROP TABLE IF EXISTS `shift`;
DROP TABLE IF EXISTS `schedule_period`;
DROP TABLE IF EXISTS `store_manager`;
DROP TABLE IF EXISTS `employee_store`;
DROP TABLE IF EXISTS `employee`;
DROP TABLE IF EXISTS `attachment`;
DROP TABLE IF EXISTS `role_permission`;
DROP TABLE IF EXISTS `user_role`;
DROP TABLE IF EXISTS `permission`;
DROP TABLE IF EXISTS `role`;
DROP TABLE IF EXISTS `user`;

SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================
-- 01. USER
-- ============================================================

CREATE TABLE `user` (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    status VARCHAR(30) NOT NULL,
    last_login_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME
);


-- ============================================================
-- 02. ROLE
-- ============================================================

CREATE TABLE `role` (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(30)
);


-- ============================================================
-- 03. PERMISSION
-- ============================================================

CREATE TABLE `permission` (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(150) NOT NULL,
    description TEXT
);


-- ============================================================
-- 04. USER_ROLE
-- ============================================================

CREATE TABLE `user_role` (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by INT,
    assigned_at DATETIME,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user
        FOREIGN KEY (user_id) REFERENCES `user`(user_id),
    CONSTRAINT fk_user_role_role
        FOREIGN KEY (role_id) REFERENCES `role`(role_id),
    CONSTRAINT fk_user_role_assigned_by
        FOREIGN KEY (assigned_by) REFERENCES `user`(user_id)
);


-- ============================================================
-- 05. ROLE_PERMISSION
-- ============================================================

CREATE TABLE `role_permission` (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permission_role
        FOREIGN KEY (role_id) REFERENCES `role`(role_id),
    CONSTRAINT fk_role_permission_permission
        FOREIGN KEY (permission_id) REFERENCES `permission`(permission_id)
);


-- ============================================================
-- 06. ATTACHMENT
-- ============================================================

CREATE TABLE `attachment` (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT,
    uploaded_by INT,
    uploaded_at DATETIME
);


-- ============================================================
-- 07. EMPLOYEE
-- ============================================================

CREATE TABLE `employee` (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(30),
    email VARCHAR(255),
    phone VARCHAR(20),
    address VARCHAR(500),
    id_card_front_id INT,
    id_card_back_id INT,
    hire_date DATE,
    status VARCHAR(30) NOT NULL,
    note TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_employee_user
        FOREIGN KEY (user_id) REFERENCES `user`(user_id),
    CONSTRAINT fk_employee_id_card_front
        FOREIGN KEY (id_card_front_id) REFERENCES `attachment`(attachment_id),
    CONSTRAINT fk_employee_id_card_back
        FOREIGN KEY (id_card_back_id) REFERENCES `attachment`(attachment_id)
);


-- ============================================================
-- 08. STORE
-- ============================================================

CREATE TABLE `store` (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL UNIQUE,
    store_name VARCHAR(255) NOT NULL,
    logo_id INT,
    address VARCHAR(500),
    phone VARCHAR(20),
    status VARCHAR(30) NOT NULL,
    note TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_store_logo
        FOREIGN KEY (logo_id) REFERENCES `attachment`(attachment_id)
);


-- ============================================================
-- 09. EMPLOYEE_STORE
-- ============================================================

CREATE TABLE `employee_store` (
    employee_store_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    store_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_primary BOOLEAN DEFAULT FALSE,
    status VARCHAR(30),
    assigned_by INT,
    created_at DATETIME,
    CONSTRAINT fk_employee_store_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_employee_store_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id),
    CONSTRAINT fk_employee_store_assigned_by
        FOREIGN KEY (assigned_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 10. STORE_MANAGER
-- ============================================================

CREATE TABLE `store_manager` (
    store_manager_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    employee_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(30),
    assigned_by INT,
    note TEXT,
    created_at DATETIME,
    CONSTRAINT fk_store_manager_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id),
    CONSTRAINT fk_store_manager_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_store_manager_assigned_by
        FOREIGN KEY (assigned_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 11. SCHEDULE_PERIOD
-- ============================================================

CREATE TABLE `schedule_period` (
    schedule_period_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    period_name VARCHAR(255) NOT NULL,
    period_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_open_at DATETIME,
    registration_close_at DATETIME,
    status VARCHAR(30) NOT NULL,
    created_by INT,
    created_at DATETIME,
    finalized_by INT,
    finalized_at DATETIME,
    CONSTRAINT fk_schedule_period_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id),
    CONSTRAINT fk_schedule_period_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_schedule_period_finalized_by
        FOREIGN KEY (finalized_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 12. SHIFT
-- ============================================================

CREATE TABLE `shift` (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    shift_code VARCHAR(50) NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT,
    pay_rate DECIMAL(15,2),
    status VARCHAR(30) NOT NULL,
    note TEXT,
    created_by INT,
    created_at DATETIME,
    updated_at DATETIME,
    UNIQUE KEY uk_shift_store_code (store_id, shift_code),
    CONSTRAINT fk_shift_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id),
    CONSTRAINT fk_shift_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 13. SHIFT_BY_DATE
-- ============================================================

CREATE TABLE `shift_by_date` (
    shift_by_date_id INT AUTO_INCREMENT PRIMARY KEY,
    shift_id INT NOT NULL,
    schedule_period_id INT,
    work_date DATE NOT NULL,
    capacity INT,
    shift_name VARCHAR(100),
    start_time TIME,
    end_time TIME,
    max_capacity INT,
    pay_rate DECIMAL(15,2),
    status VARCHAR(30) NOT NULL,
    manager_note TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    UNIQUE KEY uk_shift_date (shift_id, work_date),
    CONSTRAINT fk_shift_date_shift
        FOREIGN KEY (shift_id) REFERENCES `shift`(shift_id),
    CONSTRAINT fk_shift_date_period
        FOREIGN KEY (schedule_period_id) REFERENCES `schedule_period`(schedule_period_id)
);


-- ============================================================
-- 14. SHIFT_ASSIGNMENT
-- ============================================================

CREATE TABLE `shift_assignment` (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    shift_by_date_id INT NOT NULL,
    employee_id INT NOT NULL,
    status VARCHAR(30) NOT NULL,
    registered_at DATETIME,
    approved_by INT,
    approved_at DATETIME,
    cancelled_by INT,
    cancelled_at DATETIME,
    cancellation_reason TEXT,
    note TEXT,
    UNIQUE KEY uk_shift_assignment (shift_by_date_id, employee_id),
    CONSTRAINT fk_shift_assignment_shift
        FOREIGN KEY (shift_by_date_id) REFERENCES `shift_by_date`(shift_by_date_id),
    CONSTRAINT fk_shift_assignment_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_shift_assignment_approved_by
        FOREIGN KEY (approved_by) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_shift_assignment_cancelled_by
        FOREIGN KEY (cancelled_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 15. EMERGENCY_REQUEST
-- ============================================================

CREATE TABLE `emergency_request` (
    emergency_request_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    assignment_id INT,
    request_type VARCHAR(30) NOT NULL,
    from_shift_assignment_id INT,
    to_assignment_id INT,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    requested_at DATETIME,
    processed_by INT,
    processed_at DATETIME,
    process_note TEXT,
    CONSTRAINT fk_emergency_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_emergency_assignment
        FOREIGN KEY (assignment_id) REFERENCES `shift_assignment`(assignment_id),
    CONSTRAINT fk_emergency_from_shift
        FOREIGN KEY (from_shift_assignment_id) REFERENCES `shift_by_date`(shift_by_date_id),
    CONSTRAINT fk_emergency_to_shift
        FOREIGN KEY (to_assignment_id) REFERENCES `shift_by_date`(shift_by_date_id),
    CONSTRAINT fk_emergency_processed_by
        FOREIGN KEY (processed_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 16. ATTENDANCE
-- ============================================================

CREATE TABLE `attendance` (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    shift_by_date_id INT,
    attachment_id INT,
    check_in_at DATETIME,
    check_in_latitude DECIMAL(10,7),
    check_in_longitude DECIMAL(10,7),
    check_in_accuracy DECIMAL(8,2),
    check_out_at DATETIME,
    check_out_latitude DECIMAL(10,7),
    check_out_longitude DECIMAL(10,7),
    check_out_accuracy DECIMAL(8,2),
    worked_hours DECIMAL(8,2),
    attendance_status VARCHAR(30) NOT NULL,
    schedule_match_status VARCHAR(30) NOT NULL,
    approval_status VARCHAR(30) NOT NULL,
    approved_by INT,
    approved_at DATETIME,
    note TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_attendance_shift
        FOREIGN KEY (shift_by_date_id) REFERENCES `shift_by_date`(shift_by_date_id),
    CONSTRAINT fk_attendance_attachment
        FOREIGN KEY (attachment_id) REFERENCES `attachment`(attachment_id),
    CONSTRAINT fk_attendance_approved_by
        FOREIGN KEY (approved_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 17. RULE
-- ============================================================

CREATE TABLE `rule` (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    rule_code VARCHAR(50) NOT NULL UNIQUE,
    rule_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    penalty_type VARCHAR(50),
    penalty_amount DECIMAL(15,2),
    status VARCHAR(30) NOT NULL,
    created_by INT,
    updated_by INT,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_rule_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_rule_updated_by
        FOREIGN KEY (updated_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 18. DISCIPLINARY_RECORD
-- ============================================================

CREATE TABLE `disciplinary_record` (
    disciplinary_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT,
    employee_id INT NOT NULL,
    disciplinary_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2),
    reason TEXT,
    status VARCHAR(30) NOT NULL,
    created_by INT,
    approved_by INT,
    approved_at DATETIME,
    created_at DATETIME,
    CONSTRAINT fk_disciplinary_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id),
    CONSTRAINT fk_disciplinary_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_disciplinary_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_disciplinary_approved_by
        FOREIGN KEY (approved_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 19. VIOLATION
-- ============================================================

CREATE TABLE `violation` (
    violation_id INT AUTO_INCREMENT PRIMARY KEY,
    rule_id INT NOT NULL,
    disciplinary_code_id INT NOT NULL,
    attendance_id INT,
    violation_time DATETIME NOT NULL,
    description TEXT,
    evidence_id INT,
    rule_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    rule_description TEXT,
    penalty_type VARCHAR(50),
    penalty_amount DECIMAL(15,2),
    status VARCHAR(30) NOT NULL,
    created_by INT,
    created_at DATETIME,
    CONSTRAINT fk_violation_rule
        FOREIGN KEY (rule_id) REFERENCES `rule`(rule_id),
    CONSTRAINT fk_violation_disciplinary
        FOREIGN KEY (disciplinary_code_id) REFERENCES `disciplinary_record`(disciplinary_id),
    CONSTRAINT fk_violation_attendance
        FOREIGN KEY (attendance_id) REFERENCES `attendance`(attendance_id),
    CONSTRAINT fk_violation_evidence
        FOREIGN KEY (evidence_id) REFERENCES `attachment`(attachment_id),
    CONSTRAINT fk_violation_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 20. BONUS_RECORD
-- ============================================================

CREATE TABLE `bonus_record` (
    bonus_record_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    payroll_month DATE NOT NULL,
    total_bonus DECIMAL(15,2) NOT NULL,
    total_penalty DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_by INT NOT NULL,
    approved_by INT,
    approved_at DATETIME,
    CONSTRAINT fk_bonus_record_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_bonus_record_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_bonus_record_approved_by
        FOREIGN KEY (approved_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 21. BONUS_DETAIL
-- ============================================================

CREATE TABLE `bonus_detail` (
    bonus_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    bonus_record_id INT NOT NULL,
    rule_id INT NOT NULL,
    type VARCHAR(30) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT,
    CONSTRAINT fk_bonus_detail_record
        FOREIGN KEY (bonus_record_id) REFERENCES `bonus_record`(bonus_record_id),
    CONSTRAINT fk_bonus_detail_rule
        FOREIGN KEY (rule_id) REFERENCES `rule`(rule_id)
);


-- ============================================================
-- 22. EVALUATION_CRITERIA
-- ============================================================

CREATE TABLE `evaluation_criteria` (
    criteria_id INT AUTO_INCREMENT PRIMARY KEY,
    criteria_code VARCHAR(50) NOT NULL UNIQUE,
    criteria_name VARCHAR(255) NOT NULL,
    criteria_type VARCHAR(50) NOT NULL,
    description TEXT,
    target_value DECIMAL(15,2),
    period_type VARCHAR(30),
    max_score DECIMAL(8,2),
    weight DECIMAL(8,2),
    status VARCHAR(30) NOT NULL,
    created_by INT,
    created_at DATETIME,
    CONSTRAINT fk_evaluation_criteria_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 23. EMPLOYEE_EVALUATION
-- ============================================================

CREATE TABLE `employee_evaluation` (
    evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
    evaluator_id INT NOT NULL,
    employee_id INT NOT NULL,
    store_id INT,
    shift_by_date_id INT,
    period_start DATE,
    period_end DATE,
    total_score DECIMAL(8,2),
    final_rating VARCHAR(50),
    status VARCHAR(30) NOT NULL,
    created_at DATETIME,
    CONSTRAINT fk_evaluation_evaluator
        FOREIGN KEY (evaluator_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_evaluation_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_evaluation_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id),
    CONSTRAINT fk_evaluation_shift
        FOREIGN KEY (shift_by_date_id) REFERENCES `shift_by_date`(shift_by_date_id)
);


-- ============================================================
-- 24. EVALUATION_DETAIL
-- ============================================================

CREATE TABLE `evaluation_detail` (
    evaluation_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    criteria_id INT NOT NULL,
    score DECIMAL(8,2),
    actual_value DECIMAL(15,2),
    target_value DECIMAL(15,2),
    exceeded_value DECIMAL(15,2),
    comment TEXT,
    CONSTRAINT fk_evaluation_detail_evaluation
        FOREIGN KEY (evaluation_id) REFERENCES `employee_evaluation`(evaluation_id),
    CONSTRAINT fk_evaluation_detail_criteria
        FOREIGN KEY (criteria_id) REFERENCES `evaluation_criteria`(criteria_id)
);


-- ============================================================
-- 25. EMPLOYEE_WORK_SUMMARY
-- ============================================================

CREATE TABLE `employee_work_summary` (
    summary_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    store_id INT,
    period_start DATE,
    period_end DATE,
    total_shifts INT,
    total_worked_hours DECIMAL(8,2),
    total_scheduled_hours DECIMAL(8,2),
    average_hours_per_shift DECIMAL(8,2),
    total_late_minutes INT,
    total_early_leave_minutes INT,
    attendance_rate DECIMAL(8,2),
    target_value DECIMAL(15,2),
    actual_value DECIMAL(15,2),
    exceeded_value DECIMAL(15,2),
    evaluation_score DECIMAL(8,2),
    calculated_at DATETIME,
    CONSTRAINT fk_work_summary_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_work_summary_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id)
);


-- ============================================================
-- 26. TEST
-- ============================================================

CREATE TABLE `test` (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    test_code VARCHAR(50) NOT NULL UNIQUE,
    test_name VARCHAR(255) NOT NULL,
    description TEXT,
    target_role_id INT,
    duration_minutes INT,
    passing_score DECIMAL(8,2),
    status VARCHAR(30) NOT NULL,
    created_by INT,
    created_at DATETIME,
    CONSTRAINT fk_test_role
        FOREIGN KEY (target_role_id) REFERENCES `role`(role_id),
    CONSTRAINT fk_test_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 27. TEST_QUESTION
-- ============================================================

CREATE TABLE `test_question` (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL,
    score DECIMAL(8,2),
    display_order INT,
    CONSTRAINT fk_test_question_test
        FOREIGN KEY (test_id) REFERENCES `test`(test_id)
);


-- ============================================================
-- 28. TEST_OPTION
-- ============================================================

CREATE TABLE `test_option` (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    display_order INT,
    CONSTRAINT fk_test_option_question
        FOREIGN KEY (question_id) REFERENCES `test_question`(question_id)
);


-- ============================================================
-- 29. TEST_ASSIGNMENT
-- ============================================================

CREATE TABLE `test_assignment` (
    test_assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    employee_id INT NOT NULL,
    assigned_by INT,
    assigned_at DATETIME,
    due_at DATETIME,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_test_assignment_test
        FOREIGN KEY (test_id) REFERENCES `test`(test_id),
    CONSTRAINT fk_test_assignment_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_test_assignment_assigned_by
        FOREIGN KEY (assigned_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 30. TEST_RESULT
-- ============================================================

CREATE TABLE `test_result` (
    test_result_id INT AUTO_INCREMENT PRIMARY KEY,
    test_assignment_id INT NOT NULL,
    score DECIMAL(8,2),
    passed BOOLEAN,
    started_at DATETIME,
    submitted_at DATETIME,
    graded_by INT,
    graded_at DATETIME,
    CONSTRAINT fk_test_result_assignment
        FOREIGN KEY (test_assignment_id) REFERENCES `test_assignment`(test_assignment_id),
    CONSTRAINT fk_test_result_graded_by
        FOREIGN KEY (graded_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 31. PAYROLL
-- ============================================================

CREATE TABLE `payroll` (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    store_id INT,
    payroll_month DATE NOT NULL,
    base_amount DECIMAL(15,2),
    bonus_amount DECIMAL(15,2),
    penalty_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    status VARCHAR(30) NOT NULL,
    created_by INT,
    approved_by INT,
    approved_at DATETIME,
    created_at DATETIME,
    UNIQUE KEY uk_payroll_employee_month (employee_id, payroll_month),
    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_payroll_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id),
    CONSTRAINT fk_payroll_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_payroll_approved_by
        FOREIGN KEY (approved_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 32. PAYROLL_DETAIL
-- ============================================================

CREATE TABLE `payroll_detail` (
    payroll_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_id INT NOT NULL,
    shift_by_date_id INT,
    attendance_id INT,
    bonus_record_id INT NOT NULL,
    violation_id INT,
    item_type VARCHAR(30) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    created_at DATETIME,
    CONSTRAINT fk_payroll_detail_payroll
        FOREIGN KEY (payroll_id) REFERENCES `payroll`(payroll_id),
    CONSTRAINT fk_payroll_detail_shift
        FOREIGN KEY (shift_by_date_id) REFERENCES `shift_by_date`(shift_by_date_id),
    CONSTRAINT fk_payroll_detail_attendance
        FOREIGN KEY (attendance_id) REFERENCES `attendance`(attendance_id),
    CONSTRAINT fk_payroll_detail_bonus
        FOREIGN KEY (bonus_record_id) REFERENCES `bonus_record`(bonus_record_id),
    CONSTRAINT fk_payroll_detail_violation
        FOREIGN KEY (violation_id) REFERENCES `violation`(violation_id)
);


-- ============================================================
-- 33. SPECIAL_EVENT
-- ============================================================

CREATE TABLE `special_event` (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(30) NOT NULL,
    created_by INT,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_special_event_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 34. EVENT_SCOPE
-- ============================================================

CREATE TABLE `event_scope` (
    event_scope_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    scope_type VARCHAR(50) NOT NULL,
    schedule_period_id INT,
    shift_by_date_id INT,
    store_id INT,
    day_of_week INT,
    shift_id INT,
    CONSTRAINT fk_event_scope_event
        FOREIGN KEY (event_id) REFERENCES `special_event`(event_id),
    CONSTRAINT fk_event_scope_period
        FOREIGN KEY (schedule_period_id) REFERENCES `schedule_period`(schedule_period_id),
    CONSTRAINT fk_event_scope_shift_date
        FOREIGN KEY (shift_by_date_id) REFERENCES `shift_by_date`(shift_by_date_id),
    CONSTRAINT fk_event_scope_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id),
    CONSTRAINT fk_event_scope_shift
        FOREIGN KEY (shift_id) REFERENCES `shift`(shift_id)
);


-- ============================================================
-- 35. FEEDBACK
-- ============================================================

CREATE TABLE `feedback` (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    store_id INT,
    shift_by_date_id INT,
    feedback_type VARCHAR(50) NOT NULL,
    target_employee_id INT,
    rating DECIMAL(3,2),
    content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    handled_by INT,
    handled_at DATETIME,
    response TEXT,
    created_at DATETIME,
    CONSTRAINT fk_feedback_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_feedback_store
        FOREIGN KEY (store_id) REFERENCES `store`(store_id),
    CONSTRAINT fk_feedback_shift
        FOREIGN KEY (shift_by_date_id) REFERENCES `shift_by_date`(shift_by_date_id),
    CONSTRAINT fk_feedback_target_employee
        FOREIGN KEY (target_employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_feedback_handled_by
        FOREIGN KEY (handled_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 36. TODO
-- ============================================================

CREATE TABLE `todo` (
    todo_id INT AUTO_INCREMENT PRIMARY KEY,
    assignee_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    todo_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(100),
    source_id INT,
    priority VARCHAR(30) NOT NULL,
    due_at DATETIME,
    status VARCHAR(30) NOT NULL,
    is_system_generated BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at DATETIME,
    completed_at DATETIME,
    CONSTRAINT fk_todo_assignee
        FOREIGN KEY (assignee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_todo_created_by
        FOREIGN KEY (created_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 37. VARIABLE
-- ============================================================

CREATE TABLE `variable` (
    variable_id INT AUTO_INCREMENT PRIMARY KEY,
    variable_code VARCHAR(100) NOT NULL UNIQUE,
    variable_name VARCHAR(150) NOT NULL,
    data_type VARCHAR(30) NOT NULL,
    source_field VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL
);


-- ============================================================
-- 38. NOTIFICATION_TEMPLATE
-- ============================================================

CREATE TABLE `notification_template` (
    notification_template_id INT AUTO_INCREMENT PRIMARY KEY,
    template_code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    updated_by INT,
    updated_at DATETIME,
    CONSTRAINT fk_notification_template_updated_by
        FOREIGN KEY (updated_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 39. NOTIFICATION_TEMPLATE_VARIABLE
-- ============================================================

CREATE TABLE `notification_template_variable` (
    notification_template_id INT NOT NULL,
    variable_id INT NOT NULL,
    PRIMARY KEY (notification_template_id, variable_id),
    CONSTRAINT fk_ntv_template
        FOREIGN KEY (notification_template_id)
        REFERENCES `notification_template`(notification_template_id),
    CONSTRAINT fk_ntv_variable
        FOREIGN KEY (variable_id)
        REFERENCES `variable`(variable_id)
);


-- ============================================================
-- 40. NOTIFICATION
-- ============================================================

CREATE TABLE `notification` (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    notification_template_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(100),
    source_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME,
    CONSTRAINT fk_notification_employee
        FOREIGN KEY (employee_id) REFERENCES `employee`(employee_id),
    CONSTRAINT fk_notification_template
        FOREIGN KEY (notification_template_id)
        REFERENCES `notification_template`(notification_template_id)
);


-- ============================================================
-- 41. SYSTEM_CONFIG
-- ============================================================

CREATE TABLE `system_config` (
    config_id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    config_type VARCHAR(30) NOT NULL,
    description TEXT,
    updated_by INT,
    updated_at DATETIME,
    CONSTRAINT fk_system_config_updated_by
        FOREIGN KEY (updated_by) REFERENCES `employee`(employee_id)
);


-- ============================================================
-- 42. ORGANIZATION_SETTING
-- ============================================================

CREATE TABLE `organization_setting` (
    organization_setting_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    logo_file_id INT,
    favicon_file_id INT,
    primary_color VARCHAR(30),
    secondary_color VARCHAR(30),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    regulations TEXT,
    CONSTRAINT fk_organization_logo
        FOREIGN KEY (logo_file_id) REFERENCES `attachment`(attachment_id),
    CONSTRAINT fk_organization_favicon
        FOREIGN KEY (favicon_file_id) REFERENCES `attachment`(attachment_id)
);


-- ============================================================
-- 43. REGULATIONS_RULE
-- ============================================================

CREATE TABLE `regulations_rule` (
    regulations_rule_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_setting_id INT NOT NULL,
    rule_id INT NOT NULL,
    CONSTRAINT fk_regulations_setting
        FOREIGN KEY (organization_setting_id)
        REFERENCES `organization_setting`(organization_setting_id),
    CONSTRAINT fk_regulations_rule
        FOREIGN KEY (rule_id) REFERENCES `rule`(rule_id)
);


-- ============================================================
-- 44. AUDIT_LOG
-- ============================================================

CREATE TABLE `audit_log` (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at DATETIME,
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES `user`(user_id)
);


-- ============================================================
-- ATTACHMENT FK
-- ============================================================

ALTER TABLE `attachment`
ADD CONSTRAINT fk_attachment_uploaded_by
FOREIGN KEY (uploaded_by) REFERENCES `employee`(employee_id);


-- ============================================================
-- SAMPLE DATA
-- ============================================================

INSERT INTO `role`
(role_id, role_code, role_name, description, status)
VALUES
(1, 'ADMIN', 'Quản trị viên', 'Quản trị toàn bộ hệ thống', 'ACTIVE'),
(2, 'MANAGER', 'Quản lý', 'Quản lý chuỗi/cửa hàng', 'ACTIVE'),
(3, 'STORE_MANAGER', 'Trưởng cửa hàng', 'Quản lý trực tiếp cửa hàng', 'ACTIVE'),
(4, 'EMPLOYEE', 'Nhân viên', 'Nhân viên cửa hàng', 'ACTIVE');


INSERT INTO `permission`
(permission_id, permission_code, permission_name, description)
VALUES
(1, 'USER_VIEW', 'Xem tài khoản', 'Xem tài khoản'),
(2, 'USER_MANAGE', 'Quản lý tài khoản', 'Thêm sửa khóa tài khoản'),
(3, 'ROLE_VIEW', 'Xem vai trò', 'Xem vai trò'),
(4, 'ROLE_MANAGE', 'Quản lý vai trò', 'Quản lý vai trò'),
(5, 'STORE_VIEW', 'Xem cửa hàng', 'Xem cửa hàng'),
(6, 'STORE_MANAGE', 'Quản lý cửa hàng', 'Quản lý cửa hàng'),
(7, 'EMPLOYEE_VIEW', 'Xem nhân viên', 'Xem nhân viên'),
(8, 'EMPLOYEE_MANAGE', 'Quản lý nhân viên', 'Quản lý nhân viên'),
(9, 'SCHEDULE_VIEW', 'Xem lịch', 'Xem lịch làm việc'),
(10, 'SCHEDULE_MANAGE', 'Quản lý lịch', 'Quản lý lịch làm việc'),
(11, 'ATTENDANCE_VIEW', 'Xem chấm công', 'Xem chấm công'),
(12, 'ATTENDANCE_MANAGE', 'Quản lý chấm công', 'Quản lý chấm công'),
(13, 'PAYROLL_VIEW', 'Xem lương', 'Xem bảng lương'),
(14, 'PAYROLL_MANAGE', 'Quản lý lương', 'Quản lý bảng lương'),
(15, 'EVALUATION_VIEW', 'Xem đánh giá', 'Xem đánh giá'),
(16, 'EVALUATION_MANAGE', 'Quản lý đánh giá', 'Đánh giá nhân viên'),
(17, 'FEEDBACK_VIEW', 'Xem góp ý', 'Xem góp ý'),
(18, 'FEEDBACK_MANAGE', 'Quản lý góp ý', 'Xử lý góp ý'),
(19, 'RULE_VIEW', 'Xem quy định', 'Xem quy định'),
(20, 'RULE_MANAGE', 'Quản lý quy định', 'Quản lý quy định');


INSERT INTO `user`
(user_id, username, password_hash, email, phone, status, created_at, updated_at)
VALUES
(1, 'admin', 'password', 'admin@schedulesystem.local', '0900000001', 'ACTIVE', NOW(), NOW()),
(2, 'manager', 'password', 'manager@schedulesystem.local', '0900000002', 'ACTIVE', NOW(), NOW()),
(3, 'storemanager01', 'password', 'storemanager01@schedulesystem.local', '0900000003', 'ACTIVE', NOW(), NOW()),
(4, 'employee01', 'password', 'employee01@schedulesystem.local', '0900000004', 'ACTIVE', NOW(), NOW()),
(5, 'employee02', 'password', 'employee02@schedulesystem.local', '0900000005', 'ACTIVE', NOW(), NOW());


INSERT INTO `user_role`
(user_id, role_id, assigned_by, assigned_at)
VALUES
(1, 1, 1, NOW()),
(2, 2, 1, NOW()),
(3, 3, 2, NOW()),
(4, 4, 3, NOW()),
(5, 4, 3, NOW());


INSERT INTO `role_permission`
(role_id, permission_id)
SELECT 1, permission_id FROM `permission`;


INSERT INTO `role_permission`
(role_id, permission_id)
VALUES
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(2, 11),
(2, 12),
(2, 13),
(2, 14),
(2, 15),
(2, 16),
(2, 17),
(2, 18),
(2, 19),
(2, 20),

(3, 5),
(3, 7),
(3, 8),
(3, 9),
(3, 10),
(3, 11),
(3, 12),
(3, 15),
(3, 16),
(3, 17),
(3, 18),

(4, 5),
(4, 7),
(4, 9),
(4, 11),
(4, 13),
(4, 15),
(4, 17);


INSERT INTO `employee`
(employee_id, user_id, employee_code, full_name, date_of_birth,
gender, email, phone, address, hire_date, status, created_at, updated_at)
VALUES
(1, 2, 'NV0001', 'Nguyễn Văn Quản', '1990-05-10',
'MALE', 'manager@schedulesystem.local', '0900000002',
'TP. Hồ Chí Minh', '2024-01-10', 'ACTIVE', NOW(), NOW()),

(2, 3, 'NV0002', 'Trần Thị Lan', '1995-08-15',
'FEMALE', 'storemanager01@schedulesystem.local', '0900000003',
'TP. Hồ Chí Minh', '2024-03-15', 'ACTIVE', NOW(), NOW()),

(3, 4, 'NV0003', 'Nguyễn Văn An', '2000-02-20',
'MALE', 'employee01@schedulesystem.local', '0900000004',
'TP. Hồ Chí Minh', '2025-01-05', 'ACTIVE', NOW(), NOW()),

(4, 5, 'NV0004', 'Lê Thị Mai', '2001-06-12',
'FEMALE', 'employee02@schedulesystem.local', '0900000005',
'TP. Hồ Chí Minh', '2025-02-10', 'ACTIVE', NOW(), NOW());


INSERT INTO `store`
(store_id, store_code, store_name, address, phone, status, note, created_at, updated_at)
VALUES
(1, 'STORE001', 'Cửa hàng Quận 1',
'123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
'02800000001', 'ACTIVE', 'Cửa hàng trung tâm', NOW(), NOW()),

(2, 'STORE002', 'Cửa hàng Thủ Đức',
'456 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh',
'02800000002', 'ACTIVE', 'Cửa hàng khu vực Thủ Đức', NOW(), NOW());


INSERT INTO `employee_store`
(employee_store_id, employee_id, store_id, start_date, is_primary, status, assigned_by, created_at)
VALUES
(1, 1, 1, '2024-01-10', TRUE, 'ACTIVE', 1, NOW()),
(2, 2, 1, '2024-03-15', TRUE, 'ACTIVE', 1, NOW()),
(3, 3, 1, '2025-01-05', TRUE, 'ACTIVE', 2, NOW()),
(4, 4, 2, '2025-02-10', TRUE, 'ACTIVE', 2, NOW());


INSERT INTO `store_manager`
(store_manager_id, store_id, employee_id, start_date, status, assigned_by, created_at)
VALUES
(1, 1, 2, '2024-03-15', 'ACTIVE', 1, NOW());


INSERT INTO `schedule_period`
(schedule_period_id, store_id, period_name, period_type,
start_date, end_date, registration_open_at,
registration_close_at, status, created_by, created_at)
VALUES
(1, 1, 'Lịch tháng 10/2026', 'MONTH',
'2026-10-01', '2026-10-31',
'2026-09-20 08:00:00',
'2026-09-27 23:59:59',
'OPEN', 2, NOW());


INSERT INTO `shift`
(shift_id, store_id, shift_code, shift_name,
start_time, end_time, max_capacity,
pay_rate, status, created_by, created_at, updated_at)
VALUES
(1, 1, 'CA_SANG', 'Ca sáng',
'07:00:00', '15:00:00', 5,
30000, 'ACTIVE', 2, NOW(), NOW()),

(2, 1, 'CA_CHIEU', 'Ca chiều',
'15:00:00', '23:00:00', 5,
32000, 'ACTIVE', 2, NOW(), NOW());


INSERT INTO `shift_by_date`
(shift_by_date_id, shift_id, schedule_period_id,
work_date, capacity, shift_name,
start_time, end_time, max_capacity,
pay_rate, status, created_at, updated_at)
VALUES
(1, 1, 1, '2026-10-05', 5,
'Ca sáng', '07:00:00', '15:00:00',
5, 30000, 'OPEN', NOW(), NOW()),

(2, 2, 1, '2026-10-05', 5,
'Ca chiều', '15:00:00', '23:00:00',
5, 32000, 'OPEN', NOW(), NOW()),

(3, 1, 1, '2026-10-06', 5,
'Ca sáng', '07:00:00', '15:00:00',
5, 30000, 'OPEN', NOW(), NOW());


INSERT INTO `shift_assignment`
(assignment_id, shift_by_date_id, employee_id,
status, registered_at, approved_by, approved_at)
VALUES
(1, 1, 3, 'APPROVED', NOW(), 2, NOW()),
(2, 2, 4, 'APPROVED', NOW(), 2, NOW()),
(3, 3, 3, 'PENDING', NOW(), NULL, NULL);


INSERT INTO `attendance`
(attendance_id, employee_id, shift_by_date_id,
check_in_at, check_in_latitude, check_in_longitude,
check_in_accuracy, check_out_at,
check_out_latitude, check_out_longitude,
check_out_accuracy, worked_hours,
attendance_status, schedule_match_status,
approval_status, approved_by, approved_at,
note, created_at, updated_at)
VALUES
(1, 3, 1,
'2026-10-05 06:58:00',
10.7769000, 106.7009000, 5.20,
'2026-10-05 15:02:00',
10.7769000, 106.7009000, 5.10,
8.07,
'PRESENT', 'MATCHED',
'APPROVED', 2, NOW(),
'Đúng giờ', NOW(), NOW()),

(2, 4, 2,
'2026-10-05 15:10:00',
10.7769000, 106.7009000, 6.00,
'2026-10-05 23:00:00',
10.7769000, 106.7009000, 5.50,
7.83,
'LATE', 'MATCHED',
'APPROVED', 2, NOW(),
'Đi trễ 10 phút', NOW(), NOW());


INSERT INTO `rule`
(rule_id, rule_code, rule_name, category,
description, penalty_type, penalty_amount,
status, created_by, updated_by, created_at, updated_at)
VALUES
(1, 'RULE_LATE', 'Đi trễ', 'ATTENDANCE',
'Nhân viên đi trễ so với giờ bắt đầu ca',
'FIXED', 50000,
'ACTIVE', 2, 2, NOW(), NOW()),

(2, 'RULE_ABSENT', 'Nghỉ không phép', 'ATTENDANCE',
'Nghỉ ca không có lý do hợp lệ',
'FIXED', 200000,
'ACTIVE', 2, 2, NOW(), NOW()),

(3, 'RULE_GOOD', 'Thưởng nhân viên xuất sắc', 'BONUS',
'Thưởng nhân viên có thành tích tốt',
'FIXED', 300000,
'ACTIVE', 2, 2, NOW(), NOW());


INSERT INTO `disciplinary_record`
(disciplinary_id, store_id, employee_id,
disciplinary_type, amount, reason,
status, created_by, approved_by,
approved_at, created_at)
VALUES
(1, 1, 4,
'DEDUCT_MONEY', 50000,
'Đi trễ 10 phút ngày 05/10/2026',
'APPROVED', 2, 2, NOW(), NOW());


INSERT INTO `violation`
(violation_id, rule_id, disciplinary_code_id,
attendance_id, violation_time, description,
rule_name, category, rule_description,
penalty_type, penalty_amount,
status, created_by, created_at)
VALUES
(1, 1, 1, 2,
'2026-10-05 15:10:00',
'Nhân viên đến trễ 10 phút',
'Đi trễ',
'ATTENDANCE',
'Nhân viên phải có mặt đúng giờ',
'FIXED', 50000,
'CONFIRMED', 2, NOW());


INSERT INTO `bonus_record`
(bonus_record_id, employee_id, payroll_month,
total_bonus, total_penalty, total_amount,
status, created_by, approved_by, approved_at)
VALUES
(1, 3, '2026-10-01',
300000, 0, 300000,
'APPROVED', 2, 2, NOW()),

(2, 4, '2026-10-01',
0, 50000, -50000,
'APPROVED', 2, 2, NOW());


INSERT INTO `bonus_detail`
(bonus_detail_id, bonus_record_id,
rule_id, type, amount, reason)
VALUES
(1, 1, 3, 'BONUS', 300000,
'Nhân viên xuất sắc'),

(2, 2, 1, 'PENALTY', 50000,
'Đi trễ ngày 05/10/2026');


INSERT INTO `evaluation_criteria`
(criteria_id, criteria_code, criteria_name,
criteria_type, description, target_value,
period_type, max_score, weight,
status, created_by, created_at)
VALUES
(1, 'ATTENDANCE', 'Chuyên cần',
'ATTENDANCE', 'Đánh giá mức độ chuyên cần',
95, 'MONTH', 10, 30,
'ACTIVE', 2, NOW()),

(2, 'PUNCTUALITY', 'Đúng giờ',
'ATTENDANCE', 'Đánh giá mức độ đúng giờ',
95, 'MONTH', 10, 25,
'ACTIVE', 2, NOW()),

(3, 'PERFORMANCE', 'Hiệu suất',
'WORK_TARGET', 'Đánh giá hiệu suất công việc',
90, 'MONTH', 10, 30,
'ACTIVE', 2, NOW());


INSERT INTO `employee_evaluation`
(evaluation_id, evaluator_id, employee_id,
store_id, period_start, period_end,
total_score, final_rating, status, created_at)
VALUES
(1, 2, 3, 1,
'2026-10-01', '2026-10-31',
9.2, 'EXCELLENT', 'COMPLETED', NOW()),

(2, 2, 4, 1,
'2026-10-01', '2026-10-31',
7.8, 'GOOD', 'COMPLETED', NOW());


INSERT INTO `evaluation_detail`
(evaluation_detail_id, evaluation_id,
criteria_id, score, actual_value,
target_value, exceeded_value, comment)
VALUES
(1, 1, 1, 9.5, 98, 95, 3,
'Chuyên cần rất tốt'),

(2, 1, 2, 9.0, 97, 95, 2,
'Hầu hết đều đúng giờ'),

(3, 1, 3, 9.2, 92, 90, 2,
'Hoàn thành công việc tốt'),

(4, 2, 1, 8.5, 95, 95, 0,
'Đảm bảo chuyên cần'),

(5, 2, 2, 7.0, 85, 95, -10,
'Có một lần đi trễ'),

(6, 2, 3, 8.0, 88, 90, -2,
'Hoàn thành công việc');


INSERT INTO `employee_work_summary`
(summary_id, employee_id, store_id,
period_start, period_end,
total_shifts, total_worked_hours,
total_scheduled_hours, average_hours_per_shift,
total_late_minutes, total_early_leave_minutes,
attendance_rate, target_value, actual_value,
exceeded_value, evaluation_score, calculated_at)
VALUES
(1, 3, 1,
'2026-10-01', '2026-10-31',
22, 176, 176, 8,
0, 0, 100,
95, 100, 5, 9.2, NOW()),

(2, 4, 1,
'2026-10-01', '2026-10-31',
20, 159.83, 160, 7.99,
10, 0, 95,
95, 95, 0, 7.8, NOW());


INSERT INTO `test`
(test_id, test_code, test_name,
description, target_role_id,
duration_minutes, passing_score,
status, created_by, created_at)
VALUES
(1, 'TEST_EMPLOYEE',
'Kiểm tra nghiệp vụ nhân viên',
'Bài kiểm tra nghiệp vụ cơ bản',
4, 30, 70,
'ACTIVE', 2, NOW()),

(2, 'TEST_MANAGER',
'Kiểm tra nghiệp vụ quản lý',
'Bài kiểm tra dành cho quản lý',
3, 45, 75,
'ACTIVE', 2, NOW());


INSERT INTO `test_question`
(question_id, test_id, question_text,
question_type, score, display_order)
VALUES
(1, 1,
'Nhân viên cần làm gì khi không thể đi làm?',
'SINGLE', 10, 1),

(2, 1,
'Ai duyệt đăng ký ca?',
'SINGLE', 10, 2),

(3, 2,
'Ai quản lý lịch cửa hàng?',
'SINGLE', 10, 1);


INSERT INTO `test_option`
(option_id, question_id, option_text,
is_correct, display_order)
VALUES
(1, 1, 'Không cần báo', FALSE, 1),
(2, 1, 'Gửi yêu cầu nghỉ/đổi ca', TRUE, 2),
(3, 1, 'Tự ý nghỉ', FALSE, 3),

(4, 2, 'Nhân viên', FALSE, 1),
(5, 2, 'Trưởng cửa hàng', TRUE, 2),
(6, 2, 'Khách hàng', FALSE, 3),

(7, 3, 'Trưởng cửa hàng', TRUE, 1),
(8, 3, 'Khách hàng', FALSE, 2);


INSERT INTO `test_assignment`
(test_assignment_id, test_id, employee_id,
assigned_by, assigned_at, due_at, status)
VALUES
(1, 1, 3, 2, NOW(),
'2026-10-10 23:59:59', 'COMPLETED'),

(2, 1, 4, 2, NOW(),
'2026-10-10 23:59:59', 'PENDING');


INSERT INTO `test_result`
(test_result_id, test_assignment_id,
score, passed, started_at,
submitted_at, graded_by, graded_at)
VALUES
(1, 1, 90, TRUE,
'2026-10-05 09:00:00',
'2026-10-05 09:20:00',
2, NOW());


INSERT INTO `payroll`
(payroll_id, employee_id, store_id,
payroll_month, base_amount,
bonus_amount, penalty_amount,
total_amount, status,
created_by, approved_by,
approved_at, created_at)
VALUES
(1, 3, 1,
'2026-10-01',
9000000, 300000, 0,
9300000, 'APPROVED',
2, 2, NOW(), NOW()),

(2, 4, 1,
'2026-10-01',
8500000, 0, 50000,
8450000, 'APPROVED',
2, 2, NOW(), NOW());


INSERT INTO `payroll_detail`
(payroll_detail_id, payroll_id,
shift_by_date_id, attendance_id,
bonus_record_id, violation_id,
item_type, description, amount, created_at)
VALUES
(1, 1, 1, 1, 1, NULL,
'BONUS', 'Thưởng nhân viên xuất sắc',
300000, NOW()),

(2, 2, 2, 2, 2, 1,
'PENALTY', 'Phạt đi trễ',
-50000, NOW());


INSERT INTO `special_event`
(event_id, event_name, description,
event_type, start_date, end_date,
status, created_by, created_at, updated_at)
VALUES
(1, 'Khuyến mãi cuối tháng',
'Chương trình khuyến mãi đặc biệt',
'PROMOTION',
'2026-10-25', '2026-10-31',
'ACTIVE', 2, NOW(), NOW()),

(2, 'Tết Dương lịch',
'Nghỉ lễ đầu năm',
'HOLIDAY',
'2027-01-01', '2027-01-01',
'ACTIVE', 2, NOW(), NOW());


INSERT INTO `event_scope`
(event_scope_id, event_id, scope_type,
schedule_period_id, shift_by_date_id,
store_id, day_of_week, shift_id)
VALUES
(1, 1, 'STORE', 1, NULL, 1, NULL, NULL),
(2, 2, 'STORE', NULL, NULL, 1, NULL, NULL);


INSERT INTO `feedback`
(feedback_id, employee_id, store_id,
shift_by_date_id, feedback_type,
target_employee_id, rating, content,
status, handled_by, handled_at,
response, created_at)
VALUES
(1, 3, 1, 1,
'EMPLOYEE', 2, 5,
'Trưởng cửa hàng hỗ trợ nhân viên rất tốt',
'RESOLVED', 2, NOW(),
'Cảm ơn phản hồi của bạn',
NOW()),

(2, 4, 1, 2,
'STORE', NULL, 4,
'Nên bố trí thêm nhân viên vào cuối tuần',
'PENDING', NULL, NULL, NULL,
NOW());


INSERT INTO `todo`
(todo_id, assignee_id, title,
description, todo_type,
source_type, source_id,
priority, due_at, status,
is_system_generated, created_by,
created_at, completed_at)
VALUES
(1, 2,
'Duyệt lịch tháng 10',
'Kiểm tra và duyệt lịch làm việc',
'APPROVAL',
'SHIFT_ASSIGNMENT', 1,
'HIGH',
'2026-09-28 18:00:00',
'COMPLETED',
TRUE, 2, NOW(), NOW()),

(2, 2,
'Kiểm tra chấm công',
'Kiểm tra trường hợp đi trễ',
'REVIEW',
'ATTENDANCE', 2,
'MEDIUM',
'2026-10-06 18:00:00',
'PENDING',
TRUE, 2, NOW(), NULL);


INSERT INTO `variable`
(variable_id, variable_code,
variable_name, data_type,
source_field, status)
VALUES
(1, 'EMPLOYEE_NAME',
'Tên nhân viên', 'STRING',
'employee.full_name', 'ACTIVE'),

(2, 'STORE_NAME',
'Tên cửa hàng', 'STRING',
'store.store_name', 'ACTIVE'),

(3, 'SHIFT_DATE',
'Ngày làm việc', 'DATE',
'shift_by_date.work_date', 'ACTIVE'),

(4, 'SHIFT_NAME',
'Tên ca', 'STRING',
'shift_by_date.shift_name', 'ACTIVE'),

(5, 'SCHEDULE_PERIOD',
'Tên kỳ lịch', 'STRING',
'schedule_period.period_name', 'ACTIVE');


INSERT INTO `notification_template`
(notification_template_id, template_code,
title, content, status,
updated_by, updated_at)
VALUES
(1, 'SHIFT_ASSIGNED',
'Bạn được phân ca',
'Bạn đã được phân ca {{SHIFT_NAME}} ngày {{SHIFT_DATE}} tại {{STORE_NAME}}.',
'ACTIVE', 2, NOW()),

(2, 'SCHEDULE_PUBLISHED',
'Lịch làm việc đã được công bố',
'Lịch {{SCHEDULE_PERIOD}} đã được công bố.',
'ACTIVE', 2, NOW()),

(3, 'ATTENDANCE_LATE',
'Cảnh báo đi trễ',
'Bạn đã đi trễ trong ca {{SHIFT_NAME}} ngày {{SHIFT_DATE}}.',
'ACTIVE', 2, NOW());


INSERT INTO `notification_template_variable`
(notification_template_id, variable_id)
VALUES
(1, 3),
(1, 4),
(1, 2),
(2, 5),
(3, 3),
(3, 4);


INSERT INTO `notification`
(notification_id, employee_id,
notification_template_id,
title, content,
notification_type,
source_type, source_id,
is_read, read_at, created_at)
VALUES
(1, 3, 1,
'Bạn được phân ca',
'Bạn được phân ca sáng ngày 05/10/2026.',
'SHIFT',
'SHIFT_ASSIGNMENT', 1,
TRUE, NOW(), NOW()),

(2, 4, 1,
'Bạn được phân ca',
'Bạn được phân ca chiều ngày 05/10/2026.',
'SHIFT',
'SHIFT_ASSIGNMENT', 2,
FALSE, NULL, NOW()),

(3, 4, 3,
'Cảnh báo đi trễ',
'Bạn đã đi trễ trong ca chiều ngày 05/10/2026.',
'ATTENDANCE',
'ATTENDANCE', 2,
FALSE, NULL, NOW());


INSERT INTO `system_config`
(config_id, config_key,
config_value, config_type,
description, updated_by, updated_at)
VALUES
(1, 'LATE_THRESHOLD',
'5', 'NUMBER',
'Số phút vượt quá được tính là đi trễ',
2, NOW()),

(2, 'MAX_SHIFT_PER_DAY',
'1', 'NUMBER',
'Số ca tối đa mỗi nhân viên trong ngày',
1, NOW()),

(3, 'AUTO_APPROVE_ATTENDANCE',
'false', 'BOOLEAN',
'Tự động duyệt chấm công',
1, NOW());


INSERT INTO `organization_setting`
(organization_setting_id,
organization_name,
primary_color,
secondary_color,
contact_email,
contact_phone,
regulations)
VALUES
(1,
'Schedule System',
'#2563EB',
'#F8FAFC',
'admin@schedulesystem.local',
'02800000000',
'Quy định quản lý lịch làm việc, chấm công và nhân sự.');


INSERT INTO `regulations_rule`
(regulations_rule_id,
organization_setting_id,
rule_id)
VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3);


INSERT INTO `audit_log`
(audit_id, user_id,
action, entity_type,
entity_id, old_value,
new_value, ip_address,
user_agent, created_at)
VALUES
(1, 1,
'LOGIN', 'USER', 1,
NULL, 'Đăng nhập hệ thống',
'127.0.0.1', 'Chrome',
NOW()),

(2, 1,
'CREATE', 'STORE', 1,
NULL, 'Tạo cửa hàng STORE001',
'127.0.0.1', 'Chrome',
NOW()),

(3, 2,
'CREATE', 'SCHEDULE_PERIOD', 1,
NULL, 'Tạo lịch tháng 10/2026',
'127.0.0.1', 'Chrome',
NOW()),

(4, 2,
'APPROVE', 'SHIFT_ASSIGNMENT', 1,
'PENDING', 'APPROVED',
'127.0.0.1', 'Chrome',
NOW());


-- ============================================================
-- CHECK DATA
-- ============================================================

SELECT COUNT(*) AS total_users
FROM `user`;

SELECT COUNT(*) AS total_roles
FROM `role`;

SELECT COUNT(*) AS total_permissions
FROM `permission`;

SELECT COUNT(*) AS total_employees
FROM `employee`;

SELECT COUNT(*) AS total_stores
FROM `store`;

SELECT COUNT(*) AS total_schedule_periods
FROM `schedule_period`;

SELECT COUNT(*) AS total_shifts
FROM `shift`;

SELECT COUNT(*) AS total_attendance
FROM `attendance`;

SELECT COUNT(*) AS total_payroll
FROM `payroll`;

SELECT COUNT(*) AS total_audit_logs
FROM `audit_log`;

SET FOREIGN_KEY_CHECKS = 1;