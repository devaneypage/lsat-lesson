## Practice Questions Module Audit

This audit provides a comprehensive review of the existing practice questions module, encompassing its data model, API contracts, repository layer, content management, curriculum integration, search/filtering capabilities, performance considerations, and testing coverage. The goal is to identify strengths, weaknesses, and areas for improvement to inform a robust rebuild strategy.

### 1. Data Model (`drizzle/schema.ts`)

**Strengths:**
- The `questions` table provides essential fields for LSAT practice questions: `questionId`, `questionText`, `optionA-E`, `correctAnswer`, `explanation`, `category`, `difficulty`, and `source`.
- Related tables like `questionTags`, `curriculumSkills`, and `questionSkills` are defined, indicating an existing structure for curriculum integration.
- `questionAttempts` table is well-defined for tracking learner interactions.

**Weaknesses:**
- `category`, `difficulty`, and `source` in the `questions` table are simple `varchar` fields. This limits structured querying and consistency. A more robust approach might involve dedicated lookup tables or enums for these attributes.
- The `explanation` field is a `text` type, which is appropriate, but the content audit revealed 71 missing explanations, indicating a content gap rather than a schema issue.
- No explicit versioning for questions or explanations, which could be useful for tracking content changes over time.

**Areas for Improvement:**
- Consider creating lookup tables for `category`, `difficulty`, and `source` to enforce consistency and enable more efficient filtering.
- Evaluate the need for question versioning if content updates are frequent and historical tracking is required.

### 2. API Contracts (`server/routers/questions.ts`)

**Strengths:**
- Clear separation of concerns with `adminProcedure` for `import` and `publicProcedure` for `list`, `getById`, and `count`.
- Input validation using `zod` is implemented for `import` and `paginationSchema`, ensuring data integrity at the API boundary.
- `toBrowseSafeQuestion` function is used to prevent correctness leakage for public views, which is a crucial security and pedagogical feature.
- Error handling for import operations is present, recording failures in `importHistory`.

**Weaknesses:**
- The `import` procedure is the only administrative endpoint for questions. There are no explicit API endpoints for creating, updating, or deleting individual questions, which would be necessary for a comprehensive content management system.
- `list` and `getById` procedures return a flattened question object. More complex filtering (e.g., by tags, skills) is not directly supported by the API contract.

**Areas for Improvement:**
- Introduce `adminProcedure` endpoints for `create`, `update`, and `delete` individual questions.
- Enhance `list` and `getById` to allow filtering by `category`, `difficulty`, `source`, and `tags`/`skills`.
- Consider adding an endpoint for retrieving full question details (including explanation) for authenticated administrators or after a learner has submitted an attempt.

### 3. Repository Layer (`server/repositories/questions.ts`, `server/db.ts`)

**Strengths:**
- The `questionRepository` provides a clean abstraction layer over the raw database access, promoting separation of concerns.
- It reuses legacy `db.ts` functions, indicating a path for incremental refactoring.

**Weaknesses:**
- The `db.ts` module still contains direct SQL logic for questions, which the `questionRepository` wraps. This creates a 
tight coupling between the repository and the legacy `db.ts` module. The goal of decomposition is to fully abstract the database access.

**Areas for Improvement:**
- Fully extract question-related database operations from `server/db.ts` into `server/repositories/questions.ts` or a dedicated `server/data/questions.ts` module, making `questionRepository` the sole interface for question data access.

### 4. Content Management

**Strengths:**
- CSV import functionality exists, allowing bulk ingestion of questions.
- Import history is recorded, providing an audit trail for content changes.

**Weaknesses:**
- No UI for individual question creation, editing, or deletion. Content management is currently limited to bulk imports.
- The content audit revealed 71 questions with missing explanations, indicating a lack of enforcement or a gap in the import process.

**Areas for Improvement:**
- Develop an administrative UI for managing individual questions, including rich text editing for `questionText` and `explanation`.
- Implement validation during import to ensure `explanation` is always present, or flag questions without explanations for immediate review.
- Consider a content review workflow for new or updated questions.

### 5. Curriculum Integration (`questionTags`, `curriculumSkills`, `questionSkills`)

