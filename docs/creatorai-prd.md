# CreatorAI Product Requirements Document

## 1. Executive Summary
CreatorAI is an AI-powered creator operating platform designed for one mission: turn one source recording into many reusable content assets without destroying creator intent. The product sits between raw source media and final distribution-ready content. The MVP proves a single, reliable workflow: upload a long-form source, analyze it, identify content opportunities, generate a clip, edit the suggestion, adapt for multiple platforms, and export a final result.

The system is not a traditional AI video editor. It is a content compiler. It understands a source once, extracts meaningful moments, preserves source grounding, and generates platform-aware output that remains editable. Every generated asset must retain its relationship to the original source timestamp, transcript, and topic context.

This PRD is written for a 24-hour hackathon build and intentionally narrows scope. The team is expected to build a product that works end-to-end for one strong user flow, not a broad toolset.

## 2. Product Vision
CreatorAI’s vision is simple: give creators one operating layer for turning recordings into content assets across platforms.

Core proposition:
"One recording. An entire content pipeline."

Product principle:
"AI does the repetitive work. Creators keep the final say."

The product should feel like an editorial workspace, not a generic AI dashboard. It should help creators:
- understand what is inside a long recording
- identify moments worth reusing
- quickly generate a short-form clip
- rewrite hook and caption copy
- repurpose content for multiple platforms
- maintain a traceable connection to the source material

## 3. Problem Statement
The creator economy is fragmented. Tools are spread across scripting, recording, asset storage, editing, scheduling, and publishing. This creates:
- scattered assets
- repeated work
- context switching
- time lost searching for valuable moments
- repetitive rewriting
- inefficient production of short-form content

CreatorAI solves this by centralizing the source understanding process and making output reusable, editable, and connected to source context.

## 4. Target Users
CreatorAI targets creators and content teams who regularly turn recorded conversations, lectures, podcasts, and founder updates into more content.

### 4.1 YouTube Creators
- Goals: produce short-form clips, repurpose long-form videos, maintain consistent publishing cadence
- Workflow: record long-form video, review transcript, find strong moments, clip, post on Shorts
- Pain points: time spent manually reviewing footage, hard to find good moments, copywriting repetition
- Alternatives: CapCut, Descript, Riverside, YouTube Studio, manual editing
- Frustrations: tedious review sessions and inconsistent repurposing
- CreatorAI change: reduces manual review and creates source-connected output

### 4.2 Podcasters
- Goals: maximize value from each recording
- Workflow: record a podcast, transform into short clips, quote snippets, create promotional posts
- Pain points: editing and repurposing are repetitive and inconsistent
- Alternatives: manual clipping, transcription tools, social scheduling tools
- Frustrations: one recording gives limited output value
- CreatorAI change: lets them surface themes, hooks, and clips from each episode

### 4.3 Instagram Creators
- Goals: create Reels quickly with strong hooks and captions
- Workflow: record talking-head or tutorial content, identify key moments, iterate on captions and formats
- Pain points: turnaround time and writing copy for every post
- Alternatives: manual editing in CapCut/Reels apps, text-based prompting tools
- Frustrations: too many repetitive tasks between raw footage and polished post
- CreatorAI change: aligns every clip to hook-first content strategy

### 4.4 Educators
- Goals: convert lectures into teachable micro-lessons
- Workflow: record sessions, break into concept chunks, repurpose into shorter learning assets
- Pain points: heavy post-production and fragmented content reuse
- Alternatives: video editing and slide tools
- Frustrations: content is valuable but hard to reuse
- CreatorAI change: makes “one lecture becomes many educational assets” practical

### 4.5 Coaches
- Goals: produce insight-rich content from workshops or sessions
- Workflow: record coaching calls, extract thought leadership moments, repurpose across LinkedIn/Instagram/YT
- Pain points: turning raw advice into multiple platform-specific formats
- Alternatives: manual clipping and rewriting
- Frustrations: leader insight is lost in long recordings
- CreatorAI change: surfaces strong insights and adapts them for clarity

### 4.6 Startup Founders
- Goals: turn founder commentary into content for brand, hiring, and GTM
- Workflow: record product demos, customer calls, AMAs, and founder updates
- Pain points: too much raw footage, not enough consistent output
- Alternatives: manual editing, social media scheduling tools
- Frustrations: content strategy is reactive instead of systematic
- CreatorAI change: creates a repeatable source-to-asset pipeline from founder voice

### 4.7 Content Teams
- Goals: standardize production from source content to multi-platform output
- Workflow: review source, assign edits, adapt platform versions
- Pain points: inconsistent quality, collaboration overhead, asset fragmentation
- Alternatives: project folders, editing tools, disparate AI tools
- Frustrations: fragmented workflows and slow review loops
- CreatorAI change: centralizes source understanding and clips in one workspace

## 5. User Personas
### Persona A: Solo Creator
- Role: independent YouTuber or podcaster
- Goal: create 5–10 content assets from each recording
- Behavior: likes fast workflows and minimal friction
- Needs: simple UI, direct clip generation, quick edits

### Persona B: Growth Operator
- Role: founder or marketer with limited editing time
- Goal: convert raw content to short-form social media assets
- Behavior: wants speed and control over messaging
- Needs: quick repurposing and strong hooks

### Persona C: Team Editor
- Role: content lead or editor
- Goal: maintain quality and platform-fit while moving fast
- Behavior: reviews AI-generated suggestions and makes final editorial decisions
- Needs: traceability, timestamps, editable outputs, source-linked context

