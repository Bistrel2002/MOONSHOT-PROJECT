# Test Cases for LOC-INDOOR (Indoor Localisation)

<div align="center">

**Project**: Indoor Navigation System with AR Integration  
**Document Version**: 1.0  
**Last Updated**: December 17, 2024  
**Author**: TSANGUE VIVIEN BISTREL  
**Document Type**: Test Cases Specification  

</div>

---

## Table of Contents

- [Test Cases for LOC-INDOOR (Indoor Localisation)](#test-cases-for-loc-indoor-indoor-localisation)
  - [Table of Contents](#table-of-contents)
  - [1. Introduction](#1-introduction)
    - [1.1 Purpose](#11-purpose)
    - [1.2 Scope](#12-scope)
    - [1.3 Test Environment](#13-test-environment)
  - [2. Test Case Structure](#2-test-case-structure)
  - [3. Test Cases Summary Table](#3-test-cases-summary-table)
    - [Test Execution Summary](#test-execution-summary)
    - [Test Status Legend](#test-status-legend)

---

## 1. Introduction

### 1.1 Purpose
This document contains detailed test cases for the LOC-INDOOR indoor navigation system. Each test case validates specific functionality and ensures the system meets all functional and non-functional requirements.

### 1.2 Scope
Test cases cover:
- Core AR navigation functionality
- Bluetooth beacon positioning
- User interface and user experience
- Backend services and APIs
- Performance and security requirements
- Accessibility compliance
- Multi-device compatibility

### 1.3 Test Environment
Test cases are designed for execution in the staging environment with:
- Android devices (10.0+)
- MBM01 Ultra-Long Range Beacons
- Unity 2023.1+ with AR Foundation
- Node.js backend services

---

## 2. Test Case Structure

Each test case follows this standard format:

- **Test Case ID**: Unique identifier
- **Test Case Title**: Descriptive title
- **Objective**: What the test validates
- **Prerequisites**: Setup requirements
- **Test Steps**: Detailed execution steps
- **Expected Result**: Expected outcome
- **Priority**: High/Medium/Low
- **Category**: Functional/Performance/Security/etc.

---

## 3. Test Cases Summary Table

| Test ID | Test Case Title | Category | Priority | Objective | Expected Result | Status | Comments |
|---------|----------------|----------|----------|-----------|-----------------|---------|----------|
| **FUNCTIONAL TEST CASES** |
| TC_FUNC_001 | Application Launch Success | Functional | High | Verify app launches on Android devices | Launch within 10 seconds, no crashes | [ ] | |
| TC_FUNC_002 | Permission Request Handling | Functional | High | Verify camera/location permission handling | Clear permission dialogs, proper fallback | [ ] | |
| TC_FUNC_003 | Automatic Venue Detection | Functional | High | Verify venue detection with beacons | Venue detected within 30 seconds | [ ] | |
| TC_FUNC_004 | POI Search Functionality | Functional | High | Verify point of interest search | Autocomplete within 1 second, accurate results | [ ] | |
| TC_FUNC_005 | Category-Based Browsing | Functional | Medium | Verify POI browsing by category | Categories display correctly, filter works | [ ] | |
| **AR NAVIGATION TEST CASES** |
| TC_AR_001 | AR Camera Initialization | AR Functionality | High | Verify AR camera setup and feed | Camera feed within 2 seconds, stable image | [ ] | |
| TC_AR_002 | AR Line Rendering | AR Functionality | High | Verify navigation line on floor | Line appears on floor, stable during movement | [ ] | |
| TC_AR_003 | AR Line Color and Animation | AR Functionality | Medium | Verify line visual appearance | Correct color (#007BFF), gradient, animation | [ ] | |
| **POSITIONING SYSTEM TEST CASES** |
| TC_POS_001 | Beacon Discovery | Positioning | High | Verify beacon detection | 3+ beacons detected within 10 seconds | [ ] | |
| TC_POS_002 | Position Calculation Accuracy | Positioning | High | Verify trilateration algorithm | Accuracy within ±0.7 meters | [ ] | |
| TC_POS_003 | Floor Detection | Positioning | High | Verify floor identification | Correct floor ID, changes detected in 30s | [ ] | |
| **USER INTERFACE TEST CASES** |
| TC_UI_001 | Main Screen Layout | UI/UX | Medium | Verify main screen elements | All elements present, correct color scheme | [ ] | |
| TC_UI_002 | Navigation Controls | UI/UX | High | Verify navigation button functionality | All buttons respond, proper feedback | [ ] | |
| **USER MANAGEMENT TEST CASES** |
| TC_USER_001 | User Registration | User Management | High | Verify new user registration | Registration complete, email confirmation | [ ] | |
| TC_USER_002 | User Login | User Management | High | Verify user authentication | Login within 3 seconds, session maintained | [ ] | |
| **PERFORMANCE TEST CASES** |
| TC_PERF_001 | Application Launch Time | Performance | High | Verify launch performance | Launch time ≤ 10 seconds average | [ ] | |
| TC_PERF_002 | Memory Usage | Performance | High | Verify memory consumption | Memory usage ≤ 200MB | [ ] | |
| TC_PERF_003 | Battery Consumption | Performance | High | Verify battery efficiency | Battery drain ≤ 15% per hour | [ ] | |
| **SECURITY TEST CASES** |
| TC_SEC_001 | Data Encryption Verification | Security | High | Verify data encryption protocols | TLS 1.3 encryption, no plaintext data | [ ] | |
| TC_SEC_002 | Authentication Security | Security | High | Verify session management | Secure tokens, proper timeout, logout | [ ] | |
| **ACCESSIBILITY TEST CASES** |
| TC_ACC_001 | Color Contrast Compliance | Accessibility | High | Verify WCAG 2.1 AA compliance | 4.5:1 normal text, 3:1 large text contrast | [ ] | |
| TC_ACC_002 | Screen Reader Compatibility | Accessibility | High | Verify TalkBack support | All elements labeled, logical navigation | [ ] | |
| **INTEGRATION TEST CASES** |
| TC_INT_001 | Backend API Integration | Integration | High | Verify app-backend communication | All API calls succeed, proper error handling | [ ] | |
| TC_INT_002 | AR Foundation Integration | Integration | High | Verify AR framework integration | AR session starts, stable tracking | [ ] | |
| **DEVICE COMPATIBILITY TEST CASES** |
| TC_COMP_001 | Android 10.0 Compatibility | Compatibility | High | Verify minimum Android version support | App works on Android 10.0+, all features functional | [ ] | |
| TC_COMP_002 | Various Screen Sizes | Compatibility | Medium | Verify UI adaptation to screen sizes | UI scales properly on 4.7" to 12.9" screens | [ ] | |
| **NEGATIVE TEST CASES** |
| TC_NEG_001 | No Beacon Signal | Negative Testing | High | Verify graceful handling without beacons | Clear error message, fallback options | [ ] | |
| TC_NEG_002 | Network Connectivity Loss | Negative Testing | High | Verify offline behavior | Offline mode activates, graceful reconnection | [ ] | |
| TC_NEG_003 | Invalid Search Input | Negative Testing | Medium | Verify invalid input handling | Input validation, helpful error messages | [ ] | |

### Test Execution Summary

| **Category** | **Total Cases** | **High Priority** | **Medium Priority** | **Low Priority** |
|--------------|-----------------|-------------------|---------------------|------------------|
| Functional | 5 | 4 | 1 | 0 |
| AR Navigation | 3 | 2 | 1 | 0 |
| Positioning | 3 | 3 | 0 | 0 |
| User Interface | 2 | 1 | 1 | 0 |
| User Management | 2 | 2 | 0 | 0 |
| Performance | 3 | 3 | 0 | 0 |
| Security | 2 | 2 | 0 | 0 |
| Accessibility | 2 | 2 | 0 | 0 |
| Integration | 2 | 2 | 0 | 0 |
| Compatibility | 2 | 1 | 1 | 0 |
| Negative Testing | 3 | 2 | 1 | 0 |
| **TOTAL** | **29** | **24** | **5** | **0** |

### Test Status Legend
- [ ] Not Started
- [P] In Progress  
- [✓] Passed
- [X] Failed
- [B] Blocked

**N.B:**

*This test cases document provides comprehensive coverage of LOC-INDOOR functionality in a table format for easy reference and tracking* 