import { ContentAnalysis, TimelineSegment, Topic, ClipCandidate, TranscriptSegment } from '../types/project';

export const mockAiAgentsTimeline: TimelineSegment[] = [
  {
    id: 'seg-1',
    type: 'hook',
    label: 'Cold Open & Framing',
    startTime: 0,
    endTime: 45,
    summary: 'The collapse of team overhead in modern digital media',
  },
  {
    id: 'seg-2',
    type: 'insight',
    label: 'Agent Architecture in Practice',
    startTime: 46,
    endTime: 133,
    summary: 'How founders transition from manual execution to orchestration',
  },
  {
    id: 'seg-3',
    type: 'strong_statement' as any,
    label: 'AI Agents & Small Teams',
    startTime: 134, // 02:14
    endTime: 169, // 02:49
    summary: 'Why 3-person companies can now compete with 50-person agencies',
  },
  {
    id: 'seg-4',
    type: 'story',
    label: 'Case Study: 10x Repurposing',
    startTime: 170,
    endTime: 247,
    summary: 'Real walkthrough of a technical workflow transforming one master file',
  },
  {
    id: 'seg-5',
    type: 'insight',
    label: 'The Distribution Trap',
    startTime: 248, // 04:08
    endTime: 282, // 04:42
    summary: 'The single biggest mistake creators make with long-form media',
  },
  {
    id: 'seg-6',
    type: 'story',
    label: 'Operational Bottlenecks',
    startTime: 283,
    endTime: 380,
    summary: 'Analyzing why 80% of video editors spend time on transcript extraction',
  },
  {
    id: 'seg-7',
    type: 'takeaway',
    label: 'Why Automation Matters',
    startTime: 381, // 06:21
    endTime: 418, // 06:58
    summary: 'Preserving human taste while automating repetitive assembly',
  },
  {
    id: 'seg-8',
    type: 'statement',
    label: 'The Next Creator Decade',
    startTime: 419,
    endTime: 522, // 08:42
    summary: 'Final thoughts and operational principles for the autonomous studio',
  },
];

export const mockAiAgentsTopics: Topic[] = [
  {
    id: 'top-1',
    name: 'AI Agents',
    relevance: 96,
    segmentCount: 4,
    timeRange: '01:15 – 03:40',
  },
  {
    id: 'top-2',
    name: 'Automation',
    relevance: 89,
    segmentCount: 3,
    timeRange: '05:40 – 07:10',
  },
  {
    id: 'top-3',
    name: 'Future of Work',
    relevance: 84,
    segmentCount: 2,
    timeRange: '00:30 – 02:10',
  },
  {
    id: 'top-4',
    name: 'Startups',
    relevance: 81,
    segmentCount: 3,
    timeRange: '03:50 – 05:15',
  },
];

export const mockAiAgentsClips: ClipCandidate[] = [
  {
    id: 'clip-1',
    title: 'AI agents are changing small teams',
    startTime: 134, // 02:14
    endTime: 169, // 02:49
    topic: 'AI Agents',
    score: 92,
    selectionFactors: [
      'Complete thought',
      'Strong opening',
      'High topical relevance',
      'Low context dependency',
    ],
    transcriptExcerpt:
      'Small teams are entering a completely different operating reality. Instead of hiring five generalists, you orchestrate specialized agentic pipelines that run continuously without losing context.',
    hook: 'Your next employee might be an AI agent.',
    caption:
      'AI agents are changing how small teams operate. One person can now run the output of an entire production department.',
    status: 'generated',
    aspectRatio: '9:16',
    durationSeconds: 35,
    videoUrl: '',
    thumbnailUrl: '/src/assets/images/thumb_ai_agents_1791027508742.jpg',
  },
  {
    id: 'clip-2',
    title: 'The biggest mistake creators make',
    startTime: 248, // 04:08
    endTime: 282, // 04:42
    topic: 'Startups',
    score: 88,
    selectionFactors: [
      'Contrarian viewpoint',
      'High emotional resonance',
      'Direct problem identification',
      'Sharable thesis',
    ],
    transcriptExcerpt:
      'The single biggest mistake is treating every platform like a blank slate. You spend 40 hours shooting a podcast and then 20 minutes scrambling for a tweet. Content needs to compile from one core source.',
    hook: 'Stop making content for one platform at a time.',
    caption:
      'Creators spend 40 hours filming and 20 minutes scrambling for distribution. Turn one master recording into an entire structured pipeline.',
    status: 'idle',
    aspectRatio: '9:16',
    durationSeconds: 34,
    videoUrl: '',
    thumbnailUrl: '/src/assets/images/thumb_startup_lessons_1791027549418.jpg',
  },
  {
    id: 'clip-3',
    title: 'Why automation matters',
    startTime: 381, // 06:21
    endTime: 418, // 06:58
    topic: 'Automation',
    score: 89,
    selectionFactors: [
      'Actionable takeaway',
      'Clear thesis statement',
      'Clean soundbite boundary',
      'Zero rambling phrasing',
    ],
    transcriptExcerpt:
      'Automation isn\'t about removing human taste. It\'s about eliminating the friction between having an insight and putting it into the hands of your audience. AI does repetitive extraction, you keep final say.',
    hook: 'Automation doesn\'t replace taste. It scales it.',
    caption:
      'AI takes care of the repetitive extraction. You keep the final editorial say. The future of creative leverage is compiling from source.',
    status: 'idle',
    aspectRatio: '9:16',
    durationSeconds: 37,
    videoUrl: '',
    thumbnailUrl: '/src/assets/images/thumb_build_public_1791027529197.jpg',
  },
];

export const mockAiAgentsTranscripts: TranscriptSegment[] = [
  {
    id: 'tr-1',
    startTime: 130,
    endTime: 134,
    speaker: 'Alex (Host)',
    text: 'Let\'s talk about how the leverage curve actually shifts when autonomous tools mature.',
  },
  {
    id: 'tr-2',
    startTime: 134,
    endTime: 145,
    speaker: 'Elena (Guest)',
    text: 'Small teams are entering a completely different operating reality.',
  },
  {
    id: 'tr-3',
    startTime: 145,
    endTime: 156,
    speaker: 'Elena (Guest)',
    text: 'Instead of hiring five generalists to manually slice clips and rewrite copy, you orchestrate specialized agentic pipelines.',
  },
  {
    id: 'tr-4',
    startTime: 156,
    endTime: 169,
    speaker: 'Elena (Guest)',
    text: 'They run continuously without losing context, grounding every platform asset directly in the original speech.',
  },
  {
    id: 'tr-5',
    startTime: 170,
    endTime: 178,
    speaker: 'Alex (Host)',
    text: 'And that is the distinction between random AI hallucination and actual structured content compilation.',
  },
];

export const mockAiAgentsAnalysis: ContentAnalysis = {
  id: 'analysis-ai-agents',
  projectId: 'proj-ai-agents',
  sourceVideoName: 'ai_agents_podcast_master_ep42.mp4',
  durationSeconds: 522, // 08:42
  topics: mockAiAgentsTopics,
  timelineSegments: mockAiAgentsTimeline,
  clipOpportunities: mockAiAgentsClips,
  transcripts: mockAiAgentsTranscripts,
  insights: {
    primaryTopic: 'AI Agents',
    highPotentialClipsCount: 3,
    peakOpportunityRange: '02:14 – 06:58',
    totalReusableAssets: 11,
    summary:
      'High conversational density with clear thesis statements throughout the 2–7 minute window. Excellent hook potential for short-form video compilation.',
  },
};
