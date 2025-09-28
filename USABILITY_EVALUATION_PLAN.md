# BuzzMap System Usability Evaluation Plan

## Executive Summary

This document outlines a comprehensive usability evaluation plan for **BuzzMap: A Crowd-Sourced Dengue Outbreak Prevention and Intervention System with Prescriptive Analytics**. The evaluation will assess how effectively users can interact with the platform's core features across three primary user roles: Community Members, Health Administrators, and Super Administrators.

## 1. Evaluation Objectives

### Primary Objectives

- **Effectiveness**: Can users successfully complete their intended tasks?
- **Efficiency**: How quickly and with how many errors can users complete tasks?
- **Satisfaction**: How satisfied are users with the overall experience?
- **Learnability**: How easy is it for new users to learn the system?
- **Accessibility**: How well does the system serve users with different abilities?

### Specific Goals

- Evaluate the dengue case reporting workflow
- Assess interactive mapping usability (Google Maps integration)
- Test community engagement features (posts, comments, reactions)
- Validate administrative dashboard efficiency
- Measure mobile responsiveness and cross-device compatibility

## 2. User Groups & Personas

### 2.1 Community Members (Primary Focus)

**Profile**: Local residents, ages 18-65, varying tech literacy
**Primary Tasks**:

- Report dengue cases
- Browse dengue risk maps
- Engage in community discussions
- Access prevention information

### 2.2 Health Administrators

**Profile**: Public health officials, ages 25-55, moderate-high tech literacy
**Primary Tasks**:

- Verify and manage reports
- Monitor dengue patterns
- Coordinate interventions
- Generate analytics reports

### 2.3 Super Administrators

**Profile**: System administrators, ages 25-45, high tech literacy
**Primary Tasks**:

- User account management
- System configuration
- Data oversight

## 3. Evaluation Methods

### 3.1 Moderated Usability Testing

**Participants**: 15 users (10 community members, 3 health admins, 2 super admins)
**Duration**: 60-90 minutes per session
**Format**: Think-aloud protocol with task-based scenarios

### 3.2 System Usability Scale (SUS)

**Tool**: Standard 10-question SUS questionnaire
**Timing**: Post-task completion
**Target Score**: ≥70 (above average usability)

### 3.3 Heuristic Evaluation

**Evaluators**: 3 UX experts
**Framework**: Nielsen's 10 Usability Heuristics
**Focus Areas**: Navigation, error handling, consistency

### 3.4 Performance Metrics

**Quantitative Measures**:

- Task completion rate
- Time to complete tasks
- Number of errors
- Click-through paths
- Mobile vs desktop performance

## 4. Test Scenarios & Tasks

### 4.1 Community Member Tasks

#### Task 1: New User Onboarding

**Scenario**: "You're a new resident of Quezon City who heard about BuzzMap. Create an account and explore the main features."
**Success Criteria**:

- Account creation ≤ 3 minutes
- Successful navigation to main sections
- Understanding of core features

#### Task 2: Dengue Case Reporting

**Scenario**: "You suspect a dengue case in your neighborhood at [specific address]. Report this case including location, date, and upload a photo."
**Success Criteria**:

- Form completion ≤ 5 minutes
- Accurate location selection using map
- Successful image upload
- Form submission without errors

**Key Usability Areas**:

- Map picker interaction (`MapPicker` component)
- Form validation and error handling
- Image upload functionality
- Barangay selection interface

#### Task 3: Interactive Map Navigation

**Scenario**: "Find dengue risk information for Barangay Commonwealth and view recent cases in that area."
**Success Criteria**:

- Locate specific barangay ≤ 2 minutes
- View risk level and patterns
- Access case details from map

**Key Usability Areas**:

- Map zoom, pan, and search functionality
- Legend interpretation
- InfoWindow information display
- Pattern color coding understanding

#### Task 4: Community Engagement

**Scenario**: "Browse recent community posts, comment on a dengue prevention tip, and create your own post about mosquito breeding sites."
**Success Criteria**:

- Navigate to community section ≤ 1 minute
- Add meaningful comment ≤ 2 minutes
- Create new post with location ≤ 4 minutes

