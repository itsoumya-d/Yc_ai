'use client';

import { useState } from 'react';
import { Search, MessageCircle, Wrench } from 'lucide-react';
import { initials } from '@/lib/utils';
import type { Profile } from '@/types/database';

const DEMO_MEMBERS: (Profile & { skills: string[]; resourceCount?: number })[] = [
  { id: 'u1', full_name: 'Sarah Mitchell', display_name: 'Sarah M.', bio: 'Love gardening and community events. Happy to share tips and tools.', avatar_url: null, skills: ['Gardening', 'Cooking', 'Event Planning'], phone: null, address: '142 Oak Lane', address_verified: true, show_on_map: true, show_in_directory: true, allow_dm: true, created_at: '2024-01-15', updated_at: '', resourceCount: 1 },
  { id: 'u2', full_name: 'Mike Thompson', display_name: 'Mike T.', bio: 'Retired electrician, happy to help neighbors with basic wiring questions. Love grilling and woodworking.', avatar_url: null, skills: ['Electrical', 'IT Support', 'Woodworking'], phone: null, address: '156 Oak Lane', address_verified: true, show_on_map: true, show_in_directory: true, allow_dm: true, created_at: '2024-02-03', updated_at: '', resourceCount: 3 },
  { id: 'u3', full_name: 'Lisa Rodriguez', display_name: 'Lisa R.', bio: 'Event planner by trade, community organizer by passion. Let\'s make Oak Hills the best block on the map!', avatar_url: null, skills: ['Event Planning', 'Fundraising', 'Spanish'], phone: null, address: '178 Oak Lane', address_verified: true, show_on_map: true, show_in_directory: true, allow_dm: true, created_at: '2024-03-10', updated_at: '', resourceCount: 0 },
  { id: 'u4', full_name: 'David Kim', display_name: 'David K.', bio: 'Landscape contractor. Happy to give free advice on yard projects to neighbors.', avatar_url: null, skills: ['Landscaping', 'Project Management', 'Gardening'], phone: null, address: '190 Oak Lane', address_verified: true, show_on_map: true, show_in_directory: true, allow_dm: true, created_at: '2024-01-20', updated_at: '', resourceCount: 2 },
  { id: 'u5', full_name: 'Ann Park', display_name: 'Ann P.', bio: 'Master gardener and occasional baker. Community garden plot holder since 2019.', avatar_url: null, skills: ['Gardening', 'Baking', 'Composting'], phone: null, address: '204 Oak Lane', address_verified: true, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '2024-01-28', updated_at: '', resourceCount: 2 },
  { id: 'u6', full_name: 'Jim Walsh', display_name: 'Jim W.', bio: 'Construction manager, 20 years experience. Can advise on home improvement projects.', avatar_url: null, skills: ['Construction', 'Plumbing', 'Carpentry'], phone: null, address: '218 Oak Lane', address_verified: true, show_on_map: true, show_in_directory: true, allow_dm: true, created_at: '2024-02-14', updated_at: '', resourceCount: 1 },
  { id: 'u7', full_name: 'Tom Harrison', display_name: 'Tom H.', bio: 'Software engineer, amateur astronomer. Ask me about tech help or star-gazing.', avatar_url: null, skills: ['Technology', 'Programming', 'Astronomy'], phone: null, address: '232 Oak Lane', address_verified: true, show_on_map: true, show_in_directory: true, allow_dm: true, created_at: '2024-03-05', updated_at: '', resourceCount: 1 },
  { id: 'u8', full_name: 'Maria Santos', display_name: 'Maria S.', bio: 'Nurse practitioner. Happy to answer basic health questions. Bilingual (Spanish/English).', avatar_url: null, skills: ['Healthcare', 'First Aid', 'Spanish'], phone: null, address: '246 Oak Lane', address_verified: true, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '2024-02-28', updated_at: '', resourceCount: 0 },
];

const AVATAR_COLORS = ['#16A34A', '#2563EB', '#7C3AED', '#DC2626', '#A16207', '#0369A1', '#CA8A04', '#059669'];

function MemberCard({ member, index }: { member: typeof DEMO_MEMBERS[0]; index: number }) {
  const [showDetail, setShowDetail] = useState(false);
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const joined = new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div
      className="cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md"
      style={{ borderColor: 'var(--border)' }}
      onClick={() => setShowDetail(!showDetail)}
    >
      {/* Avatar */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: color }}>
        {initials(member.full_name)}
      </div>

      <div className="mt-3">
        <div className="font-semibold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
          {member.display_name}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Joined {joined}</div>
      </div>

      {/* Skills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {member.skills.slice(0, 2).map(s => (
          <span key={s} className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#15803D]">
            {s}
          </span>
        ))}
        {member.skills.length > 2 && (
          <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>
            +{member.skills.length - 2}
          </span>
        )}
      </div>

      {/* Expanded detail */}
      {showDetail && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          {member.bio && (
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              {member.bio}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {member.skills.map(s => (
              <span key={s} className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#15803D]">{s}</span>
            ))}
          </div>
          {member.resourceCount !== undefined && member.resourceCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              <Wrench className="h-3.5 w-3.5" /> {member.resourceCount} item{member.resourceCount !== 1 ? 's' : ''} shared
            </div>
          )}
          <button
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#15803D]"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Send Message
          </button>
        </div>
      )}
    </div>
  );
}

export default function DirectoryPage() {
  const [search, setSearch] = useState('');
  const filtered = DEMO_MEMBERS.filter(m =>
    !search ||
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
          Neighbor Directory
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {DEMO_MEMBERS.length} members in Oak Hills
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="search" placeholder="Search by name or skill..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border py-2.5 pl-10 pr-4 text-base outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
          style={{ borderColor: 'var(--border)', background: 'white', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border bg-white py-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>No members match your search.</p>
        </div>
      )}
    </div>
  );
}
