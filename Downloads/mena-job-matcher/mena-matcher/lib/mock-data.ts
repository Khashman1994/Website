// lib/mock-data.ts — MENA Edition (AED/SAR salaries, real MENA companies)
import { Job, JobFilters } from './types';

const MENA_MOCK_JOBS: Job[] = [
  // ─── UAE / Dubai Tech ───────────────────────────────────────────────────────
  {
    id: 'mena-1',
    title: 'Senior Full-Stack Developer',
    company: 'Careem (Uber)',
    location: 'Dubai, UAE',
    description: 'Join Careem\'s engineering team building the next generation of mobility and delivery products. Work with React, Node.js, TypeScript and AWS. Competitive salary, ESOP, remote-friendly.',
    salary: { min: 25000, max: 35000, currency: 'AED' },
    employmentType: 'full-time',
    remote: true,
    url: 'https://careers.careem.com',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-2',
    title: 'DevOps Engineer',
    company: 'Noon.com',
    location: 'Dubai, UAE',
    description: 'Scale Noon\'s e-commerce infrastructure across MENA. Deep work with Kubernetes, Terraform, AWS and CI/CD pipelines. Arabic language is a plus.',
    salary: { min: 20000, max: 30000, currency: 'AED' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://careers.noon.com',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-3',
    title: 'AI/ML Engineer',
    company: 'G42 (Group 42)',
    location: 'Abu Dhabi, UAE',
    description: 'Build AI solutions for government and enterprise clients. Experience with Python, PyTorch, LLMs and MLOps required. G42 is Abu Dhabi\'s leading AI company.',
    salary: { min: 30000, max: 45000, currency: 'AED' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://g42.ai/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-4',
    title: 'Product Manager – Fintech',
    company: 'Tabby',
    location: 'Dubai, UAE',
    description: 'Lead product strategy for Tabby\'s BNPL platform serving 6M+ users across UAE and Saudi Arabia. 3+ years product management experience, fintech background preferred.',
    salary: { min: 22000, max: 32000, currency: 'AED' },
    employmentType: 'full-time',
    remote: true,
    url: 'https://tabby.ai/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },

  // ─── Saudi Arabia / Riyadh ─────────────────────────────────────────────────
  {
    id: 'mena-5',
    title: 'Software Engineer – Backend',
    company: 'STC Pay',
    location: 'Riyadh, Saudi Arabia',
    description: 'Build Saudi Arabia\'s leading digital wallet. Java/Spring Boot, microservices, high-scale payments infrastructure. Vision 2030 company, Saudi nationals preferred.',
    salary: { min: 20000, max: 32000, currency: 'SAR' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://stcpay.com.sa/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-6',
    title: 'Digital Marketing Manager',
    company: 'Jarir Bookstore',
    location: 'Riyadh, Saudi Arabia',
    description: 'Drive digital marketing strategy for one of Saudi Arabia\'s largest retail chains. SEO, Performance Marketing, social media, Arabic content. 5+ years experience.',
    salary: { min: 15000, max: 22000, currency: 'SAR' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://jarir.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-7',
    title: 'Data Analyst – Business Intelligence',
    company: 'Saudi Aramco',
    location: 'Dhahran, Saudi Arabia',
    description: 'Analyse operational data to drive efficiency across Aramco\'s global operations. Python, SQL, Power BI, Tableau. Bachelor\'s in Engineering/CS/Data Science required.',
    salary: { min: 18000, max: 28000, currency: 'SAR' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://aramco.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-8',
    title: 'UX/UI Designer',
    company: 'Tawuniya Insurance',
    location: 'Riyadh, Saudi Arabia',
    description: 'Design intuitive Arabic-first insurance experiences for Tawuniya\'s digital products. Figma, Design Systems, RTL design expertise required. 3+ years experience.',
    salary: { min: 14000, max: 20000, currency: 'SAR' },
    employmentType: 'full-time',
    remote: true,
    url: 'https://tawuniya.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },

  // ─── Egypt / Cairo ─────────────────────────────────────────────────────────
  {
    id: 'mena-9',
    title: 'Frontend Developer – React',
    company: 'Instabug',
    location: 'Cairo, Egypt',
    description: 'Join one of Egypt\'s top SaaS startups building bug reporting and APM tools used by 25,000+ apps worldwide. React, TypeScript, testing-focused culture.',
    salary: { min: 35000, max: 55000, currency: 'EGP' },
    employmentType: 'full-time',
    remote: true,
    url: 'https://instabug.com/jobs',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-10',
    title: 'Backend Engineer – Node.js',
    company: 'Swvl',
    location: 'Cairo, Egypt',
    description: 'Build scalable transit infrastructure used by millions across Africa and MENA. Node.js, MongoDB, Redis, event-driven architecture. Hybrid work model.',
    salary: { min: 40000, max: 65000, currency: 'EGP' },
    employmentType: 'full-time',
    remote: true,
    url: 'https://swvl.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-11',
    title: 'Finance Manager',
    company: 'Fawry',
    location: 'Cairo, Egypt',
    description: 'Manage financial reporting, budgeting and compliance for Egypt\'s leading fintech. CPA/ACCA preferred, financial services background. Arabic required.',
    salary: { min: 30000, max: 50000, currency: 'EGP' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://fawry.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },

  // ─── Cross-MENA / Remote ────────────────────────────────────────────────────
  {
    id: 'mena-12',
    title: 'Solutions Architect – Cloud',
    company: 'Amazon Web Services (AWS)',
    location: 'Dubai, UAE (Remote MENA)',
    description: 'Help AWS customers in MENA architect and migrate to the cloud. Deep AWS knowledge, pre-sales experience, Arabic a strong plus. Travel 30%.',
    salary: { min: 40000, max: 55000, currency: 'AED' },
    employmentType: 'full-time',
    remote: true,
    url: 'https://amazon.jobs',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-13',
    title: 'Cybersecurity Analyst',
    company: 'Help AG (Etisalat subsidiary)',
    location: 'Dubai, UAE',
    description: 'Protect enterprise clients across MENA from cyber threats. SIEM, SOC operations, incident response. CISSP/CEH certification preferred.',
    salary: { min: 22000, max: 35000, currency: 'AED' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://helpag.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-14',
    title: 'Sales Engineer – Enterprise SaaS',
    company: 'SAP Middle East',
    location: 'Riyadh, Saudi Arabia',
    description: 'Drive SAP enterprise solution sales across Saudi Arabia and Gulf. Technical pre-sales, Arabic required, 5+ years enterprise software experience.',
    salary: { min: 25000, max: 40000, currency: 'SAR' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://sap.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-15',
    title: 'HR Business Partner',
    company: 'NEOM',
    location: 'Tabuk, Saudi Arabia',
    description: 'Shape the future of NEOM\'s people strategy at one of the world\'s most ambitious projects. 8+ years HRBP experience, international background, Arabic preferred.',
    salary: { min: 35000, max: 50000, currency: 'SAR' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://neom.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-16',
    title: 'E-commerce Manager',
    company: 'Chalhoub Group',
    location: 'Dubai, UAE',
    description: 'Lead online retail operations for luxury brands (Louis Vuitton, Christian Dior) across MENA. Shopify/Salesforce Commerce Cloud, P&L ownership, Arabic a plus.',
    salary: { min: 25000, max: 38000, currency: 'AED' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://chalhoubgroup.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-17',
    title: 'Blockchain Developer',
    company: 'Dubai Multi Commodities Centre (DMCC)',
    location: 'Dubai, UAE',
    description: 'Build blockchain solutions for commodities trading and verification. Solidity, Ethereum, Hyperledger. DMCC is the world\'s leading commodities hub.',
    salary: { min: 28000, max: 42000, currency: 'AED' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://dmcc.ae/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-18',
    title: 'Civil Engineer – Infrastructure',
    company: 'Dar Al-Handasah (Shair and Partners)',
    location: 'Beirut / Dubai / Riyadh',
    description: 'Design and supervise major infrastructure projects across MENA. AutoCAD, BIM, 5+ years experience in roads/bridges/utilities. Arabic required.',
    salary: { min: 18000, max: 28000, currency: 'AED' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://dar.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-19',
    title: 'Growth Marketing Lead',
    company: 'Anghami',
    location: 'Dubai, UAE (Remote)',
    description: 'Drive user acquisition and retention for MENA\'s leading music streaming app. Performance marketing, CRM, Arabic content strategy, 70M+ users.',
    salary: { min: 20000, max: 30000, currency: 'AED' },
    employmentType: 'full-time',
    remote: true,
    url: 'https://anghami.com/jobs',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'mena-20',
    title: 'Investment Analyst',
    company: 'Mubadala Investment Company',
    location: 'Abu Dhabi, UAE',
    description: 'Conduct investment analysis for Mubadala\'s global portfolio (tech, healthcare, real estate). CFA preferred, financial modeling, Arabic/English bilingual.',
    salary: { min: 30000, max: 45000, currency: 'AED' },
    employmentType: 'full-time',
    remote: false,
    url: 'https://mubadala.com/careers',
    postedDate: new Date().toISOString(),
    source: 'mock',
  },
];

export function getMockJobs(
  query: string,
  filters?: JobFilters,
  maxResults: number = 20
): Job[] {
  let results = [...MENA_MOCK_JOBS];

  const q = query.toLowerCase().trim();

  // Only filter by query if industry is also selected — otherwise return all
  if (q.length > 2 && filters?.industry) {
    results = results.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q)
    );
  }

  // Filter by location — match both "Dubai, UAE" and country-level "UAE"
  if (filters?.location) {
    const loc = filters.location.toLowerCase().replace(/,.*/, '').trim(); // extract first word
    results = results.filter((job) =>
      job.location.toLowerCase().includes(loc)
    );
  }

  // Filter by industry — skip entirely when empty (show all industries)
  if (filters?.industry) {
    const ind = filters.industry.toLowerCase();
    const industryKeywords: Record<string, string[]> = {
      tech:        ['developer', 'engineer', 'ml', 'ai', 'devops', 'cloud', 'blockchain', 'cybersecurity', 'software'],
      finance:     ['finance', 'fintech', 'investment', 'banking', 'analyst', 'accountant'],
      healthcare:  ['health', 'medical', 'doctor', 'nurse', 'pharma', 'clinical'],
      marketing:   ['marketing', 'growth', 'seo', 'social media', 'digital', 'brand'],
      engineering: ['civil', 'infrastructure', 'mechanical', 'electrical', 'structural'],
      education:   ['teacher', 'lecturer', 'training', 'education', 'tutor'],
      consulting:  ['consultant', 'advisory', 'strategy', 'business analyst'],
      logistics:   ['logistics', 'supply chain', 'procurement', 'operations', 'warehouse'],
      realestate:  ['real estate', 'property', 'leasing', 'facilities'],
      energy:      ['aramco', 'oil', 'energy', 'petroleum', 'gas', 'renewables'],
    };
    const keywords = industryKeywords[ind] || [ind];
    results = results.filter((job) =>
      keywords.some(
        (kw) =>
          job.title.toLowerCase().includes(kw) ||
          job.description.toLowerCase().includes(kw)
      )
    );
  }
  // industry === '' → no filter applied, all mock jobs pass through

  // Filter employment type
  if (filters?.employmentType) {
    results = results.filter(
      (job) => job.employmentType === filters.employmentType
    );
  }

  // Filter remote
  if (filters?.remote) {
    results = results.filter((job) => job.remote === true);
  }

  // Salary filter (normalise to AED equivalent roughly)
  if (filters?.salaryMin || filters?.salaryMax) {
    results = results.filter((job) => {
      if (!job.salary?.min) return true;
      const min = filters.salaryMin ?? 0;
      const max = filters.salaryMax ?? Infinity;
      return job.salary.min >= min && job.salary.max! <= max;
    });
  }

  return results.slice(0, maxResults);
}