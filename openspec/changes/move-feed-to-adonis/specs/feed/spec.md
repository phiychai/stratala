## ADDED Requirements

### Requirement: Personalized Feed API
The system SHALL provide a personalized feed endpoint at `GET /api/feed` that returns content from the user's followed spaces.

#### Scenario: Authenticated user retrieves feed
- **WHEN** an authenticated user requests `GET /api/feed`
- **THEN** the system returns posts and videos from their followed spaces
- **AND** content is sorted by `publishedAt` descending (chronological) by default
- **AND** the response includes `{ content: Array<{type, content}>, count, totalDocs }`

#### Scenario: User with no followed spaces
- **WHEN** an authenticated user with no followed spaces requests `GET /api/feed`
- **THEN** the system returns an empty content array
- **AND** count and totalDocs are 0

#### Scenario: Unauthenticated request
- **WHEN** an unauthenticated user requests `GET /api/feed`
- **THEN** the system returns 401 Unauthorized
- **AND** the response includes message "Authentication required"

### Requirement: Feed Sorting Options
The system SHALL support sorting the feed by different criteria via query parameter.

#### Scenario: Sort by chronological (default)
- **WHEN** user requests `GET /api/feed?sortBy=chronological`
- **THEN** content is sorted by `publishedAt` descending (newest first)

#### Scenario: Sort by engagement
- **WHEN** user requests `GET /api/feed?sortBy=engagement`
- **THEN** content is sorted by engagement metrics (likes, views)

### Requirement: Feed Pagination
The system SHALL support pagination for the feed endpoint.

#### Scenario: Paginated request
- **WHEN** user requests `GET /api/feed?limit=10&page=2`
- **THEN** the system returns up to 10 items from the second page
- **AND** the response reflects the pagination state

#### Scenario: Default pagination
- **WHEN** user requests `GET /api/feed` without pagination params
- **THEN** the system uses default limit of 20 and page 1