## 6. User Pain Points
- Finding valuable moments in long videos is manual and slow.
- Transcript and visual context are not kept together.
- Rewriting hooks and captions is repetitive.
- Short-form content often lacks platform awareness.
- Creators lose connection between final asset and source video.
- Tools make AI feel opaque instead of assistant-like.

## 7. Product Goals
### Primary Goal
Reduce the repetitive operational work required to transform one source recording into multiple usable content assets.

### Secondary Goals
- reduce time spent searching for clips
- reduce repetitive copywriting
- preserve context between source and generated assets
- make AI output editable
- centralize content assets
- simplify cross-platform repurposing

### Measurable MVP Targets
- user can create a project
- user can upload a source video
- analysis completes in a reasonable time
- at least 3 useful opportunities are generated
- user can open an opportunity and inspect evidence
- user can create one clip
- user can edit the generated hook/caption
- user can generate at least one platform adaptation
- export flow completes or reaches a valid status state

## 8. Non-Goals
The MVP will not attempt to solve the following:
- full professional video editing
- comprehensive social scheduling
- auto-publishing to all networks
- advanced analytics and dashboards
- multi-user collaboration
- subscription/payments workflows
- enterprise RBAC and permissions
- complex multi-agent orchestration
- high-end color grading or audio mixing

## 9. Product Principles
1. Human first, AI second.
2. AI suggests, creator decides.
3. Every asset remains grounded to source media.
4. The product should explain why a suggestion exists.
5. Important outputs are editable and reversible.
6. Simple and reliable beats broad but flaky functionality.
7. One strong workflow is better than multiple half-finished features.

## 10. Competitive/Alternative Workflow Analysis
### Common current workflow
- Record video
- Manually review transcript or raw footage
- Search for moments with a rough memory of timecodes
- Copy-paste snippets into editor
- Build first short form manually
- Re-write copy for each platform
- Save assets in scattered folders

### Product differentiation
CreatorAI is not a basic AI video editor. It creates a connected network of content assets from a single source. The source is the source of truth, and all content fragments preserve traceability to that source.

## 11. Core User Journey
### Journey Overview
Landing Page → Start with your source → Application → New Project → Upload source → Optional script/transcript → Analyze → AI processing → Content Map → Select content opportunity → Generate Clip → Creator Studio → Creator edits AI output → Repurpose → Platform adaptations → Review → Export

### Step-by-step requirements
#### 11.1 Landing Page
- User intent: understand product and start the workflow
- UI state: marketing page with primary CTA
- System behavior: route user to app or demo flow
- AI behavior: none
- Database changes: none
- Success: user enters app
- Failure: no data loss; user stays on landing page
- Next action: create project or start demo

#### 11.2 New Project
- User intent: create workspace for a source recording
- UI state: project form with name and metadata fields
- System behavior: creates empty project and project state
- AI behavior: none
- Database changes: projects row inserted
- Success: project appears in dashboard
- Failure: validation message shown
- Next action: upload project source

#### 11.3 Upload Source
- User intent: attach the recording
- UI state: drag/drop zone or file picker
- System behavior: validates file type and size, stores file in Supabase Storage
- AI behavior: none at upload stage
- Database changes: project_sources record created
- Success: file is uploaded and preview is available
- Failure: user sees clear error with retry option
- Next action: optional transcript/script upload

#### 11.4 Optional script/transcript
- User intent: provide source context for better AI grounding
- UI state: upload transcript or script file in project setup
- System behavior: parse transcripts and link to project
- AI behavior: uses transcript as grounding context for analysis
- Database changes: transcripts and segments inserted
- Success: transcript visible and aligned to video timeline
- Failure: either partial transcript is accepted or clear parsing warning appears
- Next action: begin analysis

#### 11.5 Analyze
- User intent: extract understanding of the recording
- UI state: processing overlay with states and progress update
- System behavior: triggers analysis job and updates processing state
- AI behavior: identifies topics, transcript segments, opportunities, hooks/captions, platform adaptations
- Database changes: topics, transcript_segments, opportunities, clip candidates inserted
- Success: Content Map becomes available
- Failure: user can retry or inspect partial results
- Next action: review content map

#### 11.6 Content Map
- User intent: review AI understanding of the source in context
- UI state: video panel + transcript + timeline + opportunity list
- System behavior: renders opportunities linked to timestamps and topics
- AI behavior: recommends segments with evidence
- Database changes: analysis results stored
- Success: user can select candidates and preview clips
- Failure: show “analysis unavailable” fallback
- Next action: generate clip or open studio

#### 11.7 Generate Clip
- User intent: create a short-form clip from a moment
- UI state: selected opportunity with generation controls and preview
- System behavior: creates processing job, renders output asset
- AI behavior: creates title, hook, caption, aspect ratio recommendation
- Database changes: clip_candidates, generated_assets inserted/updated
- Success: clip becomes available in studio
- Failure: show failed generation state and retry
- Next action: open Creator Studio

#### 11.8 Creator Studio
- User intent: edit AI suggestions
- UI state: preview player, timeline, hook/caption panel, controls
- System behavior: allows time adjustments, text updates, save, export
- AI behavior: supplies suggestions but is not the final authority
- Database changes: generated_assets and platform adaptations updated
- Success: saved edits persist
- Failure: show safe error state and last-saved copy
- Next action: repurpose or export

#### 11.9 Repurpose
- User intent: generate platform versions
- UI state: adaptation cards for Instagram, YouTube, LinkedIn
- System behavior: creates copy variants using the same source meaning
- AI behavior: produces platform-specific hooks and descriptions
- Database changes: platform_adaptations rows inserted
- Success: user sees multiple variants
- Failure: partial variation with retry state
- Next action: review and export