**Key Usability Areas**:

- Post creation modal (`NewPostModal`)
- Comment system usability
- Voting/reaction system
- Anonymous posting option

### 4.2 Health Administrator Tasks

#### Task 5: Report Verification

**Scenario**: "Review pending dengue reports, verify 3 reports, and reject 1 with feedback."
**Success Criteria**:

- Access admin dashboard ≤ 1 minute
- Review reports efficiently
- Complete verification process ≤ 3 minutes per report

#### Task 6: Analytics Dashboard

**Scenario**: "Generate a trend analysis report for the last month and identify high-risk barangays."
**Success Criteria**:

- Navigate to analytics ≤ 1 minute
- Generate meaningful insights ≤ 5 minutes
- Export or share findings

#### Task 7: Intervention Management

**Scenario**: "Plan a fogging intervention for high-risk areas and track its progress."
**Success Criteria**:

- Create intervention plan ≤ 4 minutes
- Assign resources and timeline
- Monitor intervention status

### 4.3 Mobile-Specific Tasks

#### Task 8: Mobile Reporting

**Scenario**: "Using your mobile device, report a dengue case while at the actual location."
**Success Criteria**:

- GPS location accuracy
- Touch interface responsiveness
- Form completion on small screen
- Image capture and upload

#### Task 9: Mobile Map Interaction

**Scenario**: "Navigate the dengue risk map on your mobile device to check your neighborhood's risk level."
**Success Criteria**:

- Smooth map gestures (pinch, zoom, pan)
- Readable information on small screen
- Fast loading times

## 5. Usability Metrics & Success Criteria

### 5.1 Effectiveness Metrics

- **Task Completion Rate**: ≥90% for critical tasks
- **Error Rate**: ≤10% for primary user flows
- **Feature Discovery**: ≥80% of users find key features without assistance

### 5.2 Efficiency Metrics

- **Report Submission**: ≤5 minutes for complete dengue case report
- **Map Navigation**: ≤30 seconds to find specific barangay
- **Comment Addition**: ≤1 minute to add comment
- **Login Process**: ≤30 seconds

### 5.3 Satisfaction Metrics

- **System Usability Scale (SUS)**: Target score ≥70
- **Net Promoter Score (NPS)**: ≥50
- **User Satisfaction Rating**: ≥4/5 stars
- **Return Intent**: ≥80% would use again

### 5.4 Technical Performance

- **Page Load Time**: ≤3 seconds on 3G connection
- **Map Rendering**: ≤2 seconds for full map load
- **Mobile Responsiveness**: Works on devices ≥320px width
- **Cross-browser Compatibility**: Chrome, Firefox, Safari, Edge

## 6. Testing Environment Setup

### 6.1 Devices & Browsers

**Desktop Testing**:

- Windows 10/11 (Chrome, Firefox, Edge)
- macOS (Chrome, Safari, Firefox)
- Screen resolutions: 1920x1080, 1366x768

**Mobile Testing**:

- iOS (iPhone 12, iPhone SE)
- Android (Samsung Galaxy S21, Pixel 5)
- Tablets (iPad, Android tablet)

### 6.2 Network Conditions

- High-speed WiFi (baseline)
- 4G mobile connection
- 3G slow connection (performance testing)

### 6.3 Test Data

- Pre-populated dengue cases
- Sample barangay data
- Test user accounts for each role
- Sample community posts and comments

## 7. Evaluation Protocol

### 7.1 Pre-Test Phase (10 minutes)

1. Welcome and introduction
2. Informed consent
3. Background questionnaire
4. Technology comfort assessment
5. Explanation of think-aloud protocol

### 7.2 Testing Phase (45-60 minutes)

1. **Warm-up Task** (5 minutes): Free exploration
2. **Core Tasks** (40-50 minutes): Structured scenarios
3. **Post-task Interviews** (5 minutes): Immediate feedback

### 7.3 Post-Test Phase (15 minutes)

1. System Usability Scale (SUS) questionnaire
2. Overall satisfaction survey
3. Feature preference ranking
4. Improvement suggestions
5. Final questions and feedback

## 8. Data Collection Methods

