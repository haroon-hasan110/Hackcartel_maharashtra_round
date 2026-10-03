import { PlatformAdaptation } from '../types/project';

export interface HookVariant {
  id: string;
  clipId: string;
  hook: string;
  style: 'Curiosity Gap' | 'Contrarian' | 'Direct Statement' | 'Story Opener' | 'Question';
  estimatedRetention: string;
}

export interface CaptionVariant {
  id: string;
  clipId: string;
  caption: string;
  tone: 'Professional & Tactical' | 'Direct & Punchy' | 'Founder Story' | 'Educational Breakdown' | 'Minimalist';
  hashtags: string[];
}

export const mockHooks: HookVariant[] = [
  {
    id: 'hk-1',
    clipId: 'clip-1',
    hook: 'Your next employee might be an AI agent.',
    style: 'Direct Statement',
    estimatedRetention: '94% at 3s',
  },
  {
    id: 'hk-2',
    clipId: 'clip-1',
    hook: 'Why a 3-person team can now outproduce a 50-person agency.',
    style: 'Contrarian',
    estimatedRetention: '91% at 3s',
  },
  {
    id: 'hk-3',
    clipId: 'clip-1',
    hook: 'The single shift that changed how we run our content operations.',
    style: 'Curiosity Gap',
    estimatedRetention: '88% at 3s',
  },
  {
    id: 'hk-4',
    clipId: 'clip-1',
    hook: 'Stop hiring generalists when you can orchestrate pipelines.',
    style: 'Story Opener',
    estimatedRetention: '86% at 3s',
  },
  {
    id: 'hk-5',
    clipId: 'clip-1',
    hook: 'What happens when your podcast compiles itself into 15 assets?',
    style: 'Question',
    estimatedRetention: '89% at 3s',
  },
];

export const mockCaptions: CaptionVariant[] = [
  {
    id: 'cap-1',
    clipId: 'clip-1',
    caption: 'Small teams are entering a completely new era of automation. Instead of hiring five generalists to manually slice clips and rewrite copy, you orchestrate specialized agentic pipelines that run continuously.',
    tone: 'Professional & Tactical',
    hashtags: ['#CreatorEconomy', '#AITools', '#ContentPipeline', '#Solopreneur'],
  },
  {
    id: 'cap-2',
    clipId: 'clip-1',
    caption: 'One recording. An entire content engine. If you are still manually chopping 60-minute recordings into TikToks, you are working as a compiler instead of a creator.',
    tone: 'Direct & Punchy',
    hashtags: ['#CreatorOperations', '#Automation', '#Productivity'],
  },
  {
    id: 'cap-3',
    clipId: 'clip-1',
    caption: 'Six months ago, our media workflow required 3 handoffs between transcript editors and video cutters. Today, we understand the source once and compile everything downstream.',
    tone: 'Founder Story',
    hashtags: ['#BuildInPublic', '#StartupOps', '#AIWorkflows'],
  },
  {
    id: 'cap-4',
    clipId: 'clip-1',
    caption: 'Here is the technical reality of agentic video repurposing: Every asset must maintain lineage to the exact source timestamp. AI does the extraction; you keep the final say.',
    tone: 'Educational Breakdown',
    hashtags: ['#TechStrategy', '#DigitalMedia', '#FutureOfWork'],
  },
  {
    id: 'cap-5',
    clipId: 'clip-1',
    caption: 'AI suggests. Creator decides. The golden rule for content operations in 2026.',
    tone: 'Minimalist',
    hashtags: ['#CreatorAI', '#Workflow'],
  },
];

