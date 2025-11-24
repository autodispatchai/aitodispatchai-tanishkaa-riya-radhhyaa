/**
 * Integration Tests for Clerk Webhook
 * 
 * Tests the webhook endpoint that syncs Clerk users to Supabase
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Supabase admin client
const mockSupabaseAdmin = {
  from: vi.fn(() => mockSupabaseAdmin),
  upsert: vi.fn(() => mockSupabaseAdmin),
  select: vi.fn(() => mockSupabaseAdmin),
  single: vi.fn(() => mockSupabaseAdmin),
  eq: vi.fn(() => mockSupabaseAdmin),
  update: vi.fn(() => mockSupabaseAdmin),
  delete: vi.fn(() => mockSupabaseAdmin),
};

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

// Mock Svix Webhook
const mockWebhookVerify = vi.fn();
vi.mock('svix', () => ({
  Webhook: vi.fn(() => ({
    verify: mockWebhookVerify,
  })),
}));

describe('Clerk Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = 'test_secret';
  });

  afterEach(() => {
    delete process.env.CLERK_WEBHOOK_SECRET;
  });

  describe('user.created event', () => {
    it('should create user in Supabase when Clerk user is created', async () => {
      const mockUser = {
        id: 'user_2abc123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'John',
        last_name: 'Doe',
        image_url: 'https://example.com/avatar.jpg',
      };

      const mockEvent = {
        type: 'user.created',
        data: mockUser,
      };

      mockWebhookVerify.mockReturnValue(mockEvent);

      mockSupabaseAdmin.single.mockResolvedValue({
        data: {
          id: 'uuid-123',
          clerk_user_id: 'user_2abc123',
          email: 'test@example.com',
        },
        error: null,
      });

      // Mock fetch for webhook endpoint
      const response = await fetch('http://localhost:3000/api/clerk/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
        body: JSON.stringify(mockEvent),
      });

      expect(response.status).toBe(200);
      expect(mockSupabaseAdmin.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          clerk_user_id: 'user_2abc123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
        }),
        { onConflict: 'clerk_user_id' }
      );
    });

    it('should handle missing email gracefully', async () => {
      const mockUser = {
        id: 'user_2abc123',
        email_addresses: [],
      };

      const mockEvent = {
        type: 'user.created',
        data: mockUser,
      };

      mockWebhookVerify.mockReturnValue(mockEvent);

      const response = await fetch('http://localhost:3000/api/clerk/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
        body: JSON.stringify(mockEvent),
      });

      // Should return 200 with warning
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.warning).toBe('No email found');
    });
  });

  describe('user.updated event', () => {
    it('should update user in Supabase when Clerk user is updated', async () => {
      const mockUser = {
        id: 'user_2abc123',
        email_addresses: [{ email_address: 'updated@example.com' }],
        first_name: 'Jane',
        last_name: 'Smith',
      };

      const mockEvent = {
        type: 'user.updated',
        data: mockUser,
      };

      mockWebhookVerify.mockReturnValue(mockEvent);

      mockSupabaseAdmin.eq.mockResolvedValue({
        data: null,
        error: null,
      });

      const response = await fetch('http://localhost:3000/api/clerk/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature',
        },
        body: JSON.stringify(mockEvent),
      });

      expect(response.status).toBe(200);
      expect(mockSupabaseAdmin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'updated@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
        })
      );
      expect(mockSupabaseAdmin.eq).toHaveBeenCalledWith('clerk_user_id', 'user_2abc123');
    });
  });

  describe('webhook security', () => {
    it('should reject requests without Svix headers', async () => {
      const response = await fetch('http://localhost:3000/api/clerk/webhook', {
        method: 'POST',
        body: JSON.stringify({ type: 'user.created', data: {} }),
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain('Missing Svix headers');
    });

    it('should reject requests with invalid signature', async () => {
      mockWebhookVerify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const response = await fetch('http://localhost:3000/api/clerk/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'invalid-signature',
        },
        body: JSON.stringify({ type: 'user.created', data: {} }),
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain('verification failed');
    });
  });
});

/**
 * Note: These are unit tests using mocks.
 * For full integration tests, you would:
 * 1. Set up a test Supabase instance
 * 2. Use Clerk test webhooks
 * 3. Verify actual database changes
 */

