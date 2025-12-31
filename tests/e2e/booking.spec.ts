/**
 * E2E Tests for Booking Flow
 */

import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
  })

  test('should display landing page correctly', async ({ page }) => {
    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: /Book Your Perfect Court/i })).toBeVisible()

    // Check if navigation is present
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible()
  })

  test('should navigate to venues page', async ({ page }) => {
    // Click on Browse Venues button
    await page
      .getByRole('link', { name: /Browse Venues/i })
      .first()
      .click()

    // Wait for navigation
    await page.waitForURL('**/venues')

    // Check if we're on the venues page
    expect(page.url()).toContain('/venues')
  })

  test('should navigate to sign up page', async ({ page }) => {
    // Click on Get Started button
    await page
      .getByRole('link', { name: /Get Started/i })
      .first()
      .click()

    // Wait for navigation
    await page.waitForURL('**/auth/signup')

    // Check if we're on the sign up page
    expect(page.url()).toContain('/auth/signup')
  })

  test('should display features section', async ({ page }) => {
    // Scroll to features section
    await page.getByRole('heading', { name: /Everything You Need/i }).scrollIntoViewIfNeeded()

    // Check if feature cards are visible
    await expect(page.getByText(/Online Booking/i)).toBeVisible()
    await expect(page.getByText(/Payment Processing/i)).toBeVisible()
    await expect(page.getByText(/Subscriptions/i)).toBeVisible()
    await expect(page.getByText(/Tournaments/i)).toBeVisible()
  })

  test('should have working footer links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Check if footer is visible
    await expect(page.getByText(/© 2025 MatchUp/i)).toBeVisible()
  })
})

test.describe('Authentication Flow', () => {
  test('should show sign in form', async ({ page }) => {
    await page.goto('/auth/signin')

    // Check if form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should show sign up form', async ({ page }) => {
    await page.goto('/auth/signup')

    // Check if form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByLabel(/full name/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test('should redirect to sign in if not authenticated', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to sign in page
    await page.waitForURL('**/auth/signin')
    expect(page.url()).toContain('/auth/signin')
  })
})