#### 11.10 Export
- User intent: save or prepare the final asset
- UI state: export modal with selected asset and output options
- System behavior: prepares render package or marks as demo-only if renderer unavailable
- AI behavior: none during export core step
- Database changes: processing_jobs and generated_assets status updated
- Success: export ready status or artifact available in demo mode
- Failure: show failed export and retry
- Next action: return to project or assets library

## 12. Information Architecture
Required routes:
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

### Route details
#### /
- purpose: marketing landing page
- target user: new visitor
- primary action: start with your source
- secondary actions: view workflow, demo access
- components: hero, navbar, feature sections, CTA
- states: default, video active, CTA hover
- data dependencies: none

#### /login
- purpose: sign in
- target user: returning creator
- primary action: sign in
- secondary actions: create demo workspace, recover access
- components: login form, demo CTA
- states: idle, loading, error
- data dependencies: auth session

#### /signup
- purpose: create account
- target user: first-time user
- primary action: sign up
- secondary actions: demo access
- components: signup form, terms, CTA
- states: idle, loading, success, error
- data dependencies: auth and profile

#### /app
- purpose: dashboard/home for workspace
- target user: active creator
- primary action: continue recent project
- secondary actions: open projects, create new project, see pipeline summary
- components: overview cards, current project, recent projects, pipeline status
- states: empty, ready, loading
- data dependencies: projects, generated assets, processing jobs

#### /app/projects
- purpose: project index
- target user: creator managing content library
- primary action: create project
- secondary actions: filter, search, delete, rename
- components: search bar, filters, project cards
- states: loading, empty, populated, selected
- data dependencies: list of projects

#### /app/projects/:projectId
- purpose: project detail view
- target user: creator working within one project
- primary action: continue analysis or open content map
- secondary actions: upload source, edit metadata, view assets
- components: project header, summary, source preview, analysis status
- states: empty, analyzing, ready, failed
- data dependencies: project, source, analysis, assets

#### /app/projects/:projectId/content-map
- purpose: primary analysis view
- target user: creator reviewing AI understanding of source
- primary action: select opportunity or generate clip
- secondary actions: preview segments, open studio, export
- components: video, transcript, timeline, opportunities, actions
- states: loading, ready, error, no-opportunity
- data dependencies: source, transcript, topics, content_opportunities, clip_candidates

#### /app/projects/:projectId/studio
- purpose: editor for generated clip
- target user: creator editing AI suggestions
- primary action: save changes or export
- secondary actions: reset, adjust timestamps, regenerate hook
- components: video preview, timeline, text editor, AI suggestions
- states: idle, syncing, saved, failed
- data dependencies: selected generated_asset and metadata

#### /app/projects/:projectId/repurpose
- purpose: platform adaptation center
- target user: creator repurposing content
- primary action: generate platform adaptions
- secondary actions: edit, regenerate, export
- components: platform cards, copy variants, preview outputs
- states: ready, generating, saved, failed
- data dependencies: generated asset, platform_adaptations

#### /app/assets
- purpose: asset library
- target user: creator searching for all generated content
- primary action: search and filter assets
- secondary actions: preview, open project, export
- components: asset grid/list, search, filters, preview modal
- states: list, empty, loading, error
- data dependencies: generated_assets, scripts, transcripts, thumbnails

#### /app/settings
- purpose: account and product settings
- target user: creator managing preferences
- primary action: update profile and preferences
- secondary actions: logout, switch demo mode
- components: profile, storage preferences, notifications
- states: default, loading, saved, error
- data dependencies: profiles, auth

## 13. Feature Overview
CreatorAI MVP includes:
- landing page with cinematic design and CTA
- auth and demo mode
- project creation and management
- upload of video + optional transcript/script
- AI analysis of source content
- Content Map with timestamped opportunities
- clip generation from source moments
- Creator Studio for editing AI suggestions
- repurposing into platform variants
- asset library and export flow
- database, storage, and processing architecture

## 14. Detailed Feature Requirements
### 14.1 Landing Page
- Must support dark cinematic aesthetic
- Must include hero message: "One recording. An entire content pipeline."
- Must include CTA: "Start with your source"
- Must include secondary CTA: "See how CreatorAI works"
- Must use full-screen background video with subtle motion and dark overlay
- Must transition into app state smoothly

### 14.2 Authentication and Demo
- User can sign up, log in, and log out
- Demo workspace is available without friction for judge demos
- Protected routes redirect unauthenticated users
- Session expiration leads to login state

### 14.3 Project Management
- User can create a project with a name and optional description
- User can rename a project
- User can archive or delete a project
- Project list supports search and status filtering
- Project cards show title, source type, creation date, status, and asset count

### 14.4 Source Upload
Supported sources:
- MP4, MOV, WebM video files
- optional transcript .txt/.vtt/.srt
- optional script .md/.txt
- optional subtitles .srt/.vtt

Requirements:
- drag/drop upload region
- client-side file validation before upload
- progress indicator
- cancel upload capability
- retry after failure
- preview after successful upload
- size limit: default 500MB for MVP, configurable by environment
- unsupported file types blocked with human-readable message

### 14.5 Analysis
- After upload, user chooses Analyze
- Analysis extracts topics, transcript segments, opportunities, hooks, captions, adaptations
- Must remain grounded to timestamps
- Must protect user trust by showing evidence excerpts and source ranges

## 15. Landing Page Requirements
### Hero layout
- full-screen dark marquee with text left and video background right or behind
- headline large and premium
- supporting copy two lines max
- CTA stack: primary and secondary

### Navigation
- brand attached to top-left
- minimal nav items: Product, Workflow, Demo, Sign in
- CTA button visible in desktop and mobile

