# Requirements Document

## Introduction

This feature improves the "Current Users" table in the Settings page (`src/pages/Settings.tsx`). The table lists organisation users fetched from `GET /users`. The work extracts the table into a dedicated `UsersTable` component, fixes two UI bugs (action-menu state and responsive collapse), wires up missing actions (delete, suspend/activate), adds missing data fields (avatar, phone, last login, user type), and updates the MSW mock handler to match the spec-compliant `/users` endpoint.

## Glossary

- **UsersTable**: The new React component extracted from `Settings.tsx` that renders the full users table (desktop + mobile views).
- **UserRow**: A single row in the desktop table view, rendered by `UsersTable`.
- **MobileUserCard**: A single card in the mobile view, rendered by `UsersTable`.
- **ActionMenu**: The 3-dot dropdown menu attached to each `UserRow` / `MobileUserCard`.
- **Agent**: The mapped user object returned by `useAgents` (camelCase fields: `userId`, `firstName`, `lastName`, `email`, `phoneNumber`, `role`, `status`, `avatarPath`, `lastLoginAt`, `userType`).
- **CDN_BASE_URL**: The value of the `VITE_CDN_URL` environment variable (`https://cdn.katisha.online`).
- **MSW**: Mock Service Worker — the in-browser API mock layer used during development.
- **Spec-compliant response**: The paginated shape `{ data: UserListItem[], total, page, limit }` defined in `temp/specs.json` for `GET /users`.

---

## Requirements

### Requirement 1: Extract UsersTable Component

**User Story:** As a developer, I want the users table extracted into its own component, so that `Settings.tsx` stays maintainable and the table logic is self-contained.

#### Acceptance Criteria

1. THE `UsersTable` component SHALL be created at `src/components/UsersTable.tsx`.
2. THE `UsersTable` component SHALL accept the props required to render the full table: the paginated agents data, loading state, query state, and callbacks for pagination and query changes.
3. WHEN `Settings.tsx` renders the users table section, THE `Settings` page SHALL delegate rendering to `UsersTable` instead of containing the table markup inline.
4. THE `UsersTable` component SHALL export a TypeScript interface for its props.

---

### Requirement 2: Fix Action Menu Outside-Click Bug

**User Story:** As a user, I want the 3-dot action menu to close reliably when I click outside it, so that stale menus do not remain open while I interact with the page.

#### Acceptance Criteria

1. THE `UsersTable` component SHALL track the open action menu using a `string | null` state keyed by `userId`.
2. WHEN a user clicks the 3-dot button for a row whose menu is already open, THE `ActionMenu` SHALL close (toggle off).
3. WHEN a user clicks outside the `ActionMenu` container, THE `ActionMenu` SHALL close.
4. THE outside-click detection SHALL use a `useRef` attached to each menu container and a `mousedown` event listener that checks `contains()` to determine whether the click was inside or outside.
5. IF the `mousedown` event target is inside the menu container ref, THEN THE `ActionMenu` SHALL remain open.
6. THE outside-click listener SHALL be registered and cleaned up per-menu-open lifecycle (added when a menu opens, removed when it closes or the component unmounts).

---

### Requirement 3: Fix Responsive Collapse — Expanded Row Content

**User Story:** As a user on a small screen, I want the expanded row to show details that are hidden at my screen size, so that I can access all user information without redundant repetition on large screens.

#### Acceptance Criteria

1. WHEN the viewport is `lg` or wider, THE expanded row in the desktop table SHALL NOT display the email field (because the email column is already visible as `hidden lg:table-cell`).
2. WHEN the viewport is `lg` or wider, THE expanded row SHALL display only fields that are never shown as table columns: `phoneNumber`, `lastLoginAt`, and `userId`.
3. WHEN the viewport is smaller than `lg`, THE expanded row SHALL display all hidden details: `email`, `phoneNumber`, `lastLoginAt`, and `userId`.
4. THE expand/collapse button in the desktop table SHALL be hidden on `lg` and wider viewports IF there are no fields to reveal (i.e., all non-hidden fields are already visible as columns).
5. WHERE `phoneNumber` is null or empty, THE expanded row SHALL omit the phone field rather than rendering an empty value.

---

### Requirement 4: Avatar Image with Initials Fallback

**User Story:** As a user, I want to see a real avatar photo when one is available, so that I can visually identify users more easily.

#### Acceptance Criteria

1. WHEN an `Agent`'s `avatarPath` field is non-null and non-empty, THE `UsersTable` component SHALL render an `<img>` element with `src` set to `CDN_BASE_URL + "/" + avatarPath`.
2. WHEN the avatar image fails to load (`onError`), THE `UsersTable` component SHALL fall back to displaying the user's initials in a coloured circle.
3. WHEN `avatarPath` is null or empty, THE `UsersTable` component SHALL display the user's initials (`firstName[0] + lastName[0]`) in a coloured gradient circle.
4. THE avatar element SHALL be the same size in both the desktop row (40 × 40 px) and the mobile card (48 × 48 px).

