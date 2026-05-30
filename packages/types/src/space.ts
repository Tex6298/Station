export interface SpaceRecord {
  id: string;
  ownerUserId: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  theme?: string | null;
  customCss?: string | null;
  isPublic: boolean;
  commentsDefaultEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpacePageRecord {
  id: string;
  spaceId: string;
  slug: string;
  title: string;
  pageType: 'home' | 'about' | 'personas' | 'documents' | 'custom';
  body?: string;
  sortOrder: number;
  isPublished: boolean;
  commentsEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}
