# LSAT Mastery Platform — Import Guide

## Overview

This guide explains how to import your 1,014+ practice questions and 30-chapter curriculum into the LSAT Mastery platform. The system uses CSV (Comma-Separated Values) format for easy data import.

---

## Part 1: Importing Questions

### Step 1: Prepare Your Questions CSV File

Use the template at `IMPORT_TEMPLATES/questions_template.csv` as a starting point.

#### Required Columns:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | Text | Unique identifier for the question | `Q001`, `Q002`, etc. |
| `type` | Text | Question type | `Necessary Assumption`, `Strengthen`, `Weaken`, `Common Flaw`, `Sufficient Assumption` |
| `section` | Text | LSAT section | `LR` (Logical Reasoning), `RC` (Reading Comprehension) |
| `difficulty` | Text | Difficulty level | `Foundational`, `Intermediate`, `Advanced` |
| `topic` | Text | Topic/skill being tested | `Assumptions`, `Strengthen & Weaken`, `Logical Flaws` |
| `stimulus` | Text | The argument or passage text | Full text of the stimulus |
| `questionText` | Text | The question prompt | "Which of the following..." |
| `optionA` | Text | Answer choice A | Full text of option |
| `optionB` | Text | Answer choice B | Full text of option |
| `optionC` | Text | Answer choice C | Full text of option |
| `optionD` | Text | Answer choice D | Full text of option |
| `optionE` | Text | Answer choice E (optional) | Full text of option |
| `correctAnswer` | Text | Correct answer letter | `A`, `B`, `C`, `D`, or `E` |
| `explanation` | Text | Detailed explanation of the answer | Why this is correct and others are wrong |
| `source` | Text | Source of the question | `LSAT PrepPlus 2024`, `Study Master Guide`, etc. |

### Step 2: Format Your CSV File

**Important formatting rules:**

1. **Use UTF-8 encoding** — Save your file as UTF-8 to handle special characters
2. **Escape quotes** — If your text contains quotes, escape them with double quotes:
   ```
   "He said, ""This is important."""
   ```
3. **Escape commas** — If your text contains commas, wrap the cell in quotes:
   ```
   "The argument states: if A, then B, and if B, then C"
   ```
4. **No line breaks in cells** — Keep all text on a single line per cell
5. **Consistent column order** — Match the template exactly

### Step 3: Import the Questions

1. Navigate to the **Question Bank** page
2. Click **"Import Questions"** button
3. Select your CSV file
4. Review the preview (first 10 rows will be shown)
5. Click **"Import All"** to proceed
6. The system will validate and import all questions

### Step 4: Verify Import

After import:
- Check the **Question Bank** page for your questions
- Use the **Search** and **Filter** features to verify
- Review the **Statistics** dashboard to see question distribution

---

## Part 2: Importing Curriculum Chapters

### Step 1: Prepare Your Curriculum CSV File

Use the template at `IMPORT_TEMPLATES/curriculum_template.csv` as a starting point.

#### Required Columns:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | Text | Unique identifier | `CH001`, `CH002`, etc. |
| `number` | Number | Chapter number (1-30) | `1`, `2`, `3`, etc. |
| `title` | Text | Chapter title | `Introduction to Logical Reasoning` |
| `part` | Text | Part of the curriculum | `Part 1`, `Part 2`, `Part 3`, `Part 4` |
| `description` | Text | Brief description | What students will learn |
| `estimatedHours` | Number | Estimated study time | `2`, `3.5`, `4`, etc. |
| `difficulty` | Text | Difficulty level | `Foundational`, `Intermediate`, `Advanced` |
| `topics` | Text | Comma-separated topics | `Assumptions, Negation Test, Bridge Analogy` |
| `relatedLessons` | Text | Comma-separated lesson names | `Necessary Assumptions, Common Flaws` |
| `relatedQuestions` | Number | Number of practice questions | `25`, `30`, etc. |
| `source` | Text | Source of the curriculum | `Study Master Guide`, etc. |

### Step 2: Format Your CSV File

Follow the same formatting rules as the Questions CSV:
- UTF-8 encoding
- Escape quotes with double quotes
- Wrap cells with commas in quotes
- No line breaks in cells
- Consistent column order

### Step 3: Import the Chapters

1. Navigate to the **Curriculum Guide** page
2. Click **"Import Chapters"** button
3. Select your CSV file
4. Review the preview (first 10 rows will be shown)
5. Click **"Import All"** to proceed
6. The system will validate and import all chapters

