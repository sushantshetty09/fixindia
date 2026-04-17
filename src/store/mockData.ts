import type { Issue, MlaStats, UserStats, NewsArticle } from '../types';

export const mockTrendingNews: NewsArticle[] = [
  {
    id: 'news-1',
    source: 'The Hindu',
    title: 'BBMP Faces Scrutiny Over Remaining 1,263 Potholes in Bengaluru',
    url: '#',
    date: '3 hours ago',
    snippet: 'Official data shows 39,887 potholes filled, yet citizens face immense danger on untreated stretches in Choodasandra and Yeshwanthpur.',
    isTragic: false
  },
  {
    id: 'news-2',
    source: 'Deccan Herald',
    title: 'Industry Leaders Warn Congestion and Bad Roads Sabotage Tech Expansion',
    url: '#',
    date: '5 hours ago',
    snippet: 'Corporate chiefs cite extreme congestion and unscientific infrastructure execution as critical governance failures driving talent away.',
    isTragic: true
  },
  {
    id: 'news-3',
    source: 'India Times',
    title: 'New Civic Budget Focuses on Porous Footpaths for Groundwater Recharge',
    url: '#',
    date: '1 day ago',
    snippet: 'Shifting from temporary fixes, the new budget allocates ₹100 crore toward structural resilience and flood-prevention strategies for the upcoming monsoon.',
    isTragic: false
  },
  {
    id: 'news-4',
    source: 'Urban Acres',
    title: 'Rs 100 Crore Spent Daily, Yet Zero Relief on Bannerghatta Road',
    url: '#',
    date: '2 days ago',
    snippet: 'Experts highlight chronic lack of integration between BWSSB, BESCOM, and BBMP as the root cause of repeated road digging.',
    isTragic: true
  }
];

