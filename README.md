# REAgent / LeadManager - Pan-India Real Estate Workflow

## Product Overview
REAgent (LeadManager) is a role-based lead management system designed to streamline the "Pan-India New Store Opening" workflow. It facilitates a 10-stage process from "Option Identified" to "Rent Declaration," involving multiple stakeholders such as State RE, Business Team (BT), Finance, Legal, and Projects.

### Key Features
-   **10-Stage Workflow**: Granular tracking with stages like 'Under Negotiation', 'Termsheet Approval', 'RFC / Fitout', etc.
-   **Role-Based Access Control (RBAC)**: Strict permissions for actions (e.g., only State RE can create leads, only BT can approve validation steps).
-   **Dynamic Dashboard**: Visual workflow progress bar, action item counters, and filtered views based on user role.
-   **Mock Mode**: Fully functional offline mode with simulated backend responses for testing and demos.
-   **Secure Deletion**: Soft-delete functionality restricted to Admins and the Lead Creator.

---

## Feature Walkthrough & Implementation Summary

### Completed Enhancements
We have successfully implemented and refined the following core features:

1.  **Workflow Dashboard**
    -   Visualize the 10-stage progression.
    -   Actionable "My Items" counter.
    -   New columns: 'Stage' and 'Sub-Status'.
    -   **Code Reference**: `client/src/pages/Dashboard.jsx`

2.  **Lead Deletion Architecture**
    -   **UI**: Material-UI confirmation dialog replacing native alerts.
    -   **Backend**: `deleteLead` endpoint performing soft deletes (status -> 'Dropped').
    -   **Mock Mode**: simulated `DELETE` requests in `axios.js`.
    -   **Security**: Role checks to ensure only authorized users can delete.

3.  **Role & Security Hardening**
    -   **Server**: `leadController.js` now validates if the requesting user has the authority to advance the workflow stage using `getActiveRole` from config.
    -   **Config Synchronization**: Server and Client share the exact same 10-stage `workflowConfig.js`.

### Validation
-   **Automated Verification**: We verified the delete flow, dialog appearance, and mock mode handling via browser automation.
-   **Manual Checks**: Confirmed role-gating on UI elements (btns disabled/hidden for incorrect roles).

---

## Codebase Index

### Frontend (`client/src`)
*   **Pages**
    *   [Dashboard.jsx](file:///Users/aritrosinha/code/REAgent/client/src/pages/Dashboard.jsx): Main view, lead table, and workflow visualizer.
    *   [LeadDetail.jsx](file:///Users/aritrosinha/code/REAgent/client/src/pages/LeadDetail.jsx): Detailed view with action board for checking off items and transitioning stages.
    *   [Login.jsx](file:///Users/aritrosinha/code/REAgent/client/src/pages/Login.jsx): Authentication screen with Mock Mode toggle and demo credentials.
*   **Config**
    *   `config/workflowConfig.js`: The source of truth for the 10-stage workflow, role mapping, and checklists.

### Backend (`server`)
*   **Controllers**
    *   [leadController.js](file:///Users/aritrosinha/code/REAgent/server/controllers/leadController.js): Core logic for creating, updating (transitions), and deleting leads. Implements security checks.
    *   [authController.js](file:///Users/aritrosinha/code/REAgent/server/controllers/authController.js): Handles user login and JWT generation.
*   **Models**
    *   [Lead.js](file:///Users/aritrosinha/code/REAgent/server/models/Lead.js): Database schema for Leads (including new `stage` and `sub_status` fields).
    *   [User.js](file:///Users/aritrosinha/code/REAgent/server/models/User.js): User schema with Role ENUMs.

---

## Task & To-Do List

### Consolidated Implementation Plan (Completed)
- [x] **Consolidate Workflow Logic**: Ensure 10-stage workflow is consistent across Client and Server.
- [x] **Fix Delete Flow**:
    - [x] Create `handleDelete` API endpoint.
    - [x] Add Mock Mode support in `axios.js`.
    - [x] Replace `window.confirm` with MUI `Dialog`.
- [x] **Security Hardening**:
    - [x] Add server-side role validation in `submitStepData`.
- [x] **Cleanup**: Remove unused imports and fix console errors in `Dashboard.jsx`.

### Pending / Future Improvements
- [ ] **Email Notifications**: Integrate email service for status change alerts.
- [ ] **Document Uploads**: Implement actual S3/storage integration for file uploads in checklists.
- [ ] **History / Audit Log**: Enhance the Audit Log UI to show differentials in data changes.
- [ ] **Analytics**: Add a stats page for "Time in Stage" analysis.
