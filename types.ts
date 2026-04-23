export interface Notice {
  id: string;
  title: string;
  date: string;
  description: string;
  link?: string;
  isImportant?: boolean;
}

export interface Resource {
  id: string;
  type: 'Slide' | 'PDF' | 'Link';
  title: string;
  link: string;
}

export interface Course {
  id: string;
  name: string;
  resources: Resource[];
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export interface ExamType {
  id: string;
  name: string;
  courses: Course[];
}

export interface QBSemester {
  id: string;
  name: string;
  exams: ExamType[];
}

export interface QBBatch {
  id: string;
  batchName: string;
  semesters: QBSemester[];
}

export interface MaterialData {
  sectionA: Semester[];
  sectionB: Semester[];
  questionBank: QBBatch[];
  specialLinks: Resource[];
  qbPassword?: string;
}

export interface GalleryAlbum {
  id: string;
  category: string;
  images: string[];
}

export interface CRInfo {
  name: string;
  email: string;
  phone: string;
  section: string;
  image?: string;
}

export interface DonationInfo {
  bkash: string;
  nagad: string;
  message: string;
  target: number;
  current: number;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  iconType: 'github' | 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'globe';
}

export interface BatchInfo {
  name: string;
  department: string;
  university: string;
  tagline: string;
  heroImage?: string;
  logo?: string;
  about?: string;
  crs: CRInfo[];
  donation: DonationInfo;
  socialLinks: SocialLink[];
}