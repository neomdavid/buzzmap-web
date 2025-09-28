# How to Create and Implement the System Usability Scale (SUS) for BuzzMap

## What is the System Usability Scale (SUS)?

The SUS is a standardized, industry-proven questionnaire that provides a quick and reliable measure of system usability. It consists of 10 questions with a 5-point Likert scale that produces a single score from 0-100.

## Step-by-Step Implementation Guide

### Step 1: Use the Standard SUS Questions

The 10 standard SUS questions are **always the same** (this consistency is what makes SUS reliable across different studies):

1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using this system.
10. I needed to learn a lot of things before I could get going with this system.

### Step 2: Create Your SUS Form

Here are three ways to implement the SUS for BuzzMap:

#### Option A: Paper Form (Recommended for in-person testing)

```
BUZZMAP SYSTEM USABILITY SCALE (SUS)

Instructions: Please read each statement and indicate how much you agree or disagree with each one regarding your experience with BuzzMap.

Scale: 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree

1. I think that I would like to use BuzzMap frequently.
   [1] [2] [3] [4] [5]

2. I found BuzzMap unnecessarily complex.
   [1] [2] [3] [4] [5]

3. I thought BuzzMap was easy to use.
   [1] [2] [3] [4] [5]

4. I think that I would need the support of a technical person to be able to use BuzzMap.
   [1] [2] [3] [4] [5]

5. I found the various functions in BuzzMap were well integrated.
   [1] [2] [3] [4] [5]

6. I thought there was too much inconsistency in BuzzMap.
   [1] [2] [3] [4] [5]

7. I would imagine that most people would learn to use BuzzMap very quickly.
   [1] [2] [3] [4] [5]

8. I found BuzzMap very cumbersome to use.
   [1] [2] [3] [4] [5]

9. I felt very confident using BuzzMap.
   [1] [2] [3] [4] [5]

10. I needed to learn a lot of things before I could get going with BuzzMap.
    [1] [2] [3] [4] [5]
```

#### Option B: Google Forms (For remote testing)

Create a Google Form with:

- Title: "BuzzMap System Usability Scale"
- Description: "Please rate your experience with BuzzMap"
- 10 multiple choice questions (1-5 scale)
- Required responses for all questions

#### Option C: Online Survey Tool (Qualtrics, SurveyMonkey, etc.)

Same format as Google Forms but with more advanced features like:

- Randomized question order (not recommended for SUS)
- Logic jumps
- Better analytics

### Step 3: Calculate SUS Scores

**Manual Calculation Method:**

1. **For odd-numbered questions (1, 3, 5, 7, 9):**

   - Score contribution = (Response - 1)
   - Example: If response is 4, contribution = 4 - 1 = 3

2. **For even-numbered questions (2, 4, 6, 8, 10):**

   - Score contribution = (5 - Response)
   - Example: If response is 2, contribution = 5 - 2 = 3

3. **Add all 10 contributions together**

4. **Multiply by 2.5 to get final SUS score (0-100)**

**Example Calculation:**

```
Participant responses: [4, 2, 5, 1, 4, 2, 5, 1, 4, 2]

Odd questions (1,3,5,7,9): [4,5,4,5,4]
Contributions: [3,4,3,4,3] = 17

Even questions (2,4,6,8,10): [2,1,2,1,2]
Contributions: [3,4,3,4,3] = 17

Total: 17 + 17 = 34
SUS Score: 34 × 2.5 = 85 (Excellent!)
```

### Step 4: Create an Excel/Google Sheets Calculator

**Template for BuzzMap SUS Calculation:**

| Participant ID | Q1  | Q2  | Q3  | Q4  | Q5  | Q6  | Q7  | Q8  | Q9  | Q10 | SUS Score                                                                     | Interpretation                                                                      |
| -------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| P001           | 4   | 2   | 5   | 1   | 4   | 2   | 5   | 1   | 4   | 2   | =((B2-1)+(5-C2)+(D2-1)+(5-E2)+(F2-1)+(5-G2)+(H2-1)+(5-I2)+(J2-1)+(5-K2))\*2.5 | =IF(L2>=84,"Excellent",IF(L2>=74,"Good",IF(L2>=68,"OK",IF(L2>=52,"Poor","Awful")))) |

**Formula for SUS Score:**

