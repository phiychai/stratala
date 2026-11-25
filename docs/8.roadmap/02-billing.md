---
title: 'Billing'
description: 'Planned provider-agnostic monetization and subscription workflows'
navigation:
  title: 'Billing'
  order: 3
---

## Overview

Provider-agnostic billing is planned for a future release. The current
application does not include billing services, customer synchronization,
subscription endpoints, webhook handlers, or a billing store.

## Planned Scope

- [ ] Select and integrate a provider-agnostic billing abstraction
- [ ] Define subscription, plan, invoice, and payment-method domain models
- [ ] Add authenticated server-side billing operations
- [ ] Add webhook verification, idempotency, and retry handling
- [ ] Build subscription and payment-method UI
- [ ] Add invoice history and usage-based billing support where applicable
- [ ] Add customer synchronization only after the billing integration exists
- [ ] Document provider configuration and operational procedures

## Security Requirements

Any future implementation must keep payment operations server-side, validate
external input, verify webhook signatures, avoid handling raw card data, and
provide audit logging and rate limiting.

## Related Product Goals

Paid subscriptions, tiered memberships, creator analytics, invoicing,
multi-currency support, tax handling, payment recovery, and multiple gateway
options remain product goals. They are not currently implemented.

---

**Next**: [Admin Dashboard](./03-admin-dashboard.md)