---

### Requirement 5: Wire Up Delete User with Inline Confirmation

**User Story:** As an admin, I want to delete a user from the action menu with a confirmation step, so that accidental deletions are prevented.

#### Acceptance Criteria

1. THE `ActionMenu` SHALL include a "Delete User" button for each row.
2. WHEN a user clicks "Delete User" for the first time, THE button label SHALL change to "Confirm Delete?" without closing the menu.
3. WHEN a user clicks "Confirm Delete?" (second click), THE `UsersTable` component SHALL call `useDeleteUser` with the `userId` of that row.
4. WHEN the delete mutation succeeds, THE `ActionMenu` SHALL close and the users list SHALL refresh (via query invalidation already implemented in `useDeleteUser`).
5. WHEN the `ActionMenu` closes before the second confirmation click, THE delete confirmation state SHALL reset so the next open shows "Delete User" again.
6. IF the delete mutation returns an error, THEN THE `UsersTable` component SHALL display a toast notification with the error message.

---

### Requirement 6: Suspend / Activate User Action

**User Story:** As an admin, I want to suspend or reactivate a user directly from the action menu, so that I can manage access without navigating to a separate page.

#### Acceptance Criteria

1. WHEN a user's `status` is `"active"`, THE `ActionMenu` SHALL display a "Suspend User" option.
2. WHEN a user's `status` is `"suspended"`, THE `ActionMenu` SHALL display an "Activate User" option.
3. WHEN a user's `status` is `"pending_verification"`, THE `ActionMenu` SHALL display neither "Suspend" nor "Activate" (the option SHALL be omitted).
4. WHEN an admin clicks "Suspend User", THE `UsersTable` component SHALL call `useUpdateUser(userId)` with `{ status: "suspended" }`.
5. WHEN an admin clicks "Activate User", THE `UsersTable` component SHALL call `useUpdateUser(userId)` with `{ status: "active" }`.
6. WHEN the status mutation succeeds, THE `ActionMenu` SHALL close and the users list SHALL refresh.
7. IF the status mutation returns an error, THEN THE `UsersTable` component SHALL display a toast notification with the error message.

---

### Requirement 7: Show Additional Fields — Phone, Last Login, User Type

**User Story:** As an admin, I want to see a user's phone number, last login time, and user type in the expanded details section, so that I have richer context without cluttering the main table columns.

#### Acceptance Criteria

1. THE `useAgents` hook SHALL map `user.user_type` from the API response to an `userType` field on the `Agent` object.
2. WHEN the expanded row or mobile card details section is open, THE `UsersTable` component SHALL display `userType` as a badge (e.g., "Staff" or "Passenger").
3. WHEN the expanded row or mobile card details section is open and `lastLoginAt` is non-null, THE `UsersTable` component SHALL display `lastLoginAt` formatted as a human-readable date-time string.
4. WHEN `lastLoginAt` is null, THE `UsersTable` component SHALL display "Never" in place of the date.
5. WHEN the expanded row or mobile card details section is open and `phoneNumber` is non-null, THE `UsersTable` component SHALL display `phoneNumber`.

---

### Requirement 8: Update MSW Mock Handler for GET /users

**User Story:** As a developer, I want the MSW mock to intercept `GET /users` with a spec-compliant response, so that local development and tests work correctly without a real backend.

#### Acceptance Criteria

1. THE MSW handler file `src/mocks/handlers/agents.ts` SHALL include a handler for `GET /users` that returns a spec-compliant paginated response `{ data: UserListItem[], total, page, limit }`.
2. THE mock `UserListItem` objects SHALL use the API field names: `id`, `first_name`, `last_name`, `email`, `phone_number`, `avatar_path`, `user_type`, `status`, `roles`, `org_id`, `last_login_at`, `created_at`.
3. THE mock handler SHALL support the `page` and `limit` query parameters and return the correct slice of data.
4. THE mock handler SHALL support the `status` query parameter and filter the mock data accordingly.
5. THE mock handler SHALL support the `user_type` query parameter and filter the mock data accordingly.
6. THE existing legacy `/organizations/:orgId/agents` handlers SHALL be retained to avoid breaking other parts of the application that may still reference them.
7. THE mock SHALL include at least 5 varied user records covering different statuses (`active`, `suspended`, `pending_verification`), user types (`staff`, `passenger`), and roles.

---

### Requirement 9: Add DELETE /users/:id and PATCH /users/:id Mock Handlers

**User Story:** As a developer, I want the MSW mock to handle delete and status-update mutations for users, so that the new delete and suspend/activate actions work end-to-end in local development.

#### Acceptance Criteria

1. THE MSW handler file SHALL include a handler for `DELETE /users/:id` that removes the matching user from the in-memory mock data and returns HTTP 204.
2. THE MSW handler file SHALL include a handler for `PATCH /users/:id` that updates the matching user's fields in the in-memory mock data and returns the updated `UserListItem`.
3. IF no user with the given `id` is found in the mock data, THEN THE mock handler SHALL return HTTP 404.