### Video behavior
- background video loops subtly
- low opacity overlay preserves readability
- no autoplay sound
- fallback static poster if video fails

### CTA behavior
- primary CTA routes to app onboarding or demo workspace
- secondary CTA scrolls to workflow section or opens a demo modal

### Responsive behavior
- mobile stack layout with text first
- keep CTAs visible and tappable
- ensure hero remains legible in 320px width and above

### Transition into app
- user enters app as either authenticated or demo mode
- no forced login before product demo experience

## 16. Application UX Requirements
Application shell must be cinematic and functional. The design language should avoid generic dashboard stereotypes.

### Visual system
- color system: near-black background, charcoal surfaces, soft warm white text, muted bronze/gold highlights, cinematic deep blue accents
- typography: clean sans for UI, editorial serif accents only sparsely for emphasis
- spacing: 8px base grid, generous whitespace, limited card density
- glass surfaces: translucent panels with subtle blur and border
- button hierarchy: primary CTA, secondary action, ghost actions
- iconography: minimal, consistent line icons
- motion: purposeful, short, low-friction transitions
- accessibility: contrast AA+, keyboard support, focus ring

### Interaction patterns
- selection states should be obvious but not noisy
- preview and timeline actions should be immediate
- editing should feel like refinement, not full rework

## 17. Content Map Specification
The Content Map is the core product screen. It aggregates source context and AI suggestions into one decision layer.

### Required elements
- source video preview
- transcript panel with timestamps
- timeline or scrub list
- topics panel
- detected moments list
- opportunity cards with evidence
- generation controls

### Behavior
#### Click timeline segment
- selects the precise transcript or moment range
- preview player jumps to timestamp
- evidence panel updates with transcript excerpt and topic context
- if a clip is selected, the clip card becomes active

#### Select opportunity
- highlight opportunity card
- sync with timeline and video
- shows metadata such as source start/end, topic, confidence evidence, and reason
- user sees “Generate Clip” and “Open Studio” CTAs

#### Preview a moment
- player loads selected range with contextual focus
- show start/end times and snippet context
- allow replay and quick return to full source

#### Generate a clip
- creates a generated asset from selected opportunity
- display processing status and disable duplicate generation until complete
- move to Studio after success

#### Open Studio
- loads selected generated asset or last active clip in editing workspace
- preserves source link and timestamps

## 18. Creator Studio Specification
The Creator Studio is an MVP editor focused on essential review and refinement.

### Required capabilities
- video preview
- start time
- end time
- playhead
- timeline
- aspect ratio selector
- hook editing
- caption editing
- AI suggestion
- apply suggestion
- reset
- save edit
- export

### AI-controlled information
These are suggested by AI and should be explicitly labeled as suggestions:
- hook text
- title recommendation
- caption copy
- timing range suggestions
- platform-specific adaptation text

### Creator-controlled information
These are final user decisions:
- start/end trim values
- final title
- final hook
- final caption
- selected platform output
- save state
- export decision

### Editing model
- user sees suggestion and can apply or modify it
- apply suggestion updates text or trim range while preserving source relationship
- reset returns to last saved state
- save save persists edits

## 19. Repurposing Specification
### Platforms required
- Instagram Reels
- YouTube Shorts
- LinkedIn

### Per platform
- output format: vertical 9:16 for social, 16:9 optional for YouTube
- copy style: adapted to platform voice and audience expectations
- title/hook: strong opener adapted to platform tone
- caption/description: concise but platform aware
- editable content: user may revise before exporting
- regeneration behavior: user can reroll adaptation to get alternative versions

### Product behavior
The repurposing layer should preserve source meaning while changing packaging. It must never rewrite facts or the essence of the speaker’s message.

## 20. Asset Library Specification
The asset library is an index of all content outputs and source artifacts.

### Asset categories
- source videos
- generated clips
- scripts
- transcripts
- images
- audio

### Library features
- search by title, topic, source, or platform
- filters by asset type, project, and status
- grid and list mode
- preview on click
- source relationship display
- project relationship display

### Asset metadata
- title
- type
- project
- source reference
- timestamps
- status
- created date
- aspect ratio
- platform label

## 21. AI Architecture
### Goal
Use Gemini for structured understanding of a source video and transcript, not for freeform opaque decisions.

### Responsibilities
- spoken content understanding
- visual context understanding
- topic extraction
- moment identification
- short-form opportunity detection
- hook generation
- caption generation
- platform adaptation generation

### Prompting strategy
- structured prompt with source transcript and metadata
- explicit instructions for grounding and output rules
- ask for evidence: source timestamps, topic tags, transcript excerpts
- require machine-readable JSON schema

### Structured output
The AI must return structured output rather than unstructured prose. All outputs must be validated.

### Context management
- keep transcript snippets with timestamps
- attach source metadata and user project context
- limit prompt bloat by passing only relevant excerpts for a selected range

### Source grounding
The AI must explain recommendations using actual source timestamps and transcript basis. It should never invent times or claim direct evidence without transcript grounding.

### Error handling
- if transcript is missing, still analyze video context and transcript if available
- if gemini fails, return graceful error and retry queue
- if schema validation fails, retry with corrected prompt or fallback output

## 22. AI Responsibilities
Gemini is responsible for:
- transcript and topic understanding
- detection of standout moments
- candidate clip selection
- hook generation
- caption suggestion
- platform adaptation variants

Gemini is not responsible for:
- final creative approval
- final export rendering
- user decisions
- system security or RLS enforcement

## 23. AI Output Schema
### ProjectSummary
- projectId
- title
- durationSeconds
- sourceSummary
- primaryTopics
- overallNarrative
- createdAt