### Step 4: Verify Import

After import:
- Check the **Curriculum Guide** page for your chapters
- Verify all 30 chapters are displayed
- Check the **Progress Tracker** to see chapter organization
- Verify chapter-to-lesson linking is correct

---

## Part 3: CSV Template Examples

### Questions CSV Example

```csv
id,type,section,difficulty,topic,stimulus,questionText,optionA,optionB,optionC,optionD,optionE,correctAnswer,explanation,source
Q001,Necessary Assumption,LR,Intermediate,Assumptions,"The city council decided to ban plastic bags because they harm marine life.","Which of the following is an assumption?","The council values environment more than jobs","Plastic bags are the primary cause of pollution","The council considered economic impact","Marine life is more important than employment","Reducing plastic bags will have minimal impact",A,"The argument assumes environmental protection outweighs job concerns.",Study Master Guide
```

### Curriculum CSV Example

```csv
id,number,title,part,description,estimatedHours,difficulty,topics,relatedLessons,relatedQuestions,source
CH001,1,Introduction to Logical Reasoning,Part 1,Overview of LSAT structure and fundamentals,2,Foundational,"LSAT Overview, Argument Structure",Necessary Assumptions,15,Study Master Guide
CH002,2,Formal Logic Foundations,Part 1,Logical notation and conditionals,3,Foundational,"Logical Notation, Conditionals",Formal Logic Fundamentals,20,Study Master Guide
```

---

## Part 4: Data Validation Rules

The system will validate your data before import. Common errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid difficulty level` | Typo in difficulty column | Use exactly: `Foundational`, `Intermediate`, `Advanced` |
| `Missing required column` | Column name doesn't match template | Check column names match exactly (case-sensitive) |
| `Invalid answer letter` | Answer not A-E | Use only `A`, `B`, `C`, `D`, `E` |
| `Duplicate ID` | Same ID used twice | Ensure all IDs are unique |
| `Invalid chapter number` | Chapter number outside 1-30 | Use numbers 1-30 only |
| `Invalid estimated hours` | Non-numeric value | Use numbers only (e.g., `2.5`, `3`) |

---

## Part 5: Troubleshooting

### Import fails with "Invalid CSV format"

**Cause**: CSV file is not properly formatted
**Solution**: 
- Open the file in a text editor (not Excel) to check formatting
- Ensure all quotes are properly escaped
- Check for line breaks within cells
- Verify UTF-8 encoding

### Questions don't appear after import

**Cause**: Import succeeded but questions aren't visible
**Solution**:
- Check the **Question Bank** page and use filters to search
- Verify the `section` column is set to `LR` or `RC`
- Check the **Statistics** dashboard to see if questions were imported
- Try refreshing the page

### Chapters appear but aren't linked to lessons

**Cause**: Lesson names in `relatedLessons` don't match exactly
**Solution**:
- Verify lesson names match exactly (case-sensitive):
  - `Necessary Assumptions`
  - `Common Flaws`
  - `Strengthen & Weaken`
  - `Reading Comprehension`
  - `Formal Logic Fundamentals`
- Use comma-separated format: `Lesson 1, Lesson 2`

---

## Part 6: Best Practices

1. **Test with a small batch first** — Import 10-20 questions to verify format before importing all 1,014
2. **Keep backups** — Save your original CSV files in case you need to re-import
3. **Use consistent naming** — Standardize topic names, lesson names, and sources across all rows
4. **Validate before import** — Open your CSV in a spreadsheet app to check for obvious errors
5. **Document your sources** — Include the source for each question for student reference

---

## Part 7: Support

For issues with import:
1. Check the **Troubleshooting** section above
2. Review the **Data Validation Rules** to ensure your data matches requirements
3. Verify your CSV file is properly formatted using a text editor
4. Contact support if you encounter persistent errors

---

## Appendix: CSV File Preparation Checklist

- [ ] All required columns present and correctly named
- [ ] File saved as UTF-8 encoding
- [ ] All quotes properly escaped with double quotes
- [ ] All cells with commas wrapped in quotes
- [ ] No line breaks within cells
- [ ] All IDs are unique
- [ ] Difficulty levels match exactly (Foundational/Intermediate/Advanced)
- [ ] Answer letters are A-E only
- [ ] Chapter numbers are 1-30
- [ ] Estimated hours are numeric values
- [ ] File tested with first 10 rows before full import
- [ ] Backup copy saved before import
