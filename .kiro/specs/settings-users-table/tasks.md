# Implementation Plan: settings-users-table

## Overview

Extract the inline users table from `Settings.tsx` into a dedicated `UsersTable` component, fix two UI bugs (action-menu outside-click, responsive collapse), wire up delete and suspend/activate mutations, add missing data fields (avatar, phone, last login, user type), and update MSW mock handlers to match the spec-compliant `/users` endpoint.

## Tasks

- [x] 1. Update `Agent` interface and `useAgents` hook
  - [x] 1.1 Add `userType`, `avatarPath`, and `lastLoginAt` fields to the `Agent` interface in `src/hooks/useAgent.ts`
    - Add `avatarPath?: string | null`, `lastLoginAt?: string | null`, `userType?: 'passenger' | 'staff'` to the interface
    - _Requirements: 7.1_
  - [x] 1.2 Add `userType` mapping in `useAgents.ts`
    - In the `items.map(...)` block, add `userType: user.user_type as 'passenger' | 'staff' | undefined`
    - _Requirements: 7.1_
  - [ ]* 1.3 Write property test for `userType` mapping round-trip
    - **Property 6: userType mapping round-trip**
    - **Validates: Requirements 7.1**
    - Use `fc.constantFrom('staff', 'passenger')` for `user_type`; assert the mapped `Agent.userType` equals the input value

- [x] 2. Update MSW mock handlers in `src/mocks/handlers/agents.ts`
  - [x] 2.1 Replace the in-memory mock array with spec-compliant `MockUser` objects
    - Declare `let mockUsers: MockUser[]` with at least 5 varied records covering `active`, `suspended`, `pending_verification` statuses and `staff`, `passenger` user types
    - Fields: `id`, `first_name`, `last_name`, `email`, `phone_number`, `avatar_path`, `user_type`, `status`, `roles`, `org_id`, `last_login_at`, `created_at`
    - _Requirements: 8.2, 8.7_
  - [x] 2.2 Add `GET /users` handler with pagination and filtering
    - Support `page`, `limit`, `status`, and `user_type` query params
    - Return `{ data, total, page, limit }` paginated shape
    - _Requirements: 8.1, 8.3, 8.4, 8.5_
  - [x] 2.3 Add `DELETE /users/:id` handler
    - Remove matching user from `mockUsers`; return 204 on success, 404 if not found
    - _Requirements: 9.1, 9.3_
  - [x] 2.4 Add `PATCH /users/:id` handler
    - Merge patch payload into matching user; return updated object on success, 404 if not found
    - _Requirements: 9.2, 9.3_
  - [x] 2.5 Retain legacy `/organizations/:orgId/agents` handlers unchanged
    - _Requirements: 8.6_
  - [ ]* 2.6 Write property test for mock pagination correctness
    - **Property 8: Mock pagination correctness**
    - **Validates: Requirements 8.3**
    - Use `fc.integer({ min: 1 })` for page and `fc.integer({ min: 1, max: 50 })` for limit; assert returned slice equals `mockUsers.slice((page-1)*limit, page*limit)`
  - [ ]* 2.7 Write property test for mock status filter correctness
    - **Property 9: Mock status filter correctness**
    - **Validates: Requirements 8.4**
    - Use `fc.constantFrom('active', 'suspended', 'pending_verification')`; assert every item in response has matching `status`
  - [ ]* 2.8 Write property test for mock user_type filter correctness
    - **Property 10: Mock user_type filter correctness**
    - **Validates: Requirements 8.5**
    - Use `fc.constantFrom('staff', 'passenger')`; assert every item in response has matching `user_type`
  - [ ]* 2.9 Write property test for mock DELETE removes user
    - **Property 11: Mock DELETE removes user**
    - **Validates: Requirements 9.1**
    - Seed a user with `fc.uuid()` id, DELETE it, then GET and assert the id is absent
  - [ ]* 2.10 Write property test for mock PATCH merges fields
    - **Property 12: Mock PATCH merges fields**
    - **Validates: Requirements 9.2**
    - Use `fc.record({ status: fc.constantFrom('active', 'suspended') })` as patch; assert returned object has original fields merged with patch