### Topic
- id
- projectId
- name
- description
- startTimeSeconds
- endTimeSeconds
- evidenceExcerpt

### TranscriptSegment
- id
- projectId
- startTimeSeconds
- endTimeSeconds
- speaker
- text
- confidence

### ContentOpportunity
- id
- projectId
- sourceStartSeconds
- sourceEndSeconds
- topicId
- reason
- selectionFactors
- evidenceExcerpt
- type

### ClipCandidate
- id
- projectId
- contentOpportunityId
- startTimeSeconds
- endTimeSeconds
- title
- score
- status

### Hook
- id
- clipCandidateId
- hookText
- variantType
- rationale

### Caption
- id
- clipCandidateId
- captionText
- platform
- rationale

### PlatformAdaptation
- id
- clipCandidateId
- platform
- title
- description
- hook
- caption
- tone
- sourceRelationship

### Timestamp behavior
All outputs must carry timestamp references whenever possible. If a recommendation comes from a specific segment, it must show start/end time and evidence snippet. This is required for trust and editability.

## 24. Backend Architecture
The backend should be intentionally simple for hackathon viability.

### Components
- React frontend
- Supabase for auth and database
- Supabase Storage for source and generated files
- Supabase Edge Functions as API layer
- Gemini API for analysis and generation
- Optional media processing service for render / trimming tasks

### Responsibilities
#### Synchronous operations
- create project
- upload file metadata
- fetch project, analysis, or asset state
- update clip metadata
- save edited hook/caption

#### Asynchronous jobs
- analysis job
- clip rendering job
- platform adaptation generation job
- export job

### Job states
- queued
- processing
- succeeded
- failed
- retrying

### Retry behavior
- 3 attempts for AI calls
- 2 attempts for storage/processing jobs
- surface human-readable errors after final failure

## 25. Database Schema
The MVP should use a normalized schema in Supabase/Postgres.

### profiles
Purpose: user profile metadata
Columns:
- id UUID PK
- email TEXT
- full_name TEXT
- avatar_url TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP

### projects
Purpose: top-level workspace for a creator asset pipeline
Columns:
- id UUID PK
- profile_id UUID FK -> profiles.id
- name TEXT
- description TEXT
- status TEXT
- demo_mode BOOLEAN
- created_at TIMESTAMP
- updated_at TIMESTAMP

### project_sources
Purpose: one source asset tied to a project
Columns:
- id UUID PK
- project_id UUID FK -> projects.id
- source_type TEXT
- file_name TEXT
- storage_path TEXT
- file_size BIGINT
- mime_type TEXT
- duration_seconds INT
- preview_url TEXT
- status TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP

### transcripts
Purpose: transcript record for a source
Columns:
- id UUID PK
- project_id UUID FK -> projects.id
- source_id UUID FK -> project_sources.id
- raw_text TEXT
- language TEXT
- status TEXT
- created_at TIMESTAMP

### transcript_segments
Purpose: timestamped transcript fragments
Columns:
- id UUID PK
- transcript_id UUID FK -> transcripts.id
- start_time_seconds INT
- end_time_seconds INT
- speaker TEXT
- text TEXT
- confidence NUMERIC
- created_at TIMESTAMP

### topics
Purpose: extracted themes from source
Columns:
- id UUID PK
- project_id UUID FK -> projects.id
- name TEXT
- description TEXT
- start_time_seconds INT
- end_time_seconds INT
- evidence_excerpt TEXT
- created_at TIMESTAMP

### content_opportunities
Purpose: AI-identified moments worth reusing
Columns:
- id UUID PK
- project_id UUID FK -> projects.id
- topic_id UUID FK -> topics.id
- source_start_seconds INT
- source_end_seconds INT
- reason TEXT
- selection_factors JSONB
- evidence_excerpt TEXT
- type TEXT
- created_at TIMESTAMP

### clip_candidates
Purpose: generated short-form clip candidates from opportunities
Columns:
- id UUID PK
- project_id UUID FK -> projects.id
- opportunity_id UUID FK -> content_opportunities.id
- start_time_seconds INT
- end_time_seconds INT
- title TEXT
- output_aspect_ratio TEXT
- status TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP

### generated_assets
Purpose: final generated result metadata and links
Columns:
- id UUID PK
- project_id UUID FK -> projects.id
- clip_candidate_id UUID FK -> clip_candidates.id
- asset_type TEXT
- storage_path TEXT
- thumbnail_path TEXT
- title TEXT
- hook TEXT
- caption TEXT
- aspect_ratio TEXT
- status TEXT
- source_start_seconds INT
- source_end_seconds INT
- created_at TIMESTAMP
- updated_at TIMESTAMP

### platform_adaptations
Purpose: platform-specific copy variations
Columns:
- id UUID PK
- generated_asset_id UUID FK -> generated_assets.id
- platform TEXT
- title TEXT
- hook TEXT
- caption TEXT
- description TEXT
- tone TEXT
- status TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP

### processing_jobs
Purpose: async work tracking for AI and render tasks
Columns:
- id UUID PK
- project_id UUID FK -> projects.id
- asset_id UUID NULL
- job_type TEXT
- status TEXT
- retry_count INT
- payload JSONB
- error_message TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP

### Recommended indexes
- projects(profile_id)
- project_sources(project_id)
- transcripts(project_id)
- transcript_segments(transcript_id)
- topics(project_id)
- content_opportunities(project_id)
- clip_candidates(project_id)
- generated_assets(project_id)
- platform_adaptations(generated_asset_id)
- processing_jobs(project_id, status)

## 26. Storage Architecture
### Buckets
- source-videos
- scripts
- generated-assets
- thumbnails

