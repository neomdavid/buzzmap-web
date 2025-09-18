## Admin Mapping: Grouped Reports Integration, Cluster Visuals, UX Polish, and Legends

### Overview

This document describes the updates made to the admin mapping experience, including switching to the grouped reports API, improving cluster/marker visuals, polishing the cluster details workflow, fixing routing, and adding appropriate legends.

### Data & Integration

- Use grouped endpoint for mapping data: `GET reports/grouped`
- Add RTK Query endpoint `getGroupedReports` and hook `useGetGroupedReportsQuery`
- Rendering behavior:
  - Individual markers come from `individual_reports`
  - Cluster member markers come from `clusters[].reports`

### Marker and Cluster Visuals

- Individual report markers are always visible at all zoom levels
- Cluster member markers are violet; pending status shows a small orange dot on the pin
- Cluster areas are circles:
  - Green border when resolved
  - Red border when unresolved
  - Circle center is computed from member coordinates when not provided by backend

### Map Legend Additions (Admin Mapping)

Legend now includes items for the new visuals under Breeding Sites:

- Violet Cluster Member Marker
- Orange Pending Status Indicator (small dot)
- Cluster Area — Unchecked (red border-only swatch)
- Cluster Area — Resolved (green border-only swatch)

### UX Improvements

- Hide Breeding Sites toggle now hides both individual markers and cluster circles
- ClusterDetailsModal:
  - When only one report remains, display a neutral notice: “This cluster now contains only one report and is no longer considered a cluster. No further actions are available here.”
  - Disable action buttons in this state and remove the confusing single-report Remove button
  - After removing or resolving, refetch clustered/individual data to keep the admin map in sync

### Routing Fix

- InfoWindow “View Details” button now navigates to the admin path `/admin/mapping/<id>`
- Includes a robust base URL fallback:
  - Prefer provided `baseUrl` prop
  - Otherwise derive from current path (`/admin/mapping` vs `/mapping`)

### Cluster Dropdown Polish

- Remove megaphone icon
- Use a neutral button (white background, primary text, gray border) when there are no active clusters
- Keep red styling only when active clusters exist

### Rationale

These changes remove ambiguity between cluster and individual markers by using the backend’s grouped source of truth, improve readability with clear color semantics and legends, prevent invalid actions when a cluster is too small, and fix admin navigation.

### Testing Guidelines

1. Admin Mapping (/admin/denguemapping)
   - Verify individual markers (orange) are visible at all zooms
   - Confirm violet cluster member markers and orange pending dots
   - Confirm cluster circles: red border (unchecked) vs green border (resolved)
   - Toggle Hide Breeding Sites; both markers and circles should hide/show
2. ClusterDetailsModal
   - Remove reports until one remains: neutral notice shown, actions disabled, no extra remove button
   - After resolve/remove, confirm the map refreshes
3. InfoWindow
   - View Details routes to `/admin/mapping/<id>`
4. ClusterDropdown
   - No active clusters: neutral button
   - Active clusters: red styling

### Notes

- Backend grouped route reference: `reports/grouped` with arrays `individual_reports` and `clusters`
- No migrations or environment changes are required
