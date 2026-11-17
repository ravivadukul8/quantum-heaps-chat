import type { User } from '../types';

export const CURRENT_USER_ID = 'user-1';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    customBio: 'Frontend Architect | Crafting reactive real-time experiences',
    createdAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    email: 'sarah.chen@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    customBio: 'Staff Tech Lead • TypeScript & WebAssembly enthusiast',
    createdAt: '2023-11-10T09:30:00.000Z',
  },
  {
    id: 'user-3',
    name: 'Marcus Vance',
    email: 'marcus.vance@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
    lastSeen: '2026-11-17T09:45:00.000Z',
    customBio: 'Senior PM • Roadmap, user value & data-driven growth',
    createdAt: '2023-08-20T10:15:00.000Z',
  },
  {
    id: 'user-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    customBio: 'Principal Product Designer • Design systems, typography & micro-interactions',
    createdAt: '2024-02-01T11:00:00.000Z',
  },
  {
    id: 'user-5',
    name: 'Devon Miller',
    email: 'devon.miller@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'away',
    customBio: 'Cloud & Infrastructure • K8s, Terraform, Prometheus alerts',
    createdAt: '2023-09-12T14:20:00.000Z',
  },
  {
    id: 'user-6',
    name: 'Aisha Patel',
    email: 'aisha.patel@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    customBio: 'Senior Distributed Systems Engineer • Go, Rust & Redis clusters',
    createdAt: '2024-03-05T07:45:00.000Z',
  },
  {
    id: 'user-7',
    name: 'Liam Gallagher',
    email: 'liam.g@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
    lastSeen: '2026-11-16T18:20:00.000Z',
    customBio: 'QA Automation Lead • Cypress, Playwright, zero regression advocate',
    createdAt: '2023-12-01T13:10:00.000Z',
  },
  {
    id: 'user-8',
    name: 'Maya Lin',
    email: 'maya.lin@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    customBio: 'Engineering Manager • Empowering teams to build great software',
    createdAt: '2023-05-18T16:00:00.000Z',
  },
  {
    id: 'user-9',
    name: 'Kenji Sato',
    email: 'kenji.sato@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
    lastSeen: '2026-11-14T11:10:00.000Z',
    customBio: 'Security & AppSec • Zero-trust, audits & encryption',
    createdAt: '2024-01-05T10:00:00.000Z',
  },
  {
    id: 'user-10',
    name: 'Priya Sharma',
    email: 'priya.sharma@quantumheaps.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    customBio: 'Junior Frontend Developer • Learning React, Tailwind & Vite daily',
    createdAt: '2024-06-15T09:00:00.000Z',
  },
];

export const mockUsersById: Record<string, User> = mockUsers.reduce(
  (acc, user) => {
    acc[user.id] = user;
    return acc;
  },
  {} as Record<string, User>
);
