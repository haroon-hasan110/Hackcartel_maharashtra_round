# CreatorAI Implementation Plan

## 1. Objective
Build a reliable 24-hour MVP for CreatorAI that proves the core workflow:
Source recording → analysis → content map → clip generation → studio edit → repurpose → export.

The goal is not to build every feature. The goal is to ship one strong end-to-end demo that works consistently.

## 2. Product Constraints
- 3 developers
- 24-hour limit
- must prioritize P0
- demo mode allowed for judge reliability
- must keep source-grounded reasoning transparent
- no broad platform feature creep

## 3. MVP Definition
The MVP includes:
- landing page
- auth or demo access
- project creation
- source upload
- AI analysis
- Content Map
- clip generation workflow
- Creator Studio
- repurposing
- export status flow
- demo project seed

## 4. Recommended Scope Split
### Member 1: AI + backend
- Gemini integration
- prompt schema
- analysis job flow
- Edge Functions
- processing job status
- database schema
- error handling

### Member 2: Frontend + UX
- landing page
- app shell
- Content Map screen
- Creator Studio
- repurpose screen
- asset library
- responsive UX polish

### Member 3: Integration + infra + QA
- Supabase setup
- auth and storage
- deployment
- environment config
- QA and demo rehearsal
- issue triage

## 5. Step-by-step Execution Plan
### Phase 1: Foundation (0–2 hours)
Goal: align scope and set up project skeleton.

Tasks:
- finalize product flow and judge demo path
- define database tables and required fields
- create Supabase project and buckets
- configure auth and environment variables
- set up repo structure and route skeleton

Output:
- working app shell and environment ready
- shared assumption document

Fallback:
- if auth or Supabase is delayed, use demo mode as the default route for the first version of the app

### Phase 2: App shell + upload (2–6 hours)
Goal: make the user journey start successfully.

Tasks:
- landing page
- auth/login screens
- project creation flow
- upload UI with validation
- preview and metadata persistence

Output:
- user can create project and upload video

Fallback:
- if upload takes too long, use seeded demo project as the primary path for the demo

### Phase 3: AI analysis + content map (6–10 hours)
Goal: prove the product can understand source content.

Tasks:
- trigger analysis job
- fetch transcript and topics
- map opportunities to timestamps
- render content map and selection evidence
- ensure output schema is validated

Output:
- at least 3 content opportunities visible

Fallback:
- if Gemini is unstable, pre-seed demo data and build the UI around that contract

### Phase 4: Clip generation + studio editing (10–14 hours)
Goal: create an editable final output.

Tasks:
- generate clip from selected opportunity
- display clip status states
- build editing panel for hook/caption/timing
- save and reset editing logic

Output:
- user can generate and edit one clip

Fallback:
- if render is slow or unreliable, present a “clip draft ready for review” state instead of claiming a final render

### Phase 5: Repurpose + asset library (14–18 hours)
Goal: show platform adaptations and asset organization.

Tasks:
- build platform variation generation
- create asset library views
- connect assets to source and project
- show source traceability

Output:
- user can see multiple versions of the same asset

Fallback:
- limit to one platform variant for the demo if needed

### Phase 6: Export + QA (18–21 hours)
Goal: finish the core loop and ensure reliability.

Tasks:
- export flow UI and status states
- handle failed export cases
- run core journey QA
- fix bugs in upload, analysis, and generation path

Output:
- end-to-end flow works on seeded or live demo

Fallback:
- if export renderer fails, mark status as “demo-only unavailable” and keep the flow honest

### Phase 7: Final polish + rehearsal (21–24 hours)
Goal: deliver a confident hackathon demo.

Tasks:
- polish landing page and app shell
- tighten copy and content map flow
- rehearse 2–3 minute demo
- ensure no dead-end states

Output:
- reliable judge-ready presentation

Fallback:
- keep one-click seeded demo route as backup for the final pitch

## 6. P0/P1/P2 Focus
### P0 Must-have
- landing page
- auth/demo entry
- project creation
- upload
- content map
- analysis pipeline
- clip generation
- Creator Studio
- repurposing
- export flow
- database and storage
- basic security

### P1 Nice-to-have
- richer asset browser
- more platform versions
- better transcript UX
- more editing controls

### P2 Future
- scheduling and publishing
- collaboration
- analytics
- advanced editing suite

## 7. Risk Plan
### 1. Gemini failure
Probability: Medium
Impact: High
Mitigation: retry logic and schema validation
Fallback: use demo-mode seeded output

### 2. Video processing slow
Probability: Medium
Impact: High
Mitigation: async jobs and lightweight preview
Fallback: keep rendered preview placeholder

### 3. Upload issues
Probability: Medium
Impact: Medium
Mitigation: strict validation and progress UI
Fallback: demo-mode route

### 4. Deployment breakage
Probability: Medium
Impact: High
Mitigation: simple architecture and early smoke tests
Fallback: keep local dev path ready

### 5. Large file handling
Probability: High
Impact: Medium
Mitigation: size caps and file type validation
Fallback: restrict demo inputs to manageable file sizes

### 6. Auth issues
Probability: Low
Impact: High
Mitigation: demo workspace default and simple auth flow
Fallback: allow judge access without full signup

## 8. Success Criteria
The implementation is successful when:
- a user can create a project
- a user can upload a video
- the product shows at least 3 moments or opportunities
- the user can generate a clip
- the user can edit hook or caption in Studio
- the user can create a platform adaptation
- the flow works in demo mode and live mode as much as possible

## 9. Demo Script Recommendation
Use this flow in the final presentation:
1. Open app
2. Create project
3. Upload or load demo podcast
4. Show analysis and topics
5. Select moment
6. Generate clip
7. Edit AI suggestion
8. Generate Instagram/YouTube adaptation
9. Show export status

This is the minimum credible proof that the product works.

## 10. Final Execution Principle
If time slips, do not expand the feature set. Protect the core demo agenda:
- upload
- understand
- find moments
- generate clip
- edit
- repurpose
- export

That is the product.
