import { Notice, MaterialData, GalleryAlbum, BatchInfo } from './types';

export const INITIAL_BATCH_INFO: BatchInfo = {
  name: "Textile Batch 58",
  department: "Dept. of Textile Engineering",
  university: "City University",
  tagline: "Weaving the Future, One Thread at a Time",
  heroImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1920",
  logo: "S",
  about: "Textile Batch 58 is a vibrant community of aspiring textile engineers at City University. We are dedicated to academic excellence, industrial innovation, and fostering strong professional networks within the global textile industry. Our batch represents a blend of technical expertise and creative problem-solving, aimed at weaving a sustainable and technologically advanced future.",
  crs: [
    {
      name: "Tanvir Ahmed",
      email: "tanvir.cr.a@cityuniversity.edu.bd",
      phone: "017XX-XXXXXX",
      section: "Section A"
    },
    {
      name: "Sifat Hassan",
      email: "sifat.cr.b@cityuniversity.edu.bd",
      phone: "018XX-XXXXXX",
      section: "Section B"
    }
  ],
  donation: {
    bkash: "017XXXXXXXX",
    nagad: "018XXXXXXXX",
    message: "Contributions go towards organizing industrial tours, technical workshops, and batch social events.",
    target: 50000,
    current: 12500
  },
  socialLinks: [
    { id: 's1', name: 'GitHub', url: 'https://github.com', iconType: 'github' },
    { id: 's2', name: 'Twitter', url: 'https://twitter.com', iconType: 'twitter' },
    { id: 's3', name: 'LinkedIn', url: 'https://linkedin.com', iconType: 'linkedin' }
  ]
};

export const INITIAL_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'Yarn Manufacturing I Mid-Term',
    date: 'Oct 28, 2023',
    description: 'The mid-term exam will cover Blowroom, Carding, and Drawing sections. Venue: Room 302.',
    isImportant: true
  },
  {
    id: '2',
    title: 'Wet Processing Lab Report',
    date: 'Oct 25, 2023',
    description: 'Dyeing & Printing lab reports must be submitted to the lab assistant by this Thursday.'
  }
];

export const INITIAL_MATERIALS_DATA: MaterialData = {
  sectionA: [
    {
      id: 'sem1',
      name: '1st Semester',
      courses: [
        {
          id: 'c1',
          name: 'Textile Raw Materials I',
          resources: [
            { id: 'sa1', type: 'Slide', title: 'Classification of Fibers', link: '#' },
            { id: 'sa2', type: 'PDF', title: 'Cotton Fiber Growth & Structure', link: '#' }
          ]
        },
        {
          id: 'c2',
          name: 'Fabric Manufacturing I',
          resources: [
            { id: 'sa3', type: 'Slide', title: 'Intro to Weaving Mechanics', link: '#' }
          ]
        }
      ]
    },
    {
      id: 'sem2',
      name: '2nd Semester',
      courses: []
    }
  ],
  sectionB: [
    {
      id: 'sem1b',
      name: '1st Semester',
      courses: [
        {
          id: 'c1b',
          name: 'Yarn Manufacturing I',
          resources: [
            { id: 'sb1', type: 'Slide', title: 'Mechanics of Ginning', link: '#' }
          ]
        }
      ]
    }
  ],
  questionBank: [
    {
      id: 'batch_58',
      batchName: 'Batch 58',
      semesters: [
        {
          id: 'qb_sem1',
          name: '1st Semester',
          exams: [
            {
              id: 'qb_sem1_mid',
              name: 'Mid Exam',
              courses: [
                {
                  id: 'qb_c1',
                  name: 'Physics',
                  resources: [
                    { id: 'qb1', type: 'PDF', title: 'Mid Exam 2022', link: '#' }
                  ]
                }
              ]
            },
            {
              id: 'qb_sem1_final',
              name: 'Final Exam',
              courses: [
                {
                  id: 'qb_c2',
                  name: 'Chemistry',
                  resources: [
                    { id: 'qb2', type: 'PDF', title: 'Final Exam 2022', link: '#' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'batch_57',
      batchName: 'Batch 57',
      semesters: []
    }
  ],
  specialLinks: [
    { id: 'sl1', type: 'Slide', title: 'Global Textile Standards (ISO)', link: 'https://library.cityuniversity.edu.bd' },
    { id: 'sl2', type: 'PDF', title: 'Academic Calendar 2023-24', link: '#' }
  ],
  qbPassword: 'crcub58'
};

export const INITIAL_GALLERY_ALBUMS: GalleryAlbum[] = [
  { 
    id: 'alb1', 
    category: 'Industrial Tour 2023', 
    images: [
      'https://picsum.photos/seed/textile1/800/600',
      'https://picsum.photos/seed/textile2/800/600',
      'https://picsum.photos/seed/textile3/800/600'
    ] 
  },
  { 
    id: 'alb2', 
    category: 'Freshers Reception', 
    images: [
      'https://picsum.photos/seed/textile4/800/600',
      'https://picsum.photos/seed/textile5/800/600'
    ] 
  }
];