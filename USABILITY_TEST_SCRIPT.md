# BuzzMap Usability Test Script

## Pre-Test Setup (10 minutes)

### Welcome & Introduction (3 minutes)

"Hello, and thank you for participating in this usability test for BuzzMap. My name is [Name], and I'll be guiding you through today's session.

**What is BuzzMap?**
BuzzMap is a web platform designed to help communities in Quezon City report dengue cases, track outbreaks, and engage in prevention efforts. Today, we want to understand how easy and effective it is to use.

**What we're testing:**
We're testing the system, not you. There are no right or wrong answers, and your honest feedback will help us improve the platform.

**Your role:**
Please think out loud as you work - tell me what you're thinking, what you expect to happen, what confuses you, or what you like. This helps us understand your experience."

### Consent & Recording (2 minutes)

"Before we begin, I need your consent to record this session. The recording will only be used for analysis and will not be shared outside our research team. Is that okay with you?

[✓] Verbal consent obtained
[✓] Screen recording started
[✓] Audio recording started"

### Background Questions (5 minutes)

"Let me ask you a few quick questions about your background:

1. How would you rate your overall comfort with technology? (1-10 scale)
2. How often do you use mapping applications like Google Maps?
3. Have you ever reported a public health issue online before?
4. Are you familiar with dengue fever and its prevention?
5. What device do you primarily use for web browsing? (Desktop/Mobile/Both)"

---

## Testing Phase (45-60 minutes)

### Warm-up Task: Free Exploration (5 minutes)

**Instructions:**
"I'm going to show you the BuzzMap homepage. Take a few minutes to explore and get familiar with what you see. Please tell me what you notice and what you think this site is for.