export const mockPlatformAdaptations: PlatformAdaptation[] = [
  // Instagram variations
  {
    id: 'adapt-ig-1',
    clipId: 'clip-1',
    platform: 'instagram',
    format: '9:16 Vertical Reel',
    hook: 'Your next employee might be an AI agent.',
    body: 'Small teams are entering a completely new era of automation. Instead of spending 12 hours slicing video clips and writing post descriptions from scratch, modern creators compile entire content packages straight from one master recording.\n\nAI does the repetitive work. You keep the final say.',
    hashtags: ['#CreatorEconomy', '#AIWorkflow', '#ContentEngine', '#PodcastClips', '#ReelsTips'],
    callToAction: 'Save this reel if you record podcasts or long-form video.',
  },
  {
    id: 'adapt-ig-2',
    clipId: 'clip-2',
    platform: 'instagram',
    format: '9:16 Vertical Reel',
    hook: 'Stop making content for one platform at a time.',
    body: 'The #1 mistake creators make: spending 40 hours filming high-grade video, and then 20 minutes scrambling for captions on Twitter and LinkedIn.\n\nEvery long-form master file holds at least 10 high-value moments waiting to be compiled.',
    hashtags: ['#ContentStrategy', '#MediaProduction', '#FounderTips', '#VideoEditing'],
    callToAction: 'Drop a comment: How many hours do you spend repurposing per week?',
  },
  {
    id: 'adapt-ig-3',
    clipId: 'clip-3',
    platform: 'instagram',
    format: '9:16 Vertical Reel',
    hook: 'Automation doesn\'t replace taste. It scales it.',
    body: 'True creative leverage isn\'t about churning out generic AI spam. It is about eliminating the friction between having a breakthrough insight on mic and distributing it everywhere with surgical precision.',
    hashtags: ['#CreativeAgency', '#ScaleYourContent', '#Automation'],
    callToAction: 'Link in bio for full episode breakdown.',
  },

  // YouTube Shorts variations
  {
    id: 'adapt-yt-1',
    clipId: 'clip-1',
    platform: 'youtube',
    format: '9:16 YouTube Short',
    hook: 'How 3-Person Media Teams Outproduce 50-Person Agencies',
    title: 'AI Agents Are Changing Small Teams #Shorts',
    body: 'In this clip from AI Agents Podcast Ep. 42, we break down why agentic content pipelines allow solo creators and lean teams to distribute across 4 platforms without burnout.\n\nFull episode on the channel.',
    hashtags: ['#Shorts', '#AIAgents', '#ContentCreation', '#PodcastHighlights'],
  },
  {
    id: 'adapt-yt-2',
    clipId: 'clip-2',
    platform: 'youtube',
    format: '9:16 YouTube Short',
    hook: 'The Biggest Mistake 90% of Creators Make',
    title: 'Stop Treating Platforms Like Blank Slates #Shorts',
    body: 'Why you should never record a video without a structured compilation pipeline behind it. Full breakdown of the Content Compiler model.',
    hashtags: ['#Shorts', '#CreatorTips', '#VideoMarketing'],
  },
  {
    id: 'adapt-yt-3',
    clipId: 'clip-3',
    platform: 'youtube',
    format: '9:16 YouTube Short',
    hook: 'AI Takes the Drudgery. You Keep the Final Cut.',
    title: 'Why Automation Multiplies Creative Taste #Shorts',
    body: 'The exact methodology we use to turn 1 recording into 15 publication-ready assets in under 3 minutes.',
    hashtags: ['#Shorts', '#ProductivityHacks', '#CreatorAI'],
  },

  // LinkedIn variations
  {
    id: 'adapt-li-1',
    clipId: 'clip-1',
    platform: 'linkedin',
    format: 'High-Engagement Text & Clip Post',
    hook: 'Small teams are entering a new phase of automation.',
    body: 'The conventional agency playbook is breaking.\n\nHistorically, expanding from a weekly podcast into a daily omnichannel presence required:\n• 1 video editor for micro-cuts\n• 1 copywriter for platform adaptation\n• 1 social manager for scheduling\n\nIn our latest conversation with Elena Rostova, we discussed why agentic content orchestration compresses this into one fluid pass:\n\n1. AI analyzes the raw recording for complete thoughts and high-signal moments\n2. It extracts candidate clips with verified source timestamps (02:14 → 02:49)\n3. It synthesizes platform-native drafts grounded in the transcript\n4. The creator reviews, adjusts editorial tone, and approves with one click\n\nAI takes care of the repetitive extraction.\nYou keep the final editorial say.\n\nHow is your team modernizing content production this quarter?',
    callToAction: 'Watch the 35s excerpt below.',
  },
  {
    id: 'adapt-li-2',
    clipId: 'clip-2',
    platform: 'linkedin',
    format: 'High-Engagement Text Post',
    hook: 'The single biggest mistake founders make with video content:',
    body: 'Treating distribution as an afterthought rather than a compiler problem.\n\nYou spend 40 hours planning, setting up microphones, and interviewing an industry titan.\n\nThen, when the master file renders, you spend 15 exhausted minutes drafting one tweet and hope the algorithm smiles upon you.\n\nEvery master recording is an unindexed database of insights. If you index the source accurately, one 30-minute conversation yields 10 modular assets with zero context drift.',
    callToAction: 'What does your team\'s repurposing pipeline look like?',
  },
  {
    id: 'adapt-li-3',
    clipId: 'clip-3',
    platform: 'linkedin',
    format: 'Framework & Takeaway Post',
    hook: 'Automation doesn\'t replace human taste. It removes production tax.',
    body: 'There is a false dichotomy in media production today: either you manually edit everything by hand and burn out, or you surrender to ungrounded generic AI slop.\n\nA third architecture is winning: Content Compilers.\n\n• The source of truth remains 100% human thought and genuine conversation\n• The machine handles transcription, boundary detection, and syntax formatting\n• The human editor applies final discernment\n\nThis is how modern creative leverage is built.',
    callToAction: 'Thoughts on the human-in-the-loop compiler model?',
  },
];