**Strengths:**
- The schema supports associating questions with tags and curriculum skills, laying the groundwork for structured learning paths.

**Weaknesses:**
- The content audit revealed zero `questionSkills` mappings across 484 questions, indicating that this integration is not actively used or populated.
- `category` and `difficulty` in the `questions` table are not linked to the `tags` or `curriculumSkills` tables, leading to potential redundancy and inconsistency.

**Areas for Improvement:**
- Develop tools or workflows to map questions to `curriculumSkills` and `tags`.
- Integrate `category` and `difficulty` with the `tags` table, potentially using `type: 'category'` or `type: 'difficulty'` for tags.
- Implement UI for administrators to manage question-skill mappings.

### 6. Search and Filtering

**Strengths:**
- Basic pagination is implemented for listing questions.
- Command palette search provides a deep link to individual questions.

**Weaknesses:**
- The `list` API currently only supports `limit` and `offset`. There are no server-side filtering capabilities by `category`, `difficulty`, `source`, `tags`, or `skills`.
- The client-side `QuestionBank` currently loads a bounded set of questions but lacks advanced filtering UI.

**Areas for Improvement:**
- Enhance the `list` API to support filtering by various attributes and relationships (e.g., `category`, `difficulty`, `source`, `tagIds`, `skillIds`).
- Implement server-side full-text search capabilities for `questionText` and `explanation`.
- Develop a rich filtering and search UI for the `QuestionBank` page.

### 7. Performance

**Strengths:**
- `questionId` is unique, and `id` is a primary key, ensuring efficient lookups by these identifiers.
- `questionAttempts` has indexes on `userId, idempotencyKey` and `userId, submittedAt`, which are good for learner-specific queries.

**Weaknesses:**
- Lack of indexes on `category`, `difficulty`, `source` in the `questions` table, which would be critical for efficient filtering if those fields are used for querying.
- The `explanation` field is `text`, which can be large. Full-text search on this field without proper indexing (e.g., MySQL FULLTEXT index) would be inefficient.

**Areas for Improvement:**
- Add indexes to `category`, `difficulty`, and `source` if they are to be used for filtering.
- Consider adding FULLTEXT indexes to `questionText` and `explanation` if full-text search is implemented.
- Optimize queries for complex filtering scenarios, potentially using materialized views or denormalized tables for frequently accessed aggregates.

### 8. Testing

**Strengths:**
- Existing Vitest coverage for import normalization and router contracts.
- Recent additions include regression tests for bounded Practice pagination and deep links.

**Weaknesses:**
- Limited test coverage for content integrity, curriculum mapping, and administrative question management workflows.
- No explicit tests for database constraints (e.g., foreign key relationships, `NOT NULL` constraints beyond basic schema definition).

**Areas for Improvement:**
- Expand unit and integration tests to cover new question management APIs.
- Add tests for curriculum mapping logic and tag associations.
- Implement end-to-end tests for administrative content workflows.

### Rebuild Strategy

The rebuild strategy for the practice questions module will focus on addressing the identified weaknesses and implementing the recommended improvements in a phased approach:

1.  **Phase 1: Data Model Refinement & Content Integrity (Current Phase)**
    - Introduce lookup tables for `category`, `difficulty`, and `source`.
    - Enhance the import process to enforce `explanation` presence.
    - Migrate existing `category`, `difficulty`, `source` data to new lookup tables.

2.  **Phase 2: Comprehensive Content Management API & UI**
    - Implement `adminProcedure` endpoints for `create`, `update`, and `delete` individual questions.
    - Develop an administrative UI for managing questions, including rich text editing and explanation enforcement.

3.  **Phase 3: Advanced Search, Filtering & Curriculum Mapping**
    - Enhance the `list` API with robust filtering capabilities.
    - Implement server-side full-text search.
    - Develop UI for advanced search and filtering on the `QuestionBank` page.
    - Implement UI for administrators to manage question-skill mappings.

4.  **Phase 4: Performance Optimization & Analytics Integration**
    - Add necessary database indexes.
    - Optimize queries for new filtering and search features.
    - Integrate question usage and performance analytics.

This phased approach ensures that core data integrity and administrative capabilities are established before enhancing learner-facing features, minimizing disruption and allowing for incremental verification.
