import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  postSchema,
  groupOrderSchema,
  orderItemSchema,
  resourceSchema,
  bookingSchema,
  voteSchema,
  eventSchema,
  treasuryEntrySchema,
  profileSchema,
} from '@/lib/validations/schemas';

describe('signUpSchema', () => {
  it('accepts valid signup data', () => {
    const result = signUpSchema.safeParse({
      email: 'sarah@example.com',
      password: 'password123',
      full_name: 'Sarah Mitchell',
      display_name: 'Sarah M.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'sarah@example.com',
      password: 'short',
      full_name: 'Sarah',
      display_name: 'Sarah',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      full_name: 'Sarah',
      display_name: 'Sarah',
    });
    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('accepts valid login data', () => {
    const result = signInSchema.safeParse({
      email: 'sarah@example.com',
      password: 'any-password',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'sarah@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('postSchema', () => {
  it('accepts valid post with content only', () => {
    const result = postSchema.safeParse({
      content: 'Water main repair tomorrow!',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe('general');
    }
  });

  it('accepts post with all fields', () => {
    const result = postSchema.safeParse({
      title: 'Water Main Repair Notice',
      content: 'Expect low pressure tomorrow 8am-2pm.',
      category: 'alert',
      media_urls: ['https://example.com/photo.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = postSchema.safeParse({ content: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = postSchema.safeParse({
      content: 'Hello',
      category: 'invalid_category',
    });
    expect(result.success).toBe(false);
  });

  it('accepts nullable title', () => {
    const result = postSchema.safeParse({
      content: 'Hello neighbors!',
      title: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('groupOrderSchema', () => {
  it('accepts valid group order', () => {
    const result = groupOrderSchema.safeParse({
      title: 'Spring Mulch Bulk Order',
      vendor_name: 'Home Depot',
      deadline: '2025-04-01T00:00:00Z',
      min_participants: 5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing vendor name', () => {
    const result = groupOrderSchema.safeParse({
      title: 'Spring Mulch',
      vendor_name: '',
      deadline: '2025-04-01',
    });
    expect(result.success).toBe(false);
  });

  it('applies default values', () => {
    const result = groupOrderSchema.safeParse({
      title: 'Test Order',
      vendor_name: 'Vendor',
      deadline: '2025-04-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.min_participants).toBe(1);
      expect(result.data.delivery_fee).toBe(0);
    }
  });
});

describe('orderItemSchema', () => {
  it('accepts valid order item', () => {
    const result = orderItemSchema.safeParse({
      item_name: 'Premium Brown Mulch (2 cu yd)',
      quantity: 4,
      unit_price: 7.5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero quantity', () => {
    const result = orderItemSchema.safeParse({
      item_name: 'Mulch',
      quantity: 0,
      unit_price: 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = orderItemSchema.safeParse({
      item_name: 'Mulch',
      quantity: 1,
      unit_price: -5,
    });
    expect(result.success).toBe(false);
  });
});

describe('resourceSchema', () => {
  it('accepts valid resource', () => {
    const result = resourceSchema.safeParse({
      name: 'Pressure Washer (3100 PSI)',
      category: 'equipment',
      condition: 'good',
      deposit_amount: 20,
      is_free: true,
    });
    expect(result.success).toBe(true);
  });

  it('applies defaults', () => {
    const result = resourceSchema.safeParse({
      name: 'Ladder',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe('tools');
      expect(result.data.condition).toBe('good');
      expect(result.data.is_free).toBe(true);
      expect(result.data.daily_rate).toBe(0);
    }
  });

  it('rejects invalid category', () => {
    const result = resourceSchema.safeParse({
      name: 'Something',
      category: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = resourceSchema.safeParse({ name: 'X' });
    expect(result.success).toBe(false);
  });
});

describe('bookingSchema', () => {
  it('accepts valid booking', () => {
    const result = bookingSchema.safeParse({
      starts_at: '2025-03-12T10:00:00Z',
      ends_at: '2025-03-12T16:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing dates', () => {
    const result = bookingSchema.safeParse({
      starts_at: '',
      ends_at: '2025-03-12',
    });
    expect(result.success).toBe(false);
  });
});

describe('voteSchema', () => {
  it('accepts valid vote with options', () => {
    const result = voteSchema.safeParse({
      title: 'Should we install speed bumps?',
      description: 'Following several incidents of speeding on Oak Lane, we propose installing speed bumps.',
      voting_method: 'simple_majority',
      quorum_percent: 50,
      deadline: '2025-03-25T00:00:00Z',
      options: [
        { label: 'Yes, install speed bumps' },
        { label: 'No, do not install' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 2 options', () => {
    const result = voteSchema.safeParse({
      title: 'Test Vote',
      description: 'A test vote description that is long enough.',
      deadline: '2025-04-01',
      options: [{ label: 'Only one option' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects short title', () => {
    const result = voteSchema.safeParse({
      title: 'Hi',
      description: 'A test vote description.',
      deadline: '2025-04-01',
      options: [{ label: 'Yes' }, { label: 'No' }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts ranked choice method', () => {
    const result = voteSchema.safeParse({
      title: 'Block Party Date',
      description: 'Let us decide the date for our annual block party event.',
      voting_method: 'ranked_choice',
      deadline: '2025-04-01',
      options: [
        { label: 'March 22' },
        { label: 'March 29' },
        { label: 'April 5' },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('eventSchema', () => {
  it('accepts valid event', () => {
    const result = eventSchema.safeParse({
      title: 'Block Party Planning Meeting',
      starts_at: '2025-03-15T16:00:00Z',
      location_name: 'Community Center',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing start time', () => {
    const result = eventSchema.safeParse({
      title: 'Block Party',
      starts_at: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts nullable optional fields', () => {
    const result = eventSchema.safeParse({
      title: 'Test Event',
      starts_at: '2025-04-01T09:00:00Z',
      ends_at: null,
      max_attendees: null,
      location_name: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('treasuryEntrySchema', () => {
  it('accepts valid income entry', () => {
    const result = treasuryEntrySchema.safeParse({
      entry_type: 'income',
      category: 'dues',
      description: 'Monthly dues - Mike T.',
      amount: 50,
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid expense entry', () => {
    const result = treasuryEntrySchema.safeParse({
      entry_type: 'expense',
      category: 'event',
      description: 'Block party supplies',
      amount: 223.5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero amount', () => {
    const result = treasuryEntrySchema.safeParse({
      entry_type: 'income',
      category: 'general',
      description: 'Test',
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid entry type', () => {
    const result = treasuryEntrySchema.safeParse({
      entry_type: 'transfer',
      category: 'general',
      description: 'Test',
      amount: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = treasuryEntrySchema.safeParse({
      entry_type: 'income',
      category: 'invalid',
      description: 'Test',
      amount: 10,
    });
    expect(result.success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('accepts valid profile', () => {
    const result = profileSchema.safeParse({
      display_name: 'Sarah M.',
      bio: 'Love gardening and community events',
      skills: ['Gardening', 'Cooking', 'Event Planning'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (all optional)', () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts null values', () => {
    const result = profileSchema.safeParse({
      display_name: null,
      bio: null,
      phone: null,
      skills: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects too many skills', () => {
    const skills = Array.from({ length: 25 }, (_, i) => `Skill ${i}`);
    const result = profileSchema.safeParse({ skills });
    expect(result.success).toBe(false);
  });
});