### Ownership
- each project’s data is owned by the project profile
- all objects are private by default
- signed URLs used when frontend previews or downloads assets

### Access
- signed URLs with short TTL for preview/download
- no arbitrary public access to user files

### File validation
- allow only approved MIME types
- prevent malicious file types
- enforce size limits

### Lifecycle
- source video persists for project lifetime
- generated assets persist until user deletes project or asset
- thumbnails generated on demand or on asset creation

## 27. API Contracts
### createProject
- endpoint: edge function createProject
- method: POST
- input: { name, description?, demoMode? }
- validation: name required, max length
- output: project object
- failure cases: invalid name, auth required
- auth: required

### uploadSource
- endpoint: edge function uploadSource
- method: POST
- input: { projectId, fileName, mimeType, size, sourceType }
- validation: type allowed, size under limit
- output: upload session and project_source metadata
- failure cases: unsupported type, storage failure, request too large
- auth: required

### analyzeProject
- endpoint: edge function analyzeProject
- method: POST
- input: { projectId, transcriptId?, sourceId }
- validation: source exists
- output: jobId and status
- failure cases: missing source, AI request failure
- auth: required

### getAnalysis
- endpoint: edge function getAnalysis
- method: GET
- input: projectId
- validation: project belongs to user
- output: analysis summary, topics, opportunities
- failure cases: job not found, job failed
- auth: required

### generateClip
- endpoint: edge function generateClip
- method: POST
- input: { projectId, opportunityId, startTime, endTime, aspectRatio }
- validation: valid opportunity and times
- output: jobId and generated_asset draft
- failure cases: invalid timestamps, render failure
- auth: required

### generateHook
- endpoint: edge function generateHook
- method: POST
- input: { clipCandidateId }
- validation: valid clip candidate
- output: hook text
- failure cases: AI failure
- auth: required

### generateCaption
- endpoint: edge function generateCaption
- method: POST
- input: { clipCandidateId, platform? }
- validation: valid clip candidate
- output: caption text
- failure cases: AI failure
- auth: required

### generatePlatformAdaptation
- endpoint: edge function generatePlatformAdaptation
- method: POST
- input: { generatedAssetId, platform }
- validation: valid asset, supported platform
- output: adaptation metadata
- failure cases: unsupported platform, AI failure
- auth: required

### updateClip
- endpoint: edge function updateClip
- method: PATCH
- input: { generatedAssetId, title?, hook?, caption?, startTime?, endTime? }
- validation: valid asset and times
- output: updated asset metadata
- failure cases: not found, write failure
- auth: required

### exportAsset
- endpoint: edge function exportAsset
- method: POST
- input: { generatedAssetId, platform, aspectRatio }
- validation: asset exists and is ready
- output: export job status
- failure cases: renderer unavailable, invalid asset state
- auth: required

## 28. Authentication
### Signup
- user enters email and password
- creates profile row
- route to app and default workspace

### Login
- existing user authenticates
- session persisted via Supabase auth
- app checks session on initial load

### Logout
- clears auth session
- redirects to login or landing page

### Session handling
- session TTL standard JWT pattern
- app refreshes session on resume
- protected routes check auth on route entry

### Demo workspace
- demo workspace available for judges without signup
- data is seeded and read-only or clearly labeled
- not used for production data

