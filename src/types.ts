export interface User {
  id: string;
  fullName: string;
  collegeEmail: string;
  studentId: string;
  phone: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  createdAt: string;
}

export interface Item {
  id: string;
  reportId: string;
  userId: string;
  posterName: string;
  posterEmail: string;
  posterPhone: string;
  itemName: string;
  type: 'LOST' | 'FOUND';
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  color: string;
  brand: string;
  identifyingDetails: string;
  contactPreference: 'EMAIL' | 'PHONE' | 'PLATFORM';
  imageUrl: string;
  status: 'OPEN' | 'RESOLVED' | 'CLAIMED';
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemReportId: string;
  claimantUserId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  ownerUserId: string;
  reason: string;
  additionalDetails: string;
  proofDetails: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalLost: number;
  totalFound: number;
  itemsReunited: number;
  activeItems: number;
  totalUsers: number;
  totalClaims: number;
}
