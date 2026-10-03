export type SegmentType = 'hook' | 'insight' | 'story' | 'takeaway' | 'statement';

export interface TimelineSegment {
  id: string;
  type: SegmentType;
  label: string;
  startTime: number; // seconds
  endTime: number; // seconds
  summary: string;
}

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  speaker: string;
  text: string;
}

export interface Topic {
  id: string;
  name: string;
  relevance: number;
  segmentCount: number;
  timeRange: string;
}

export interface ClipCandidate {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  topic: string;
  score: number;
  selectionFactors: string[];
  transcriptExcerpt: string;
  hook: string;
  caption: string;
  status: 'idle' | 'generating' | 'generated';
  aspectRatio: '9:16' | '16:9' | '1:1';
  durationSeconds: number;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface PlatformAdaptation {
  id: string;
  clipId: string;
  platform: 'instagram' | 'youtube' | 'linkedin' | 'x';
  format: string; // e.g. '9:16 Vertical Video'
  hook: string;
  title?: string;
  body: string;
  hashtags?: string[];
  callToAction?: string;
}

export interface GeneratedAsset {
  id: string;
  title: string;
  filename: string;
  assetType: 'video' | 'image' | 'audio' | 'script' | 'clip';
  format: string;
  size: string;
  duration?: string;
  sourceProjectId: string;
  sourceProjectTitle: string;
  sourceTimeRange: string;
  createdAt: string;
  thumbnailUrl?: string;
}

export interface ContentAnalysis {
  id: string;
  projectId: string;
  sourceVideoName: string;
  durationSeconds: number;
  topics: Topic[];
  timelineSegments: TimelineSegment[];
  clipOpportunities: ClipCandidate[];
  transcripts: TranscriptSegment[];
  insights: {
    primaryTopic: string;
    highPotentialClipsCount: number;
    peakOpportunityRange: string;
    totalReusableAssets: number;
    summary: string;
  };
}

export interface SourceVideo {
  filename: string;
  duration: number; // seconds
  sizeFormatted: string;
  aspectRatio: string;
  localFile?: File;
  objectUrl?: string;
  thumbnailUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  contentType: 'podcast' | 'interview' | 'tutorial' | 'talking_head' | 'educational' | 'other';
  status: 'draft' | 'processing' | 'analyzed' | 'completed';
  createdAt: string;
  updatedAt: string;
  sourceVideo: SourceVideo;
  scriptText?: string;
  analysis?: ContentAnalysis;
  generatedClipsCount: number;
  totalAssetsCount: number;
  thumbnailUrl: string;
}
