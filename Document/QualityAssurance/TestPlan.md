# Test Plan for LOC-INDOOR (Indoor Localisation)

<div align="center">

**Project**: Indoor Navigation System with AR Integration  
**Document Version**: 1.0  
**Last Updated**: December 17, 2024  
**Author**: TSANGUE VIVIEN BISTREL  
**Document Type**: Master Test Plan  

</div>

---

## Table of Contents

- [1. Introduction](#1-introduction)
- [2. Test Objectives](#2-test-objectives)
- [3. Test Scope](#3-test-scope)
- [4. Testing Approach](#4-testing-approach)
- [5. Test Environment](#5-test-environment)
- [6. Test Data Requirements](#6-test-data-requirements)
- [7. Testing Resources](#7-testing-resources)
- [8. Test Schedule](#8-test-schedule)
- [9. Risk Assessment](#9-risk-assessment)
- [10. Entry and Exit Criteria](#10-entry-and-exit-criteria)
- [11. Test Deliverables](#11-test-deliverables)
- [12. Defect Management](#12-defect-management)
- [13. Test Metrics](#13-test-metrics)
- [14. Approval](#14-approval)

---

## 1. Introduction

### 1.1 Purpose
This test plan document outlines the comprehensive testing strategy for the LOC-INDOOR system, an indoor navigation application that utilizes Augmented Reality (AR) and Bluetooth beacon technology to provide real-time indoor navigation assistance.

### 1.2 Project Overview
LOC-INDOOR is a mobile application (initially Android, with iOS planned) that provides line-based visual guidance through AR technology. The system uses Bluetooth beacons for precise indoor positioning and displays directional lines on the floor through the device's camera view.

### 1.3 Document Scope
This document covers all testing activities for:
- Mobile application components
- Backend services
- AR navigation functionality
- Bluetooth beacon integration
- User interface and user experience
- Performance and security aspects
- Accessibility features

---

## 2. Test Objectives

### 2.1 Primary Objectives
- **Functional Verification**: Ensure all functional requirements are met as specified
- **AR Navigation Accuracy**: Validate that AR line-based navigation provides accurate directional guidance
- **Positioning Precision**: Verify Bluetooth beacon positioning meets accuracy requirements (±0.7 meters)
- **Performance Validation**: Confirm system meets all performance benchmarks
- **Security Assurance**: Validate all security measures and data protection protocols
- **Usability Confirmation**: Ensure the application meets usability and accessibility standards

### 2.2 Secondary Objectives
- **Integration Validation**: Verify seamless integration between all system components
- **Scalability Testing**: Confirm the system can handle specified load requirements
- **Cross-Platform Compatibility**: Validate consistent behavior across different devices
- **Regression Prevention**: Ensure new features don't break existing functionality

---

## 3. Test Scope

### 3.1 In Scope

#### 3.1.1 Functional Testing
- **AR Navigation Features**
  - Line-based floor navigation display
  - Real-time path adjustment
  - Multi-floor navigation guidance
  - Distance and ETA calculations

- **Positioning System**
  - Bluetooth beacon detection and ranging
  - Trilateration algorithm accuracy
  - Floor detection and transition
  - Position update frequency

- **User Management**
  - User registration and authentication
  - Profile management
  - Settings and preferences
  - Social login integration

- **Venue Data Management**
  - POI search and selection
  - Category-based browsing
  - Map rendering and display

#### 3.1.2 Non-Functional Testing
- **Performance Testing**
  - Response time validation
  - Resource utilization monitoring
  - Memory usage optimization

- **Security Testing**
  - Data encryption verification
  - Authentication security
  - API security testing
  - Privacy compliance validation

- **Usability Testing**
  - User interface intuitiveness
  - Accessibility compliance (WCAG 2.1 AA)
  - Learning curve assessment
  - Error handling and messaging

#### 3.1.3 Integration Testing
- Mobile app to backend API integration
- Bluetooth beacon SDK integration
- AR Foundation framework integration
- Third-party service integrations

#### 3.1.4 Device Compatibility Testing
- Android 10.0+ devices
- Various screen sizes (4.7" to 12.9")
- Different hardware specifications
- Camera and sensor functionality

### 3.2 Out of Scope
- iOS application testing (future release)
- Hardware beacon manufacturing testing
- Third-party service internal functionality
- Network infrastructure testing (beyond API connectivity)

---

## 4. Testing Approach

### 4.1 Testing Methodology

#### 4.1.1 Agile Testing Approach
- **Sprint-based testing**: Testing integrated within each development sprint
- **Continuous integration**: Automated testing on each code commit
- **Early testing**: Testing begins with requirement analysis

### 4.2 Testing Techniques

#### 4.2.2 White Box Testing
- **Code Coverage Analysis**: Minimum 80% code coverage
- **Path Testing**: Critical algorithm path validation
- **Branch Testing**: Decision point validation

#### 4.2.3 Specialized Testing
- **AR Testing**: AR functionality and rendering accuracy
- **Bluetooth Testing**: Beacon signal processing and accuracy
- **Location Testing**: Positioning algorithm validation
- **Performance Profiling**: Resource usage optimization

---

## 5. Test Environment

### 5.1 Hardware Requirements

#### 5.1.1 Mobile Devices
- **Primary Test Devices**:
  - OnePlus 9 (Android 11)
  - Xiaomi Mi 11 (Android 11)
  - Honor 200(Android 15)
  - Galaxy Z-Fold 3

- **Minimum Specification Device**:
  - 2GB RAM, Quad-core 2.0 GHz processor
  - Android 10.0
  - Camera with autofocus
  - Bluetooth 4.0+ capability

#### 5.1.2 Beacon Infrastructure
- **Test Beacon Setup**:
  - MBM01 Ultra-Long Range Beacons
  - Variable beacon placement scenarios
  - Signal strength monitoring equipment

#### 5.1.3 Server Infrastructure
- **Backend Testing Environment**:
  - AWS EC2 instances (staging environment)
  - MongoDB Atlas (test database)
  - PostgreSQL (test user data)
  - Load testing infrastructure

### 5.2 Software Requirements

#### 5.2.1 Development Tools
- Unity 2023.1+ with AR Foundation
- Node.js development environment
- MongoDB and PostgreSQL
- React framework

#### 5.2.2 Testing Tools
- **Automated Testing**:
  - Unity Test Framework
  - backend API testing
  - Postman (API testing)

- **Performance Testing**:
  - Unity Profiler
  - Android Profiler
  - JMeter (load testing)
  - Firebase Performance Monitoring

- **Security Testing**:
  - OWASP ZAP
  - Burp Suite
  - MobSF (Mobile Security Framework)

### 5.3 Network Configuration
- **Test Networks**:
  - WiFi networks (various speeds)
  - Mobile data networks (4G/5G)
  - Limited connectivity scenarios
  - Offline mode testing

---

## 6. Test Data Requirements

### 6.1 Venue Test Data
- **Multiple venue types**: Airport, mall, hospital configurations
- **Various venue sizes**: Small (1,000m²) to large (200,000m²)
- **Multi-floor layouts**: 1-3 floors
- **POI categories**: Restaurants, shops, services, rooms
- **Accessibility routes**: Elevator-only paths, ramp access

### 6.2 User Test Data
- **User profiles**: Different age groups, technical proficiency levels
- **Accessibility needs**: Mobility impairments, visual impairments
- **Usage patterns**: Frequent vs. first-time users
- **Device preferences**: Various Android versions and manufacturers

### 6.3 Beacon Test Data
- **Signal patterns**: Various RSSI values and distances
- **Interference scenarios**: WiFi, other Bluetooth devices
- **Placement variations**: Optimal and suboptimal positioning

---

## 7. Test Schedule

### 7.1 Testing Phases

#### Phase 1: Component Testing
- Unit testing for all modules
- AR component isolated testing
- Bluetooth beacon SDK testing
- Database operation testing

#### Phase 2: Integration Testing
- Mobile app to backend integration
- AR and positioning system integration
- Third-party service integration

#### Phase 3: System Testing
- End-to-end functionality testing
- Performance and load testing
- Security penetration testing
- Accessibility compliance testing

#### Phase 4: User Acceptance Testing
- Alpha testing with internal users
- Beta testing with external users
- Usability testing sessions
- Real-world scenario validation

#### Phase 5: Pre-Release Testing (
- Final regression testing
- Production environment validation
- Performance monitoring setup
- Release readiness assessment


## 8. Risk Assessment

### 8.1 High Risk Areas

#### 8.1.1 AR Accuracy Risk
- **Risk**: AR line positioning may be inaccurate in varying lighting conditions
- **Impact**: High - Core functionality affected
- **Mitigation**: Extensive testing in different environments, lighting condition simulation

#### 8.1.2 Beacon Positioning Risk
- **Risk**: Interference may affect positioning accuracy
- **Impact**: High - Navigation accuracy compromised
- **Mitigation**: Signal interference testing, fallback positioning methods

### 8.2 Medium Risk Areas

#### 8.2.1 Device Compatibility Risk
- **Risk**: Inconsistent behavior across different Android devices
- **Impact**: Medium - Limited device support
- **Mitigation**: Comprehensive device testing matrix.

#### 8.2.2 Network Dependency Risk
- **Risk**: Poor network connectivity may affect functionality
- **Impact**: Medium - Feature limitations
- **Mitigation**: Offline mode testing, graceful degradation

---

## 9. Entry and Exit Criteria

### 9.1 Entry Criteria

#### 9.1.1 Component Testing Entry
- [ ] Code development complete for components
- [ ] Unit tests written and passing
- [ ] Code review completed
- [ ] Test environment ready
- [ ] Test data prepared

#### 9.1.2 Integration Testing Entry
- [ ] All component tests passed
- [ ] Integration environment deployed
- [ ] Test scripts prepared

#### 9.1.3 System Testing Entry
- [ ] All integration tests passed
- [ ] System deployment complete
- [ ] Performance baselines established
- [ ] Security scan tools configured
- [ ] User test scenarios documented

### 9.2 Exit Criteria

#### 9.2.1 Component Testing Exit
- [ ] 100% of planned test cases executed
- [ ] 90% test case pass rate achieved
- [ ] All critical defects resolved
- [ ] Code coverage ≥ 80%
- [ ] Performance benchmarks met

#### 9.2.2 Integration Testing Exit
- [ ] All integration scenarios validated
- [ ] API functionality confirmed
- [ ] Data flow integrity verified
- [ ] No critical integration defects

#### 9.2.3 System Testing Exit
- [ ] All functional requirements validated
- [ ] Performance criteria met
- [ ] Security requirements satisfied
- [ ] Accessibility compliance achieved
- [ ] User acceptance criteria fulfilled

---

## 10. Test Deliverables


### 11.2 Test Reports
- **Weekly Test Summary Reports**
- **Test Execution Reports**
- **Defect Analysis Reports**
- **Performance Test Reports**
- **Security Assessment Reports**

### 11.3 Test Evidence
- **Test Execution Screenshots**
- **Video Recordings** (AR functionality)
- **Security Scan Results**
- **User Feedback Documentation**

---

## 12. Defect Management

### 12.1 Defect Classification

#### 12.1.1 Severity Levels
- **Critical**: System crash, core functionality failure
- **High**: Major feature not working, security vulnerability
- **Medium**: Minor feature issues, usability problems
- **Low**: Cosmetic issues, minor improvements

#### 12.1.2 Priority Levels
- **P1**: Fix immediately
- **P2**: Fix in current sprint
- **P3**: Fix in next sprint
- **P4**: Fix when resources available

### 12.2 Defect Workflow
1. **Discovery**: Defect identified during testing
2. **Logging**: Detailed defect report created
3. **Triage**: Severity and priority assigned
4. **Assignment**: Developer assigned for fix
5. **Resolution**: Fix implemented and tested
6. **Verification**: Fix validated by QA team
7. **Closure**: Defect marked as resolved

### 12.3 Defect Tracking Tools
- **Primary**: Jira for defect tracking and management
- **Integration**: GitHub for code-related defects
- **Reporting**: Automated dashboards for status tracking

---

## 13. Test Metrics

### 13.1 Test Progress Metrics
- **Test Case Coverage**: Percentage of requirements covered by test cases
- **Test Execution Progress**: Percentage of test cases executed
- **Pass/Fail Rate**: Ratio of passed to failed test cases
- **Test Velocity**: Test cases executed per day

### 13.2 Quality Metrics
- **Defect Density**: Defects per thousand lines of code
- **Defect Escape Rate**: Defects found in production vs. testing
- **First Pass Yield**: Percentage of test cases passing on first execution
- **Regression Success Rate**: Percentage of regression tests passing

### 13.3 Performance Metrics
- **Response Time**: Average API and UI response times
- **Positioning Accuracy**: Percentage within acceptable range
- **AR Rendering Performance**: Frame rate and latency measurements.

### 13.4 Coverage Metrics
- **Code Coverage**: Percentage of code executed by tests.
- **Requirement Coverage**: Percentage of requirements tested.
- **Risk Coverage**: Percentage of identified risks mitigated.
- **Device Coverage**: Percentage of target devices tested.

---

## 14. Approval
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 28, 04, 2025 | TSANGUE VIVIEN BISTREL | Initial version |

---

**N.B:**

*This test plan serves as the foundation for all testing activities in the LOC-INDOOR project. It should be treated as a living document and updated as the project evolves.* 