### Protected routes
- /app, /app/projects/*, /app/assets, /app/settings require auth
- unauthenticated users redirected to /login

## 29. Security
- use Supabase Row Level Security on all user-owned tables
- file uploads stored in private buckets with signed URLs only
- secrets stored in Supabase env variables and not in client code
- AI API key never exposed in frontend
- strict input validation on all API requests
- sanitize file names and metadata
- validate transcript and script parsing before storage
- backend must verify project ownership before mutation

## 30. State Management
Use a minimal but clear local state model. No large global store is necessary.

### Required state
- current project
- selected clip
- analysis state
- processing state
- editor state
- asset state
- auth state

### Recommended approach
- React state + context for auth and project selection
- local state for editing panel and selection state
- server state fetched with lightweight refresh patterns
- avoid complex Redux/Zustand unless necessary

## 31. Processing Jobs
### Job lifecycle
- queued
- processing
- ready
- failed

### Examples
- analyzeProject → processing job
- generateClip → processing job
- exportAsset → processing job

### Rules
- job status updates must be visible to user
- users can retry failed jobs
- users may not start duplicate in-progress tasks
- failure states must show actionable recovery

## 32. Error Handling
### Failed upload
- show human-readable message: “This file type isn’t supported. Try a video, transcript, or script file.”
- keep user on upload step
- allow retry

### Unsupported file
- block file before upload
- show accepted formats and size limit

### Oversized file
- show size limit and allow reselect

### Failed Gemini request
- mark project analysis failed
- show retry CTA and preserve user progress

### Failed analysis
- show partial state if available
- allow retry without re-uploading source

### Failed clip processing
- show generation failed state and retry option
- keep opportunity available

### Failed export
- show export failed and ask user to retry
- do not claim final render exists

### Expired session
- redirect to login and preserve route intent if possible

### Unavailable asset
- show placeholder and “asset not ready yet” state

### Network interruption
- show reconnecting state
- keep local unsaved content in editor draft if possible

## 33. Loading States
### Uploading source...
- user cannot start analysis until upload succeeds
- upload can be canceled

### Understanding video...
- user sees processing banner and disable repeated analyze actions

### Mapping topics...
- operation is backend-only
- user can watch progress indicator and wait

### Finding strong moments...
- user sees evidence and count of opportunities emerging

### Generating clip...
- user cannot navigate away without warning if data loss risk is high

### Preparing platform versions...
- user can still review existing data, but cannot trigger duplicate generation until complete

### Saving changes...
- small save spinner, disable repeated save request

### Exporting...
- user sees “Preparing export…” and final state after success or failure

## 34. Accessibility
- keyboard navigation across all primary actions
- visible focus rings on buttons, links, and inputs
- semantic HTML and landmark regions
- accessible labels for file inputs, playback controls, and actions
- sufficient contrast for text and interactive controls
- reduced-motion support for transitions and autoplay media
- accessible video controls with captions when available
- form validation messages announced via assistive tech

## 35. Performance
- lazy-load route-level screens once needed
- lazy-load heavy preview and media assets
- optimize thumbnails
- use lightweight video preview for timeline and source review
- cache analysis data locally when relevant
- avoid redundant recomputation when selecting opportunities
- minimize unnecessary re-renders using memoization and stable selectors

## 36. Demo Mode
### Demo Mode purpose
Demo Mode is for live product demonstration and should be fast, reliable, and consistent.

### Seeded project
Project: AI Agents Podcast
Duration: 08:42
Topics: AI Agents, Automation, Future of Work, Startups

### Seeded clip candidates
1. AI Agents Are Changing Small Teams — 02:14 to 02:49
2. The Biggest Mistake Creators Make — 04:08 to 04:42
3. Why Automation Matters — 06:21 to 06:58

### Seed data counts
- 5 hooks
- 5 captions
- 3 Instagram adaptations
- 3 YouTube adaptations
- 3 LinkedIn adaptations

### Demo behavior
- no need for real upload to show workflow
- project loads instantly for judge demo
- analysis results already available
- user can open content map and generate clip within seconds

### Difference from Live Mode
Live Mode requires real upload and AI analysis. Demo Mode uses seeded assets and precomputed suggestions to guarantee speed and reliability during a 2–3 minute showcase.

## 37. MVP Prioritization
### P0 — Must have for hackathon working MVP
- landing page
- auth/demo
- project creation
- source upload
- source preview
- Gemini analysis architecture
- content map
- timestamped opportunities
- clip generation workflow
- Creator Studio
- editable AI output
- repurposing
- export workflow
- demo project
- database
- storage
- security

### P1 — Nice to have
- richer asset library
- improved insights and metadata
- more platform variations
- stronger editing controls
- additional source formats
- better transcript alignment UX

### P2 — Future roadmap
- collaborative review
- advanced analytics
- editing timeline with multi-track support
- brand kits and templates
- scheduling and publishing integrations
- set-based content planning
- enterprise governance

## 38. Team Responsibilities
### Member 1: AI + backend
Responsible for:
- Gemini prompt design and validation
- analysis pipeline
- Edge Functions
- database schema and queries
- async job architecture
- fallback retry logic

### Member 2: Frontend + UX
Responsible for:
- landing page
- app shell
- dashboard and routes
- content map UX
- Creator Studio UX
- repurpose views
- product polish and accessibility

### Member 3: Integration + infrastructure + QA
Responsible for:
- Supabase setup
- storage and auth integration
- deployment and environment management
- QA on workflow, regression, and demo flow
- issue triage and fallback plan

## 39. 24-Hour Implementation Roadmap
### 0–2 hours
- define product flow and final MVP scope
- confirm demo narrative and judge sequence
- set up repo and project structure
- create Supabase project and storage buckets
- define core schema and tasks

Deliverables:
- product kickoff
- database scaffold
- auth setup skeleton
- agreed demo path

Dependencies:
- team alignment on scope
- environment access

Milestone:
- team is aligned on a single workflow

Fallback:
- reduce to only one platform adaptation if needed

### 2–6 hours
- build landing page and app shell
- implement auth/demo flow
- create project creation and upload UI
- add storage upload with validation

Deliverables:
- working app shell
- upload step works
- demo/project creation flow

Dependencies:
- Supabase auth and storage ready

Milestone:
- user can create project and upload source

Fallback:
- use seeded demo project to keep momentum if upload bugs occur

### 6–10 hours
- implement analysis backend and AI schema
- add mock or real Gemini analysis flow
- build Content Map UI and display topic/opportunity data

Deliverables:
- analysis pipeline
- Content Map with timeline and evidence

Dependencies:
- Gemini access and schema validation

Milestone:
- the system finds at least 3 useful moments

Fallback:
- use seeded demo results if Gemini latency or failure blocks live analysis

### 10–14 hours
- add clip generation workflow
- build Creator Studio editing UI
- save edits and apply suggestions

Deliverables:
- generated clip ready for editing
- editable AI output

Dependencies:
- successful clip generation metadata

Milestone:
- user can generate and edit a clip

Fallback:
- allow generated asset preview without full renderer if needed

### 14–18 hours
- implement repurposing workflow for platform variants
- add asset library and project detail pages
- prepare project-state actions and display statuses

Deliverables:
- platform-specific outputs
- asset browsing and state management

Dependencies:
- clip generation available

Milestone:
- user can view multiple platform adaptations

Fallback:
- limit to one social platform for MVP

### 18–21 hours
- add export flow and production QA
- verify demo flow and handle edge cases
- test auth, upload, content map, and export states

Deliverables:
- export-ready workflow
- QA passes on core journey

Dependencies:
- working generated assets and adaptation outputs

Milestone:
- one-click demo flow works reliably

Fallback:
- final export becomes demo-only status when renderer is unavailable

### 21–24 hours
- final polish
- optimize demo fidelity
- conduct judge rehearsal
- add failure mode UX polish

Deliverables:
- launchable hackathon MVP
- cleaned demo sequence
- final risk check

Dependencies:
- all prior flow milestones complete

Milestone:
- demo success readiness

Fallback:
- use seeded Demo Mode to guarantee flow even if live analysis fails

## 40. Risk Register
| Risk | Probability | Impact | Mitigation | Fallback |
|---|---|---:|---|---|
| Gemini API failure | Medium | High | Add retry and schema validation | Use Demo Mode seeded analysis |
| Video processing too slow | Medium | High | Compress preview, process async, keep UI responsive | Use precomputed demo metadata |
| Upload problems | Medium | Medium | Validate types and size, progress UI | Retry and clear error states |
| Deployment problems | Medium | High | Keep infra minimal and tested | Use local dev demo path |
| Large file problems | High | Medium | Size caps and chunking strategy | Limit to demo-ready file sizes |
| Authentication problems | Low | High | Minimal auth with Supabase defaults | Offer demo workspace fallback |
| Database problems | Low | High | Keep schema simple and normalized | Use demo mode data and simple CRUD |
| Frontend/backend integration delays | Medium | High | Define API contracts early | Keep UI on mocked or seeded data |

## 41. Acceptance Criteria
### Given a valid video is uploaded
When the user clicks Analyze
Then the project enters processing state
And the backend starts analysis
And the UI displays progress
And after successful analysis the Content Map becomes available

### Given a project has analysis data
When the user selects a moment in the timeline
Then the transcript excerpt and topic evidence are shown
And the selected time range is highlighted
And the user can preview the opportunity

### Given an opportunity is selected
When the user clicks Generate Clip
Then a processing job is created
And the system updates status to processing
And a generated asset appears after success

### Given a generated clip exists
When the user opens Creator Studio
Then the preview loads with timestamp settings
And the hook and caption are editable
And the user can apply suggestions or edit manually

### Given the user edits AI suggestions
When the user clicks Save
Then the updated metadata is persisted
And the source relationship remains intact

### Given a generated asset is ready
When the user selects a platform adaptation
Then platform-specific content is generated
And it is shown as editable text blocks

### Given export is triggered
When the renderer is available
Then the export job enters Preparing/Rendering/Ready states
And the user sees final status truthfully

### Given the renderer is unavailable in demo mode
When the user clicks export
Then the system marks export as demo-only or unavailable
And it does not claim a rendered asset was created

## 42. Success Metrics
### Demo success
- user can create a project
- user can upload a source
- analysis completes
- at least 3 useful opportunities are generated
- user can open one opportunity
- user can edit the suggested output
- user can generate platform-specific content
- user can complete export flow in a demo setting

### Product success
- project creation time under 30 seconds
- clip generation under 2–4 minutes with demo conditions
- user can generate at least one clip from one source in one session
- platform adaptation generated without manual rewriting

### Future business metrics
- repeat usage rate
- percentage of users who repurpose beyond one platform
- content output per source recording
- average time saved per project

## 43. Hackathon Demo Flow
The judge experience should be under 2–3 minutes and designed for clarity.

### Step sequence
1. Problem statement: “Creators waste too much time turning one recording into many pieces of content.”
2. Upload source or open Demo Mode project.
3. Show AI understanding: topics, transcript, content map.
4. Highlight three discovered moments.
5. Select one opportunity and generate clip.
6. Open Creator Studio and edit hook/caption quickly.
7. Generate platform adaptation for Instagram/Reels or LinkedIn.
8. Export or preview asset status.
9. End with a clear message: one recording becomes multiple outputs.

### Why each moment exists
- upload proves the source can enter the system
- AI analysis proves understanding and value extraction
- content map proves relevance and timestamp grounding
- clip generation proves execution
- Studio proves creator control
- repurposing proves platform adaptation
- export proves completion

## 44. Future Roadmap
### Short term
- more source types
- richer editing controls
- improved transcript alignment
- better multi-platform templates

### Medium term
- stronger asset library
- content planning workflows
- advanced clip ranking and selection

### Long term
- integrations with publishing tools
- team workspace collaboration
- reporting and content performance analysis
- brand kit and reusable templates

## 45. Technical Decisions
- use Supabase for auth, DB, storage, and simple APIs
- use Gemini for structured analysis and copy generation
- keep frontend simple and route-driven
- use async processing jobs for AI and rendering work
- minimize AI complexity; avoid multi-agent architecture unless necessary
- preserve source relationship metadata in every generated asset

## 46. Open Questions / Assumptions
- Is transcript generation required live, or can we support transcript upload only in MVP?
- Should clip generation include a real render step or a demo-only placeholder state?
- Is there time to support both transcript parsing and direct source analysis?
- Should export be fully rendered or just status-ready in hackathon demo mode?
- What is acceptable as the maximum file upload size for demo reliability?

## 47. Final MVP Definition
The MVP is a single-use, end-to-end content derivation workflow in which a creator uploads one source recording, reviews AI-detected moments and topics, selects an opportunity, generates a short-form clip, edits AI suggestions in Studio, creates a platform adaptation, and exports or prepares the final asset.

The system must:
- ground all suggestions to the original source
- keep human control in the final decision loop
- prioritize reliability over broad feature breadth
- be demo-safe and implementable in a 24-hour hackathon

The final product is not a “generic AI editor.” It is a source-grounded content compiler that turns one recording into a connected pipeline of reusable, editable, platform-aware assets.

---

## Implementation Notes for the Build Team
This PRD intentionally preserves one clear product workflow. The build team should not expand scope to unrelated features during the hackathon. If the team is behind schedule, cut P1 features before changing the core flow.

The most important principle for the build: every generated asset must remain tied to the original source, timestamp, and transcript evidence.