[Navigate to: https://buzzmap-client.vercel.app/home]

**Observe for:**

- First impressions
- Navigation behavior
- Understanding of purpose
- Feature discovery

**Probing Questions:**

- What do you think this website is for?
- What would you do first as a new user?
- What catches your attention the most?"

### Task 1: Account Creation & Login (8 minutes)

**Scenario:**
"Imagine you're a resident of Quezon City who just heard about BuzzMap from a neighbor. You want to create an account so you can start using the platform. Please create a new account."

**Instructions:**

1. "Please create a new account on this website"
2. "Use any information you'd like - it doesn't have to be real"
3. "Think out loud about what you expect from each step"

**Success Criteria:**

- [ ] Finds signup/registration link ≤ 30 seconds
- [ ] Completes registration form ≤ 3 minutes
- [ ] Successfully creates account
- [ ] Understands next steps after registration

**Observe for:**

- Navigation to signup
- Form completion ease
- Error handling understanding
- Validation message clarity

**If stuck (after 2 minutes):** "What would you expect to click to create an account?"

### Task 2: Dengue Case Reporting (12 minutes)

**Scenario:**
"You suspect there's a dengue case at your neighbor's house at 123 Commonwealth Avenue in Quezon City. The incident happened yesterday around 2 PM. You want to report this case to help your community stay informed."

**Instructions:**

1. "Please report a dengue case using the information I just gave you"
2. "Use Commonwealth Avenue as the location"
3. "Yesterday at 2 PM as the date and time"
4. "Add any description you think would be helpful"

**Success Criteria:**

- [ ] Finds reporting feature ≤ 2 minutes
- [ ] Opens reporting form/modal ≤ 1 minute
- [ ] Selects location on map ≤ 3 minutes
- [ ] Fills required fields ≤ 3 minutes
- [ ] Successfully submits report ≤ 2 minutes

**Observe for:**

- How they locate the reporting feature
- Map interaction and location selection
- Form field understanding
- Validation and error handling
- Submission feedback

**If stuck:**

- (After 2 min looking for reporting): "Where would you expect to find a way to report a case?"
- (If map troubles): "How would you typically select a location on a map?"

### Task 3: Exploring Dengue Risk Map (10 minutes)

**Scenario:**
"You want to check the dengue risk level in your barangay (Commonwealth) and see if there have been any recent cases in your area."

**Instructions:**

1. "Please find information about dengue risk in Barangay Commonwealth"
2. "Look for any recent dengue cases in that area"
3. "Tell me what the risk level means to you"

**Success Criteria:**

- [ ] Navigates to mapping section ≤ 1 minute
- [ ] Locates Commonwealth on map ≤ 2 minutes
- [ ] Views risk information ≤ 1 minute
- [ ] Understands risk level indicators
- [ ] Finds recent case information ≤ 3 minutes

**Observe for:**

- Map navigation efficiency
- Zoom and pan behavior
- Understanding of color coding/legend
- Information interpretation
- Mobile gesture recognition (if on mobile)

### Task 4: Community Engagement (10 minutes)

**Scenario:**
"You want to share a tip about preventing mosquito breeding sites with your community, and you also want to see what others are saying about dengue prevention."

**Instructions:**

1. "Please browse community discussions about dengue"
2. "Add a comment to any post you find interesting"
3. "Create your own post sharing a dengue prevention tip"

**Success Criteria:**

- [ ] Finds community section ≤ 1 minute
- [ ] Browses existing posts ≤ 2 minutes
- [ ] Successfully adds comment ≤ 2 minutes
- [ ] Creates new post ≤ 4 minutes
- [ ] Understands posting privacy options

**Observe for:**

- Community section navigation
- Post browsing behavior
- Comment interaction
- New post creation flow
- Understanding of anonymous options

### Task 5: Mobile Experience (If applicable, 8 minutes)

**Scenario:**
"Now imagine you're out and about in your neighborhood and want to quickly check dengue information on your phone."

**Instructions:**

1. "Please check the dengue risk for your current location using the mobile interface"
2. "Try reporting a case from a mobile device"

**Success Criteria:**

- [ ] Responsive design works well
- [ ] Touch targets are appropriately sized
- [ ] Map gestures work smoothly
- [ ] Forms are usable on small screen
- [ ] Navigation is mobile-friendly

**Observe for:**

- Touch interaction quality
- Screen space utilization
- Loading performance
- Gesture conflicts
- Text readability

---

## Post-Task Interview (10 minutes)

### Immediate Reactions (3 minutes)

1. "What was your overall impression of BuzzMap?"
2. "What did you find most useful or valuable?"
3. "What was most frustrating or confusing?"
4. "How does this compare to other health or mapping apps you've used?"

### Specific Feature Feedback (4 minutes)

1. "How was the dengue reporting process? Would you actually use this feature?"
2. "Did the map provide useful information? Was it easy to understand?"
3. "What did you think of the community features? Would you engage with them?"
4. "Were there any features you expected to find but couldn't?"

### Improvement Suggestions (3 minutes)

1. "If you could change three things about BuzzMap, what would they be?"
2. "What would motivate you to use this platform regularly?"
3. "How would you prefer to be notified about dengue risks in your area?"
4. "Any other suggestions or concerns?"

---

## Post-Test Phase (15 minutes)

### System Usability Scale (SUS) (5 minutes)

"Now I'd like you to fill out a short questionnaire about your experience with BuzzMap. Please answer based on your overall impression from today's session."

[Hand out SUS questionnaire - see SUS_QUESTIONNAIRE.md]

### Additional Questionnaires (5 minutes)

#### Overall Satisfaction Rating

"On a scale of 1-5 stars, how would you rate your overall experience with BuzzMap?"
[ ] 1 star [ ] 2 stars [ ] 3 stars [ ] 4 stars [ ] 5 stars

#### Net Promoter Score

"On a scale of 0-10, how likely are you to recommend BuzzMap to friends or neighbors?"
Score: \_\_\_/10

#### Feature Priority Ranking

"Please rank these features in order of importance to you (1 = most important):

- [ ] Dengue case reporting
- [ ] Risk level mapping
- [ ] Community discussions
- [ ] Prevention information
- [ ] Real-time alerts"

### Final Questions (5 minutes)

1. "Would you actually download and use this app if it were available?"
2. "What concerns, if any, do you have about privacy and data sharing?"
3. "Is there anything else you'd like to tell us about your experience?"
4. "Do you have any questions for us about BuzzMap or this study?"

---

## Wrap-up & Thank You (2 minutes)

"Thank you so much for your time and valuable feedback today. Your insights will directly help us improve BuzzMap to better serve the Quezon City community.

**Next Steps:**

- We'll analyze all feedback from participants like yourself
- The development team will use this to make improvements
- You'll receive a summary of findings if you're interested

**Contact Information:**
If you have any follow-up questions or additional feedback, please feel free to contact [contact information].

Thanks again for helping us make BuzzMap better for everyone!"

---

## Observer Notes Template

### Participant Information

- **Participant ID:** **\_\_\_**
- **Date/Time:** **\_\_\_**
- **Device Used:** **\_\_\_**
- **Role/Background:** **\_\_\_**

### Task Performance

| Task                    | Completion | Time      | Errors | Notes |
| ----------------------- | ---------- | --------- | ------ | ----- |
| 1. Account Creation     | ✓/✗        | \_\_\_min | \_\_\_ |       |
| 2. Case Reporting       | ✓/✗        | \_\_\_min | \_\_\_ |       |
| 3. Map Exploration      | ✓/✗        | \_\_\_min | \_\_\_ |       |
| 4. Community Engagement | ✓/✗        | \_\_\_min | \_\_\_ |       |
| 5. Mobile Experience    | ✓/✗        | \_\_\_min | \_\_\_ |       |

### Usability Issues Discovered

| Issue | Severity                 | Description | Suggested Fix |
| ----- | ------------------------ | ----------- | ------------- |
|       | Critical/High/Medium/Low |             |               |

### Key Quotes

- "**********\*\***********\_\_\_**********\*\***********"
- "**********\*\***********\_\_\_**********\*\***********"
- "**********\*\***********\_\_\_**********\*\***********"

### Overall Assessment

- **SUS Score:** \_\_\_/100
- **Satisfaction:** \_\_\_/5 stars
- **Would Recommend:** \_\_\_/10
- **Key Takeaways:** ****\*\*****\_\_\_\_****\*\*****