export const mockIssues: Issue[] = [
  {
    id: 'issue-1',
    longitude: 77.5946,
    latitude: 12.9716,
    title: 'Massive Crater near Metro',
    category: 'Pothole',
    status: 'open',
    severity: 'critical',
    agency: 'BBMP Major Roads',
    ward: 'Ward 76 - Richmond Town',
    mla: 'N.A. Haris',
    sanctionedBudget: '₹1.5 Crores',
    upvotes: 245,
    isMine: true,
    timestamp: '2 hours ago',
    newsContext: [
      {
        id: 'cxt-1',
        source: 'The Hans India',
        title: 'Horror on Outer Ring Road: Auto Rickshaw Overturns in Unmarked Trench',
        date: '3 hours ago',
        url: '#',
        snippet: 'A massive undocumented crater was left completely exposed leading to a severe collision. Citizens blame extreme civic apathy.',
        isTragic: true
      }
    ]
  },
  {
    id: 'issue-2',
    longitude: 77.6146,
    latitude: 12.9316,
    title: 'Shattered Pedestrian Walkway',
    category: 'Broken Footpath',
    status: 'open',
    severity: 'high',
    agency: 'BBMP Ward Level',
    ward: 'Ward 147 - Koramangala',
    mla: 'Ramalinga Reddy',
    sanctionedBudget: '₹4 Crores',
    upvotes: 180,
    timestamp: '5 hours ago',
    newsContext: [
      {
        id: 'cxt-3',
        source: 'News Minute',
        title: 'Senior Citizen Suffers Deep Lacerations After Walkway Collapse',
        date: '4 hours ago',
        url: '#',
        snippet: 'A 68-year-old resident fell into an exposed drain cavity on the pedestrian walkway in Koramangala. Residents protest inaction.',
        isTragic: true
      }
    ]
  },
  {
    id: 'issue-3',
    longitude: 77.6446,
    latitude: 12.9816,
    title: 'Overflowing Sewage',
    category: 'Drainage',
    status: 'resolved',
    severity: 'medium',
    agency: 'BWSSB',
    ward: 'Ward 89 - Indiranagar',
    mla: 'S. Raghu',
    sanctionedBudget: '₹8.2 Crores',
    upvotes: 450,
    timestamp: '1 day ago'
  },
  {
    id: 'issue-4',
    longitude: 77.5846,
    latitude: 12.9116,
    title: 'Missing Gutter Cover',
    category: 'Drainage',
    status: 'open',
    severity: 'high',
    agency: 'BWSSB',
    ward: 'Ward 177 - JP Nagar',
    mla: 'Satish Reddy',
    sanctionedBudget: '₹2.1 Crores',
    upvotes: 89,
    timestamp: '3 days ago'
  },
  {
    id: 'issue-5',
    longitude: 77.5646,
    latitude: 13.0016,
    title: 'Uneven Road Surface',
    category: 'Pothole',
    status: 'resolved',
    severity: 'low',
    agency: 'BBMP Roadworks',
    ward: 'Ward 64 - Malleshwaram',
    mla: 'C.N. Ashwath Narayan',
    sanctionedBudget: '₹5.5 Crores',
    upvotes: 42,
    timestamp: '1 week ago'
  },
  {
    id: 'issue-6',
    longitude: 74.8560,
    latitude: 12.8700,
    title: 'Coastal Erosion Collapse',
    category: 'Broken Footpath',
    status: 'open',
    severity: 'critical',
    agency: 'MCC (Mangaluru City Corp)',
    ward: 'Ward 12 - Panambur',
    mla: 'Bharath Shetty',
    sanctionedBudget: '₹12 Crores',
    upvotes: 890,
    timestamp: '2 hours ago'
  },
  {
    id: 'issue-7',
    longitude: 74.8450,
    latitude: 12.8600,
    title: 'Flooded Underpass',
    category: 'Drainage',
    status: 'open',
    severity: 'high',
    agency: 'MCC',
    ward: 'Ward 45 - Kankanady',
    mla: 'U. T. Khader',
    sanctionedBudget: '₹8 Crores',
    upvotes: 65,
    isMine: true,
    timestamp: '3 days ago',
    newsContext: [
      {
        id: 'cxt-2',
        source: 'India Times',
        title: 'Flooding Crisis: Underpass Logjam Causes Multi-Hour Gridlock',
        date: 'Yesterday',
        url: '#',
        snippet: 'Poor systemic drainage resulted in massive flooding beneath the railway underpass, rendering the route impassable for emergency vehicles.',
        isTragic: true
      }
    ]
  },
  {
    id: 'issue-8',
    longitude: 76.6413,
    latitude: 12.2958,
    title: 'Extinguished Heritage Lights',
    category: 'Streetlight',
    status: 'open',
    severity: 'low',
    agency: 'MCC (Mysuru City Corp)',
    ward: 'Ward 23 - Chamrajpura',
    mla: 'L. Nagendra',
    sanctionedBudget: '₹0.5 Crores',
    upvotes: 21,
    timestamp: '1 day ago'
  },
  {
    id: 'issue-9',
    longitude: 76.6500,
    latitude: 12.3000,
    title: 'Deep Sinkhole',
    category: 'Pothole',
    status: 'open',
    severity: 'critical',
    agency: 'MUDA',
    ward: 'Ward 41 - Kuvempunagar',
    mla: 'S. A. Ramadas',
    sanctionedBudget: '₹2.3 Crores',
    upvotes: 450,
    timestamp: '5 hours ago'
  },
  {
    id: 'issue-10',
    longitude: 75.1316,
    latitude: 15.3647,
    title: 'Collapsed Highway Divider',
    category: 'Broken Footpath',
    status: 'resolved',
    severity: 'high',
    agency: 'NHAI',
    ward: 'Ward 11 - Vidyanagar',
    mla: 'Jagadish Shettar',
    sanctionedBudget: '₹40 Crores',
    upvotes: 110,
    timestamp: '2 weeks ago'
  },
  {
    id: 'issue-11',
    longitude: 75.1400,
    latitude: 15.3500,
    title: 'Stagnant Disease Pool',
    category: 'Drainage',
    status: 'open',
    severity: 'critical',
    agency: 'HDMC',
    ward: 'Ward 8 - Gokul Road',
    mla: 'Aravind Bellad',
    sanctionedBudget: '₹3.2 Crores',
    upvotes: 312,
    timestamp: '4 hours ago'
  },
  {
    id: 'issue-12',
    longitude: 77.5846,
    latitude: 12.9616,
    title: 'Blackout Intersection',
    category: 'Streetlight',
    status: 'open',
    severity: 'medium',
    agency: 'BESCOM',
    ward: 'Ward 111 - Shantala Nagar',
    mla: 'N.A. Haris',
    sanctionedBudget: '₹1.1 Crores',
    upvotes: 56,
    timestamp: '12 hours ago'
  },
  {
    id: 'issue-13',
    longitude: 77.5746,
    latitude: 12.9816,
    title: 'Caved-in Bus Lane',
    category: 'Pothole',
    status: 'open',
    severity: 'high',
    agency: 'BBMP Major Roads',
    ward: 'Ward 95 - Subhash Nagar',
    mla: 'R. V. Devaraj',
    sanctionedBudget: '₹6 Crores',
    upvotes: 210,
    timestamp: '1 day ago'
  },
  {
    id: 'issue-14',
    longitude: 75.6416,
    latitude: 15.8458,
    title: 'Contaminated Water Main',
    category: 'Drainage',
    status: 'open',
    severity: 'critical',
    agency: 'KWB',
    ward: 'Ward 4 - Hindwadi',
    mla: 'Abhay Patil',
    sanctionedBudget: '₹15 Crores',
    upvotes: 678,
    timestamp: '1 hour ago'
  },
  {
    id: 'issue-15',
    longitude: 77.5800,
    latitude: 12.9700,
    title: 'Fallen Tree Blocking Road',
    category: 'Other',
    customCategory: 'Fallen Tree',
    status: 'pending_verification',
    severity: 'high',
    agency: 'BBMP Forestry',
    ward: 'Ward 100 - Bengaluru',
    mla: 'NA',
    sanctionedBudget: 'Pending Verification',
    upvotes: 0,
    verificationCount: 0,
    timestamp: '10 minutes ago'
  },
  {
    id: 'issue-16',
    longitude: 74.8480,
    latitude: 12.8680,
    title: 'Broken Traffic Signal',
    category: 'Other',
    customCategory: 'Traffic Light Failure',
    status: 'pending_verification',
    severity: 'medium',
    agency: 'Traffic Police',
    ward: 'Ward 54 - Coastal',
    mla: 'NA',
    sanctionedBudget: 'Pending Verification',
    upvotes: 0,
    verificationCount: 0,
    timestamp: '30 minutes ago'
  }
];

