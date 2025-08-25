# 🔥 Momentum - Project Roadmap
npx prisma studio

This document outlines the necessary steps to complete the multi-user functionality, prepare the app for initial user feedback, and explore future enhancements.


🧩 Feature 2: Advanced Activity System (Project-Based Activities)

Goal: enhance the current flat activity system to support multi-step structured activities that track incremental progress throughout the day.

Design:

Introduce a new entity type: ProjectActivity

Each ProjectActivity includes:

A name (e.g., “Fitness Routine”)

A list of sub-tasks or targets (e.g., 100 pushups, 100 squats, 10km run)

Optional labels like repeatsToday: true, progressRequired: true, etc.

User Flow:

User creates a ProjectActivity with subtasks and target values

Throughout the day, the user logs partial completions (e.g., “+50 pushups” in the morning, “+50” in the evening)

When all targets are met → mark as completed for the day → streak updates

Tasks:

Create ProjectActivity schema/model (backend + database migration)

Build UI to create multi-step activities with targets

Allow users to log partial progress on subtasks

Aggregate progress and update streaks accordingly

Allow editing or undoing progress per sub-task

Display progress visually in the dashboard (e.g., progress bars)

Outcome: Supports flexible, real-life goal tracking, not just binary "done/not done" actions.

🧩 Feature 3: Push Notifications

Goal: Implement browser push notifications to remind users to complete daily activities or celebrate achievements.

Requirements:

PWA support enabled (✅)

Service Worker correctly registered

User must grant notification permissions

Notifications can be:

Scheduled (e.g., “Reminder: Complete your tasks today”)

Triggered (e.g., “You’ve completed your goal!”)

Tasks:

Ask for browser notification permission

Use the Notifications API + Service Worker to send messages

Integrate notifications with activity logic (trigger reminders, streak alerts, milestone celebrations)

Optionally use localStorage or server-side data to determine when reminders are needed

Bonus: Implement notification scheduling (e.g., remind at 8 PM if goals aren’t done)
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