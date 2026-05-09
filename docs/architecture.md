# Architecture Notes

## Current implementation style

This repo uses static seed data to make the GitHub handoff easy and portable.

## Production target architecture

### Frontend
- Next.js App Router
- SSR and static generation for SEO pages
- Component library with design tokens

### Backend services
- Auth service
- Lead routing service
- Pricing benchmark service
- Subscription and billing service
- Moderation service

### Data model highlights
- Workshops with verification and subscriptions
- Leads tied to city, vehicle, and status
- Reviews with job verification
- Benchmarks by make, city, and service type

### Search and SEO
- City x make x service pages
- Structured data for mechanic listings
- Content pages for price queries and repair education

### Messaging
- WhatsApp-first alerts for workshops
- SMS fallback
- Email confirmations for consumers

### Commerce layer
- Fitment-aware products
- Quote-to-parts matching
- Workshop fulfilment or direct shipping
