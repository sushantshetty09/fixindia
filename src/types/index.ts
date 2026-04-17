export type IssueStatus = 'open' | 'resolved' | 'pending_verification';
export type IssueCategory = 'Pothole' | 'Broken Footpath' | 'Drainage' | 'Streetlight' | 'Other' | string;
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface NewsArticle {
  id: string;
  source: string;
  title: string;
  url: string;
  date: string;
  snippet?: string;
  isTragic?: boolean; // Flag to indicate severe consequences like accidents
}

export interface Issue {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  category: IssueCategory;
  status: IssueStatus;
  severity: IssueSeverity;
  agency: string;
  ward: string;
  mla: string;
  sanctionedBudget: string;
  upvotes: number;
  verificationCount?: number;
  customCategory?: string;
  isMine?: boolean;
  timestamp: string;
  newsContext?: NewsArticle[];
  zone?: string;
  parliament?: string;
  mp?: string;
  imageUrl?: string;
}

export interface UserStats {
  id: string;
  name: string;
  jobTitle?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  reportsPublished: number;
  reportsVerified: number;
  integrationsHelped: number;
  civicSenseScore: number;
  rank: number;
}

export interface MlaStats {
  id: string;
  name: string;
  ward: string;
  unresolvedCount: number;
  rank: number;
}
