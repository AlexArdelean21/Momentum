# 🔥 Momentum - Project Roadmap

This document outlines the necessary steps to complete the multi-user functionality, prepare the app for initial user feedback, and explore future enhancements.

---

## Phase 1: Complete Multi-User Functionality (Critical Priority)

**Goal:** Ensure the application is fully multi-tenant, meaning each user's data is completely isolated and private. This is the most critical step before letting anyone use the app.

1.  **Modernize Authentication (`next-auth` v5):**
    *   **Action:** Refactor `lib/auth.ts` to use the latest `next-auth` (v5) patterns. Instead of exporting `authOptions`, it should export `handlers`, `auth`, `signIn`, and `signOut`.
    *   **Action:** Update the route handler at `app/api/auth/[...nextauth]/route.ts` to use the new `handlers` export from `lib/auth.ts`.
    *   **Why:** This aligns the project with the latest Next.js 14 App Router conventions, making authentication easier to manage and more secure.

2.  **Implement User-Scoped Server Actions:**
    *   **Action:** Refactor all database functions in `lib/actions.ts`.
    *   **Action:** In each function, use the `auth()` function (from your updated `lib/auth.ts`) to get the current user's session.
    *   **Action:** If there is no session, throw an error to prevent unauthorized access.
    *   **Action:** **Crucially**, replace the hardcoded `DEFAULT_USER_ID` with the logged-in user's ID (`session.user.id`) in all SQL queries.
    *   **Why:** This is the core of data privacy. It ensures users can only create, view, edit, or delete their own activities.

3.  **Implement User-Scoped Data Fetching:**
    *   **Action:** Review how data is fetched on the main page (`app/page.tsx`) and in components like `activity-dashboard.tsx`.
    *   **Action:** Ensure that any function responsible for fetching data (e.g., in `lib/database.ts`) is passed the user's ID and uses it in a `WHERE user_id = ...` clause.
    *   **Why:** This prevents one user's data from ever being accidentally displayed to another.

---

## Phase 2: Polish the User Experience

**Goal:** Make the app feel intuitive, stable, and polished for your first users.

1.  **Update UI for a Multi-User World:**
    *   **Action:** Modify the `components/header.tsx` to display the current user's name or avatar.
    *   **Action:** Add a "Sign Out" button to the header that uses the `signOut` function from `next-auth`.
    *   **Action:** Flesh out the `app/profile/page.tsx` to show basic user information and perhaps some personal stats.

2.  **Refine Onboarding and Empty States:**
    *   **Action:** Design a welcoming "empty state" for new users who haven't created any habits yet. This should appear on the main dashboard.
    *   **Action:** Include a clear call-to-action, like a button or a prompt, guiding them to create their first habit.

3.  **Improve Error Handling and User Feedback:**
    *   **Action:** Integrate a notification library like `sonner` (which you already have) to provide user-facing feedback.
    *   **Action:** Show success messages (e.g., "Habit created successfully!") and clear error messages (e.g., "Failed to create habit. Please try again.").
    *   **Why:** This makes the app feel more responsive and keeps users informed about what's happening.

---

## Phase 3: Pre-Deployment & Feedback Gathering

**Goal:** Prepare the application for a smooth deployment and easy feedback collection.

1.  **Conduct Thorough Multi-User Testing:**
    *   **Action:** Create at least two separate user accounts (e.g., `user-a@test.com` and `user-b@test.com`).
    *   **Action:** Log in as User A, create/edit/delete several habits. Log out.
    *   **Action:** Log in as User B and verify that you **cannot** see any of User A's data. Perform the same actions.
    *   **Action:** Test both Google Sign-In and email/password sign-in flows.

2.  **Finalize Environment and Documentation:**
    *   **Action:** Create a `.env.example` file that lists all required environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, etc.) without their values.
    *   **Action:** Update the `README.md` file's "Database Schema" section to include the `users` table and the `user_id` foreign key columns in the `activities` and `activity_logs` tables.

---

## Phase 4: Future Ideas (Making it Great)

**Goal:** Explore features that will increase engagement and make your app stand out.

*   **Advanced Analytics & Visualizations:**
    *   **Idea:** A dedicated "Progress" page with charts showing habit consistency over time.
    *   **Idea:** A "heatmap" calendar view for each habit, showing completion days at a glance.

*   **Enhanced Habit Customization:**
    *   **Idea:** Allow users to define habit frequency (e.g., "3 times a week," "weekends only") instead of just daily.
    *   **Idea:** Allow users to set quantifiable goals (e.g., "Read 25 pages," "Run for 30 minutes") instead of a simple checkmark.

*   **Reminders & Notifications:**
    *   **Idea:** Let users set daily or weekly reminders for their habits, delivered via email or (later) push notifications.

*   **Habit Archiving:**
    *   **Idea:** Instead of permanently deleting a habit and its history, allow users to "archive" it. This would hide it from the main dashboard but preserve the data for future reference.

*   **Accessibility and Internationalization:**
    *   **Idea:** Ensure the app is fully accessible using screen readers and keyboard navigation.
    *   **Idea:** Add support for multiple languages.