### 8.1 Quantitative Data

- Task completion times (stopwatch/screen recording)
- Click/tap counts and paths (analytics)
- Error frequencies and types
- SUS scores and satisfaction ratings
- System performance metrics

### 8.2 Qualitative Data

- Think-aloud verbalizations (audio recording)
- Facial expressions and body language
- Post-task interview responses
- Open-ended feedback
- Pain points and frustration moments

### 8.3 Technical Data

- Browser console errors
- Network request times
- Device performance metrics
- Mobile gesture recognition
- GPS accuracy measurements

## 9. Specific BuzzMap Features to Evaluate

### 9.1 Google Maps Integration

**Testing Focus**:

- Map loading and rendering performance
- Location picker accuracy and usability
- Street view integration
- Marker clustering and information display
- Mobile map gestures and responsiveness

### 9.2 Dengue Reporting Workflow

**Testing Focus**:

- Form validation and error messages
- Barangay selection interface
- Date/time picker usability
- Image upload with preview
- Anonymous reporting option

### 9.3 Community Features

**Testing Focus**:

- Post creation modal flow
- Comment system interaction
- Voting/reaction mechanisms
- Real-time updates and polling
- User profile integration

### 9.4 Administrative Dashboard

**Testing Focus**:

- Report verification interface
- Data visualization clarity
- Intervention management tools
- Analytics and reporting features
- Bulk operations efficiency

## 10. Risk Areas & Special Considerations

### 10.1 High-Risk Areas

- **Map Performance**: Large GeoJSON data rendering
- **Mobile Usability**: Touch targets and gesture conflicts
- **Form Complexity**: Multi-step dengue reporting
- **Real-time Updates**: WebSocket connection handling
- **Image Handling**: Upload, compression, and display

### 10.2 Accessibility Considerations

- Screen reader compatibility
- Keyboard navigation support
- Color contrast requirements
- Text size and readability
- Alternative text for images

### 10.3 Cultural & Language Factors

- Filipino/English language switching
- Local terminology understanding
- Cultural sensitivity in health reporting
- Community engagement preferences

## 11. Timeline & Resources

### 11.1 Evaluation Schedule

- **Week 1**: Participant recruitment and screening
- **Week 2**: Heuristic evaluation by experts
- **Week 3-4**: Moderated usability testing sessions
- **Week 5**: Data analysis and report preparation
- **Week 6**: Findings presentation and recommendations

### 11.2 Required Resources

- **Personnel**: UX researcher, note-taker, technical support
- **Equipment**: Recording devices, test devices, stable internet
- **Software**: Screen recording tools, analytics setup
- **Participants**: Recruitment incentives and compensation

## 12. Success Metrics Summary

| Metric Category    | Target                  | Measurement Method      |
| ------------------ | ----------------------- | ----------------------- |
| Task Completion    | ≥90%                    | Direct observation      |
| Task Time          | Within specified limits | Timer/recording         |
| Error Rate         | ≤10%                    | Error logging           |
| SUS Score          | ≥70                     | Post-test questionnaire |
| User Satisfaction  | ≥4/5 stars              | Rating scale            |
| Mobile Performance | ≤3s load time           | Technical monitoring    |

## 13. Reporting & Deliverables

### 13.1 Evaluation Report Contents

- Executive summary with key findings
- Detailed usability issues with severity ratings
- Quantitative results and statistical analysis
- User feedback compilation
- Prioritized recommendations
- Implementation roadmap

### 13.2 Recommendations Framework

- **Critical Issues**: Must fix before launch
- **High Priority**: Address in next sprint
- **Medium Priority**: Include in roadmap
- **Low Priority**: Consider for future versions
- **Enhancements**: Nice-to-have improvements

---

## Conclusion

This comprehensive usability evaluation plan is specifically designed for BuzzMap's unique features and user requirements. The evaluation will provide actionable insights to improve the platform's effectiveness in supporting dengue outbreak prevention and community engagement in Quezon City.

**Next Steps**: Upon approval of this plan, we can begin participant recruitment and start the heuristic evaluation phase to identify initial usability issues before conducting moderated testing sessions.