export const mockWallOfShame: MlaStats[] = [
  { id: 'mla-1', rank: 1, name: 'S. R. Vishwanath', ward: 'Yelahanka', unresolvedCount: 842 },
  { id: 'mla-2', rank: 2, name: 'Munirathna', ward: 'R. R. Nagar', unresolvedCount: 651 },
  { id: 'mla-3', rank: 3, name: 'Byrathi Basavaraj', ward: 'K. R. Puram', unresolvedCount: 420 },
  { id: 'mla-4', rank: 4, name: 'K. Gopalaiah', ward: 'Mahalakshmi Layout', unresolvedCount: 389 },
];

export const mockCitizenFame: UserStats[] = [
  { 
    id: 'user-1', rank: 1, name: 'Arjun M.', jobTitle: 'Urban Planner', 
    reportsPublished: 145, reportsVerified: 200, integrationsHelped: 3, 
    civicSenseScore: 5600, 
    socials: { linkedin: '#', instagram: '#' } 
  },
  { 
    id: 'user-2', rank: 2, name: 'Priya K.', jobTitle: 'Architect',
    reportsPublished: 98, reportsVerified: 154, integrationsHelped: 1, 
    civicSenseScore: 4110,
    socials: { linkedin: '#', facebook: '#' } 
  },
  { 
    id: 'user-3', rank: 3, name: 'Rohan D.', jobTitle: 'Local Activist',
    reportsPublished: 112, reportsVerified: 105, integrationsHelped: 2, 
    civicSenseScore: 3320,
    socials: { facebook: '#' }
  },
  { 
    id: 'user-4', rank: 4, name: 'Sneha P.', jobTitle: 'Civic Engineer',
    reportsPublished: 45, reportsVerified: 88, integrationsHelped: 8, 
    civicSenseScore: 2610,
    socials: { linkedin: '#', instagram: '#' }
  },
];