- [x] 3. Checkpoint — ensure mock handlers work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create `src/components/UsersTable.tsx`
  - [x] 4.1 Define and export the `UsersTableProps` interface and component scaffold
    - Props: `agentsQuery` (return type of `useAgents`), `rolesLoading: boolean`, `agentQuery: AgentQuery`
    - Internal state: `expandedRows: Set<string>`, `actionMenuOpen: string | null`, `pendingDelete: string | null`, `menuRef: RefObject<HTMLDivElement>`
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 4.2 Implement avatar sub-component (inline)
    - Try `<img src={CDN_BASE_URL + "/" + avatarPath} onError={...} />`; on error fall back to initials circle
    - Accept a `size` prop for 40 px (desktop) vs 48 px (mobile)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 4.3 Write property test for avatar URL construction
    - **Property 1: Avatar URL construction**
    - **Validates: Requirements 4.1**
    - Use `fc.string({ minLength: 1 })` for `avatarPath`; assert rendered `<img>` src equals `CDN_BASE_URL + "/" + avatarPath`
  - [ ]* 4.4 Write property test for initials fallback
    - **Property 2: Initials fallback**
    - **Validates: Requirements 4.3**
    - Use `fc.string({ minLength: 1 })` for `firstName` and `lastName`; assert displayed initials equal `firstName[0].toUpperCase() + lastName[0].toUpperCase()`
  - [x] 4.5 Implement outside-click detection for `ActionMenu` using `menuRef`
    - Attach `mousedown` listener when a menu opens; call `setActionMenuOpen(null)` if `!menuRef.current?.contains(event.target)`
    - Clean up listener on menu close and component unmount
    - _Requirements: 2.3, 2.4, 2.5, 2.6_
  - [x] 4.6 Implement delete confirmation flow in `ActionMenu`
    - First click sets `pendingDelete` to `userId` and changes label to "Confirm Delete?"
    - Second click calls `deleteUser.mutate(userId)`; on success close menu; on error show toast
    - Menu close resets `pendingDelete` to `null`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [ ]* 4.7 Write property test for delete confirmation calls hook with correct userId
    - **Property 3: Delete confirmation calls hook with correct userId**
    - **Validates: Requirements 5.3**
    - Use `fc.record({ userId: fc.uuid(), ... })` for a user row; assert `useDeleteUser` is called with exactly that `userId`
  - [x] 4.8 Implement suspend/activate action in `ActionMenu`
    - Show "Suspend User" when `status === 'active'`, "Activate User" when `status === 'suspended'`, neither when `status === 'pending_verification'`
    - Call `useUpdateUser(userId).mutate({ status: ... })`; on success close menu; on error show toast
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [ ]* 4.9 Write property test for action menu status options
    - **Property 4: Action menu status options are mutually exclusive and status-driven**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - Use `fc.constantFrom('active', 'suspended', 'pending_verification')`; assert exactly the correct option is rendered
  - [ ]* 4.10 Write property test for suspend/activate payload
    - **Property 5: Suspend/activate calls hook with correct payload**
    - **Validates: Requirements 6.4, 6.5**
    - Use `fc.constantFrom('active', 'suspended')` for status; assert `useUpdateUser` is called with the correct inverse status payload
  - [x] 4.11 Implement desktop table view with corrected responsive collapse
    - Render `email` column as `hidden lg:table-cell`; expanded row shows only `phoneNumber`, `lastLoginAt`, `userId` on `lg+` and adds `email` on smaller viewports
    - Hide expand button on `lg+` if no hidden fields remain
    - Format `lastLoginAt` as human-readable string; render "Never" when null
    - Display `userType` badge in expanded row
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.2, 7.3, 7.4, 7.5_
  - [ ]* 4.12 Write property test for lastLoginAt formatting
    - **Property 7: lastLoginAt formatting**
    - **Validates: Requirements 7.3**
    - Use `fc.date()` mapped to ISO string; assert rendered text is parseable by `new Date()` and is not the raw ISO string
  - [x] 4.13 Implement mobile card view with same avatar, expanded details, and action menu
    - Mirror desktop logic for avatar, expanded details (email, phone, lastLoginAt, userType, userId), and action menu
    - _Requirements: 4.4, 7.2, 7.3, 7.4, 7.5_

- [x] 5. Update `Settings.tsx` to use `UsersTable`
  - [x] 5.1 Remove inline table markup from `Settings.tsx` and replace with `<UsersTable agentsQuery={agentsQuery} rolesLoading={rolesLoading} agentQuery={agentQuery} />`
    - Remove `expandedRows`, `actionMenuOpen` state and the `mousedown` outside-click effect from `Settings.tsx`
    - _Requirements: 1.3_

- [x] 6. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use **fast-check** (`fc`) — install if not already present (`npm install --save-dev fast-check`)
- Each property test tag format: `// Feature: settings-users-table, Property N: <property text>`
- `CDN_BASE_URL` is read from `import.meta.env.VITE_CDN_URL`
- Legacy `/organizations/:orgId/agents` handlers must remain untouched to avoid breaking other pages