```
=((Q1-1)+(5-Q2)+(Q3-1)+(5-Q4)+(Q5-1)+(5-Q6)+(Q7-1)+(5-Q8)+(Q9-1)+(5-Q10))*2.5
```

### Step 5: Interpret SUS Scores

**Score Ranges:**

- **85-100**: Excellent (Grade A+)
- **80-84**: Excellent (Grade A)
- **74-79**: Good (Grade B)
- **68-73**: Good (Grade C)
- **52-67**: OK (Grade D)
- **0-51**: Poor (Grade F)

**Industry Benchmarks:**

- **Average SUS score across all systems: 68**
- **Good usability target: ≥70**
- **Excellent usability target: ≥80**

**For BuzzMap specifically:**

- **Target: ≥70** (Good usability for public health platform)
- **Stretch goal: ≥75** (Above average for community-facing health tech)

### Step 6: BuzzMap-Specific Implementation

**When to Administer:**

- **Immediately after** completing usability tasks
- **Before** the post-test interview
- **While experience is fresh** in participant's mind

**Administration Tips:**

1. **Don't explain questions** - let participants interpret naturally
2. **Encourage quick responses** - first instinct is usually best
3. **No neutral option pressure** - 3 is acceptable if truly neutral
4. **Complete all 10 questions** - incomplete SUS scores are invalid

**For BuzzMap Testing Sessions:**

```
Facilitator Script:
"Now I'd like you to fill out a short questionnaire about your overall experience with BuzzMap. This is called the System Usability Scale, and it helps us understand how usable you found the system.

Please respond based on your gut feeling about each statement. There are no right or wrong answers - we want your honest impression. The questions might seem repetitive, but that's normal and helps ensure accuracy.

Please answer all 10 questions before we continue to the final discussion."
```

### Step 7: Analyze and Report Results

**Individual Analysis:**

- Calculate each participant's SUS score
- Note any incomplete responses (exclude from analysis)
- Identify outliers (very high or very low scores)

**Group Analysis:**

- Calculate mean SUS score for all participants
- Calculate median (often more representative than mean)
- Calculate standard deviation
- Compare by user group (community vs. health workers vs. admins)

**Reporting Template:**

```
BuzzMap SUS Results Summary:

Overall Results:
- Mean SUS Score: XX.X (Interpretation: Good/Excellent/etc.)
- Median SUS Score: XX.X
- Standard Deviation: X.X
- Range: XX - XX
- Total Participants: XX

By User Group:
- Community Members (n=12): Mean XX.X
- Health Workers (n=5): Mean XX.X
- Administrators (n=3): Mean XX.X

Benchmark Comparison:
- Industry Average: 68
- BuzzMap Score: XX.X (XX points above/below average)
- Target Achievement: [Met/Not Met] (Target: ≥70)
```

### Step 8: Tools and Resources

**Recommended Tools:**

1. **Paper forms** - Most reliable for in-person testing
2. **Google Forms** - Free, easy to set up
3. **Excel/Google Sheets** - For calculation and analysis
4. **Qualtrics** - If you have institutional access

**Useful Resources:**

- Original SUS paper: Brooke, J. (1996)
- SUS Score interpretation: Bangor et al. (2008)
- Online SUS calculator: measuringu.com/sus/

### Step 9: Common Mistakes to Avoid

❌ **Don't modify the questions** - This breaks comparability
❌ **Don't explain what questions mean** - Let participants interpret
❌ **Don't average incomplete responses** - Exclude invalid responses
❌ **Don't use SUS alone** - Combine with other usability metrics
❌ **Don't administer before participants use the system** - They need actual experience

✅ **Do keep questions in standard order**
✅ **Do collect SUS immediately after testing**
✅ **Do supplement with qualitative feedback**
✅ **Do compare against industry benchmarks**
✅ **Do track SUS over time (before/after improvements)**

## Quick Start Checklist for BuzzMap

- [ ] Print SUS forms or set up digital version
- [ ] Prepare Excel calculator with formulas
- [ ] Brief facilitators on SUS administration
- [ ] Plan timing (5 minutes after tasks, before interview)
- [ ] Set up analysis template for reporting
- [ ] Establish target scores (≥70 for BuzzMap)

The SUS is a powerful tool that will give you objective, comparable data about BuzzMap's usability that you can track over time and compare against industry standards.
