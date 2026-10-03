# Step 3: Frontend Architecture & Screen Breakdown

## Objective
This step defines the UI structure and user flows for CreatorAI so the frontend team can build the product without ambiguity.

## Product Principle
AI suggests. Creator decides.

## Primary UX Rule
The app must feel cinematic and functional, not like a generic SaaS dashboard.

## Required Routes
- /
- /login
- /signup
- /app
- /app/projects
- /app/projects/:projectId
- /app/projects/:projectId/content-map
- /app/projects/:projectId/studio
- /app/projects/:projectId/repurpose
- /app/assets
- /app/settings

## App Shell
### Sidebar
- CreatorAI
- Creator OS
- Home
- Projects
- Content Map
- Creator Studio
- Repurpose
- Assets
- Settings

### Top bar
- current project name
- duration
- sync status
- export button
- notifications
- avatar

## Screen 1: Landing Page
### Purpose
Convert visitors into app users.

### Required content
- dark cinematic hero
- headline: “One recording. An entire content pipeline.”
- supporting copy
- primary CTA: “Start with your source”
- secondary CTA: “See how CreatorAI works”
- background looping video
- premium minimal nav

### Behavior
- CTA routes to app or demo workflow
- secondary CTA scrolls to process section
- fallback still image if video fails
- mobile-friendly stacked layout

## Screen 2: Auth Screens
### /login
- email/password form
- demo access option
- error state for invalid credentials
- session persistence

### /signup
- email, name, password
- confirm role or creator persona optional
- submit and redirect to app

## Screen 3: Dashboard (/app)
### Purpose
Answer:
- What am I working on?
- What is ready?
- What should I do next?

### Content blocks
- active project card
- recent projects list
- pipeline status summary
- continue project CTA
- generated asset summary

### Primary actions
- continue latest project
- open project detail
- create new project

## Screen 4: Projects List (/app/projects)
### Purpose
Project management and library browsing.

### Required UI
- search bar
- sort/filter controls
- project cards
- create project button
- empty state

### Project card data
- name
- updated time
- asset count
- source type
- status
- demo/live badge

## Screen 5: Project Detail (/app/projects/:projectId)
### Purpose
Project-level hub.

### Required sections
- project header
- source media preview
- analysis status
- recent content map events
- clip cards
- asset counts
- action buttons

### Primary actions
- upload source
- analyze project
- open content map
- open studio
- open repurpose

## Screen 6: Content Map (/app/projects/:projectId/content-map)
### Purpose
This is the core product screen.

### Required layout
- left: source video + controls
- center: transcript/timeline
- right: topics + opportunities panel

### Must-have elements
- source preview
- transcript with timestamps
- detected topics
- content opportunities list
- evidence snippets
- generation controls

### Interaction rules
- click segment → video jumps to timestamp
- select opportunity → highlight and show evidence
- preview moment → show source range
- generate clip → create processing state
- open studio → send user to editing area

## Screen 7: Creator Studio (/app/projects/:projectId/studio)
### Purpose
Review and edit the generated clip.

### Required UI
- player panel
- trim controls for start/end
- playhead/timecode controls
- aspect ratio selector
- hook editor
- caption editor
- AI suggestion panel
- action bar: apply suggestion, reset, save, export

### Interaction rules
- AI suggestion is labeled as suggestion
- creator edits final copy and ranges
- save persists the current draft
- reset reverts to last saved state

## Screen 8: Repurpose (/app/projects/:projectId/repurpose)
### Purpose
Generate platform-ready variants from one source asset.

### Platform cards
- Instagram Reels
- YouTube Shorts
- LinkedIn

### Required content per card
- title
- hook
- caption/description
- recommended format
- editable text blocks
- regenerate option

## Screen 9: Asset Library (/app/assets)
### Purpose
Search and manage all generated + source assets.

### Required features
- grid/list view toggle
- search and filters
- asset cards with preview
- project matching
- source relationship display
- status label

## Screen 10: Settings (/app/settings)
### Purpose
Account and preference management.

### Required items
- profile info
- notifications
- project preferences
- logout
- demo mode toggle

## State Handling Rules
- loading state before analysis completes
- empty state when no project exists
- failed state when upload or AI call fails
- success state when asset is generated
- unsaved edit state inside Studio

## Visual System Rules
- dark cinematic palette
- content first, metadata last
- subtle glass surfaces
- low-noise UI
- strong contrast and readable type
- soft motion only

## Frontend Implementation Priorities
### P0 UI
- landing page
- project creation
- upload form
- content map
- studio
- repurpose
- export status

### P1 UI
- richer asset browser
- better project detail polish
- more filtering and sorting

### P2 UI
- collaboration views
- analytics screens
- advanced planning modules

## Success Criteria for This Step
- user can move from landing page to app flow without confusion
- project life cycle is obvious
- source → analysis → opportunity → clip → repurpose flow is visible end-to-end
- all route states are clearly designed and testable

## Important Note
This step is about UI structure and user flow clarity. Do not overbuild. The app must stay simple enough to finish in a 24-hour hackathon.
