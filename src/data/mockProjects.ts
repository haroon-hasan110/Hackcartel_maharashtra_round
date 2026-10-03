import { Project } from '../types/project';
import { mockAiAgentsAnalysis } from './mockAnalysis';

export const mockProjects: Project[] = [
  {
    id: 'proj-ai-agents',
    title: 'AI Agents Podcast',
    contentType: 'podcast',
    status: 'analyzed',
    createdAt: 'Today, 10:20 AM',
    updatedAt: 'Just now',
    sourceVideo: {
      filename: 'ai_agents_podcast_master_ep42.mp4',
      duration: 522, // 8:42
      sizeFormatted: '1.42 GB',
      aspectRatio: '16:9',
      thumbnailUrl: '/src/assets/images/thumb_ai_agents_1791027508742.jpg',
    },
    scriptText: `[Alex]: Welcome back to episode 42. Today we are diving into autonomous workflows and small team leverage.
[Elena]: Small teams are entering a completely different operating reality. Instead of hiring five generalists, you orchestrate specialized agentic pipelines that run continuously without losing context.
[Alex]: Exactly. The biggest mistake creators make is treating every platform like a blank slate.
[Elena]: Automation isn't about removing human taste. It's about eliminating the friction between having an insight and putting it into the hands of your audience.`,
    analysis: mockAiAgentsAnalysis,
    generatedClipsCount: 3,
    totalAssetsCount: 11,
    thumbnailUrl: '/src/assets/images/thumb_ai_agents_1791027508742.jpg',
  },
  {
    id: 'proj-build-public',
    title: 'Build in Public — Episode 07',
    contentType: 'tutorial',
    status: 'analyzed',
    createdAt: 'Yesterday, 4:10 PM',
    updatedAt: 'Yesterday, 5:40 PM',
    sourceVideo: {
      filename: 'bip_ep07_screen_camera_sync.mp4',
      duration: 866, // 14:26
      sizeFormatted: '2.18 GB',
      aspectRatio: '16:9',
      thumbnailUrl: '/src/assets/images/thumb_build_public_1791027529197.jpg',
    },
    generatedClipsCount: 5,
    totalAssetsCount: 16,
    thumbnailUrl: '/src/assets/images/thumb_build_public_1791027529197.jpg',
  },
  {
    id: 'proj-startup-lessons',
    title: 'Startup Lessons',
    contentType: 'interview',
    status: 'analyzed',
    createdAt: 'Oct 1, 2026',
    updatedAt: 'Oct 1, 2026',
    sourceVideo: {
      filename: 'startup_lessons_raw_interview.mov',
      duration: 378, // 6:18
      sizeFormatted: '980 MB',
      aspectRatio: '16:9',
      thumbnailUrl: '/src/assets/images/thumb_startup_lessons_1791027549418.jpg',
    },
    generatedClipsCount: 2,
    totalAssetsCount: 7,
    thumbnailUrl: '/src/assets/images/thumb_startup_lessons_1791027549418.jpg',
  },
];
