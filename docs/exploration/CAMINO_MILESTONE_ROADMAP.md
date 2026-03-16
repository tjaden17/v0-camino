# Camino — Milestone Roadmap

> Status: Draft for founder review
> Version: 1.0
> Date: March 2026
> Context: Single non-technical founder, ADHD, 6-month target to sustainability

---

## The Math That Drives Everything

**Your sustainability target:** $60K AUD/year = $5K AUD/month MRR

**Your price:** $199/seat/month

**Expected seats per customer:** 3-5 (using 4 as planning average)

**Revenue per customer:** $199 × 4 = **$796/month**

**Customers needed for sustainability:** $5,000 / $796 = **6-7 customers**

| Seats per customer | Customers needed for $5K MRR |
|---|---|
| 3 seats | 9 customers |
| 4 seats | 7 customers |
| 5 seats | 5 customers |

**This is the number that matters: 7 customers.**

Everything in this roadmap is designed to get you to 7 paying customers within 6 months.

---

## Milestone Overview

| Milestone | Objective | Target | Timeframe | Revenue |
|---|---|---|---|---|
| M1 | First Payment | Surge pays, card charged | Weeks 1-10 | $800/month |
| M2 | Prove Retention | Surge engaged + paid for 3 months | Weeks 11-22 | $800/month |
| M3 | Prove Repeatable | 3 paying customers | Weeks 12-20 | $2,400/month |
| M4 | Reach Sustainability | 7 paying customers | Weeks 20-30 | $5,000/month |
| M5 | Prove Scale | 15+ customers, ready to hire | Months 9-18 | $10K+/month |

**Note:** M2 and M3 run in parallel. You don't wait for 3-month retention proof before finding customers 2 and 3. You do both simultaneously.

---

---

# MILESTONE 1: First Payment

## Strategic Objective

Prove that one real customer will pay real money for the product you've built. Everything else is hypothesis until money moves.

## Timeframe

Weeks 1-10 (10 weeks from today)

## Exit Criteria

| # | Criteria | Measurement | Status |
|---|---|---|---|
| 1.1 | Surge has completed onboarding call | Call recording exists, notes in customer_profiles table | ☐ |
| 1.2 | Surge's data is in the system | 3 data sources uploaded: Deals, Desk, Shifts | ☐ |
| 1.3 | Signal cards match Zoho exactly | Surge verbally confirms win rate, pipeline value, fill rate match his calculations | ☐ |
| 1.4 | Surge has received at least 2 weekly briefs | Brief delivery log shows 2+ briefs sent and opened | ☐ |
| 1.5 | Surge has seen one cross-table insight | The "operational but not subscribed" signal has been delivered | ☐ |
| 1.6 | Surge agrees the product is worth paying for | Verbal or written confirmation before payment setup | ☐ |
| 1.7 | Credit card is on file | Stripe customer record exists with valid payment method | ☐ |
| 1.8 | First invoice has been charged successfully | Stripe shows successful charge for month 1 | ☐ |

## Exit Gate

**"Has Surge's credit card been charged for month 1?"**

Yes = Milestone complete. Move to M2.
No = Milestone not complete. Diagnose why.

## Leading Indicators (How You Know You're On Track)

| Week | Indicator | What it tells you |
|---|---|---|
| Week 2 | Onboarding call completed | You have the context to personalise signals |
| Week 3 | First data upload successful | The ingest layer works |
| Week 4 | Surge confirms numbers match | Trust foundation is established |
| Week 5 | First brief delivered and opened | The delivery mechanism works |
| Week 6 | Surge responds to brief with a question or comment | He's engaged, not ignoring it |
| Week 8 | Surge says "this is useful" unprompted | Value is landing |
| Week 9 | Payment conversation happens without resistance | He's ready to pay |

## Critical Path

This is the sequence where, if any step is late, the whole milestone is late.

```
Week 0: Pre-work complete (env vars, Supabase schema, Surge call scheduled)
        ↓
Week 1-2: Onboarding call → data uploaded → schema fingerprint validated
        ↓
Week 3: SQL views live → signal cards rendering → Surge confirms numbers match
        ↓
Week 4-5: Signal ranking prompt tuned → first brief generated → delivered to Surge
        ↓
Week 6-7: Second brief delivered → Surge engagement confirmed → iterate on brief quality
        ↓
Week 8: Cross-table insight delivered → "I didn't know that" moment
        ↓
Week 9: Payment conversation → Stripe setup
        ↓
Week 10: First charge successful
```

**The critical dependency:** Surge confirming numbers match (Week 3-4). If this doesn't happen, nothing downstream matters. He won't trust the briefs, he won't pay.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Surge's data doesn't match expected schema | Medium | High | Pre-validate CSV structure before onboarding call. Have Sam review sample file. |
| Numbers don't match Zoho | Medium | Critical | Build verification UI (admin toggle) before going live. Never show Surge a number you haven't validated with Sam first. |
| Surge is too busy to engage | Medium | High | Schedule brief review calls for weeks 5 and 7. Don't rely on async engagement alone. |
| Stripe integration issues | Low | Medium | Set up Stripe in week 1, test with your own card in week 5, not week 9. |
| Surge wants features not in MSS | Medium | Medium | Set expectations in onboarding call. "Here's what's in V1, here's what's coming." |

## ADHD-Friendly Weekly Focus

| Week | Your ONE job this week |
|---|---|
| 1 | Get the onboarding call done and data uploaded |
| 2 | Get schema fingerprint validated with Sam |
| 3 | Get Surge to confirm one number matches Zoho |
| 4 | Get the first brief generated and sent |
| 5 | Get Surge to respond to the brief |
| 6 | Get the second brief sent and opened |
| 7 | Get Surge to say something positive unprompted |
| 8 | Get the cross-table insight in front of him |
| 9 | Get the payment conversation done |
| 10 | Get the card charged |

One job. Every week. If you do that job, you're on track.

---

---

# MILESTONE 2: Prove Retention

## Strategic Objective

Prove that Surge keeps using the product and keeps paying. A single payment means nothing. Three months of payment + engagement means you have a product worth scaling.

## Timeframe

Weeks 11-22 (runs parallel to M3 starting week 12)

## Exit Criteria

| # | Criteria | Measurement | Status |
|---|---|---|---|
| 2.1 | Surge has paid for 3 consecutive months | Stripe shows 3 successful charges | ☐ |
| 2.2 | Surge has opened 10+ weekly briefs | Email open tracking or app analytics | ☐ |
| 2.3 | Surge has taken action on at least 2 signals | He mentions in a call or message that he acted on something Camino surfaced | ☐ |
| 2.4 | Surge has given you a testimonial or referral | Written quote, or intro to another potential customer | ☐ |
| 2.5 | Sam is actively using the admin verification layer | Login logs show Sam accessing Camino weekly | ☐ |
| 2.6 | Brief quality has improved based on feedback | At least 2 brief iterations shipped based on Surge's input | ☐ |

## Exit Gate

**"Has Surge paid for 3 months AND opened 10+ briefs AND taken action on at least 2 signals?"**

Yes = Retention proven. You have product-market fit signal.
No = Diagnose which part failed. Payment failure = value problem. Engagement failure = habit problem. Action failure = relevance problem.

## Leading Indicators

| Week | Indicator | What it tells you |
|---|---|---|
| Week 11 | Month 2 payment succeeds without issue | No buyer's remorse |
| Week 13 | Surge replies to a brief unprompted | Habit is forming |
| Week 15 | Surge mentions Camino in a conversation with his team | It's becoming part of how he runs the business |
| Week 17 | Month 3 payment succeeds | Retention is real |
| Week 19 | Surge refers someone or gives testimonial | He's an advocate, not just a user |

## Critical Path

```
Week 11: Month 2 charges successfully
        ↓
Week 12-14: Weekly briefs continue. You check in with Surge bi-weekly.
        ↓
Week 15: You explicitly ask: "What have you done differently because of Camino?"
        ↓
Week 17: Month 3 charges successfully
        ↓
Week 18-20: You ask for testimonial and referrals
        ↓
Week 22: Retention milestone complete
```

**The critical dependency:** Surge taking action on signals. If he reads briefs but never acts, the product is interesting but not valuable. You need evidence of behaviour change.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Surge reads briefs but doesn't act | Medium | High | Add "suggested action" to every signal. Follow up in calls: "Did you do anything with the agency usage signal?" |
| Brief quality stagnates | Medium | Medium | Schedule explicit feedback sessions at week 12 and 16. Ask: "What's missing? What's irrelevant?" |
| Surge churns at month 3 | Low | Critical | If engagement drops in month 2, intervene immediately. Don't wait for churn to happen. |
| Sam stops using Camino | Medium | Medium | Sam's engagement is your early warning system. If she stops logging in, trust is eroding. Check in with her directly. |

## ADHD-Friendly Weekly Focus

| Week | Your ONE job this week |
|---|---|
| 11 | Confirm month 2 payment processed |
| 12 | Check in with Surge — is the brief still useful? |
| 13 | Ship one brief improvement based on feedback |
| 14 | Check Sam's engagement — is she still using it? |
| 15 | Ask Surge: "What have you done differently because of Camino?" |
| 16 | Ship another brief improvement |
| 17 | Confirm month 3 payment processed |
| 18 | Ask for testimonial |
| 19 | Ask for referral introductions |
| 20-22 | Document what worked for repeating with next customers |

---

---

# MILESTONE 3: Prove Repeatable

## Strategic Objective

Prove that Camino works for more than one customer. Surge might be an outlier. You need 2 more paying customers to prove the pattern repeats.

## Timeframe

Weeks 12-20 (starts in parallel with M2, overlaps intentionally)

## Exit Criteria

| # | Criteria | Measurement | Status |
|---|---|---|---|
| 3.1 | 3 total paying customers (Surge + 2 new) | Stripe shows 3 active subscriptions | ☐ |
| 3.2 | At least one customer is NOT from Surge's referral | Proves cold/inbound channel works | ☐ |
| 3.3 | Onboarding time per customer has decreased | Customer 3 onboards faster than customer 2 | ☐ |
| 3.4 | All 3 customers have confirmed numbers match their source | Trust foundation replicated | ☐ |
| 3.5 | Lead magnet is live and generating interest | Landing page live, at least 10 signups for free assessment | ☐ |

## Exit Gate

**"Do you have 3 paying customers, at least one from a non-referral channel?"**

Yes = The pattern repeats. You have a repeatable business.
No = Diagnose. If referrals convert but cold doesn't, you have a sales problem. If nobody converts, you have a value problem.

## Leading Indicators

| Week | Indicator | What it tells you |
|---|---|---|
| Week 12 | First referral intro from Surge | Referral channel is open |
| Week 14 | First cold outreach response | Cold channel has potential |
| Week 15 | Customer 2 signs up | Pattern might repeat |
| Week 16 | Customer 2 confirms numbers match | Trust foundation works for others |
| Week 17 | Lead magnet landing page live | Inbound channel building |
| Week 18 | Customer 3 signs up | Pattern confirmed |

## Critical Path

```
Week 12: Ask Surge for 2-3 referral intros. Start cold outreach (20 emails/week).
        ↓
Week 13-14: Referral conversations happening. Cold responses coming in.
        ↓
Week 15: Customer 2 onboarding call. First payment.
        ↓
Week 16: Customer 2 data uploaded. Numbers verified.
        ↓
Week 17: Lead magnet landing page shipped. Start driving traffic.
        ↓
Week 18-19: Customer 3 onboarding (ideally from cold/inbound, not referral).
        ↓
Week 20: 3 paying customers confirmed.
```

**The critical dependency:** Surge giving you referral intros. This is your highest-converting channel. If he doesn't intro anyone, you're relying entirely on cold outreach, which is 10x slower.

## Your Customer Acquisition Plan

| Channel | Volume | Conversion | Customers/month |
|---|---|---|---|
| Surge referrals | 3 intros | 50% close rate | 1-2 customers |
| Cold outreach | 80 emails/month | 2% response × 25% close | 0.4 customers |
| Lead magnet inbound | 20 signups/month | 10% convert to call × 30% close | 0.6 customers |

**Total expected:** 2-3 customers/month once all channels are running.

You need 2 customers in 8 weeks. This is achievable if Surge refers even one person who converts.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Surge doesn't refer anyone | Medium | High | Ask explicitly in week 12. Make it easy — "Who else do you know who struggles with this?" Give him a one-liner to forward. |
| Cold outreach gets no responses | High | Medium | Expected. Don't rely on cold alone. Focus on referrals and lead magnet. |
| Customer 2's data is very different from Surge's | Medium | Medium | This is actually good — it forces you to generalize. But budget extra time for schema mapping. |
| Onboarding takes too long | Medium | Medium | Document everything from Surge's onboarding. Create a checklist. Systematize. |

## ADHD-Friendly Weekly Focus

| Week | Your ONE job this week |
|---|---|
| 12 | Ask Surge for referral intros |
| 13 | Send 20 cold emails + follow up on referral intros |
| 14 | Book onboarding call for customer 2 |
| 15 | Onboard customer 2 and get first payment |
| 16 | Verify customer 2's numbers match their source |
| 17 | Ship lead magnet landing page |
| 18 | Book onboarding call for customer 3 |
| 19 | Onboard customer 3 and get first payment |
| 20 | Verify customer 3's numbers match |

---

---

# MILESTONE 4: Reach Sustainability

## Strategic Objective

Reach $5K MRR — the point where Camino pays you $60K/year and is a real business, not a side project.

## Timeframe

Weeks 20-30 (months 5-7)

## The Math

- Current: 3 customers × $796/month = $2,400 MRR
- Target: $5,000 MRR
- Gap: $2,600 MRR = 3-4 more customers
- Total customers needed: **7**

## Exit Criteria

| # | Criteria | Measurement | Status |
|---|---|---|---|
| 4.1 | 7 paying customers | Stripe shows 7 active subscriptions | ☐ |
| 4.2 | MRR is $5,000+ | Stripe MRR calculation | ☐ |
| 4.3 | Churn is below 10% monthly | No more than 1 customer lost in the milestone period | ☐ |
| 4.4 | At least 3 customers came from inbound/lead magnet | Proves scalable acquisition channel | ☐ |
| 4.5 | Onboarding is partially self-service | Customers can upload data without a founder call (call is optional for goal-setting) | ☐ |
| 4.6 | You have not worked more than 50 hours/week average | Sustainable pace | ☐ |

## Exit Gate

**"Is MRR at $5,000+ with less than 10% monthly churn?"**

Yes = Sustainability achieved. Camino is a real business.
No = Diagnose. If MRR is short, acquisition is the problem. If churn is high, retention is the problem.

## Critical Path

```
Week 20: 3 customers, $2,400 MRR
        ↓
Week 22: Customer 4 signs (referral or inbound)
        ↓
Week 24: Customer 5 signs (inbound from lead magnet)
        ↓
Week 26: Customer 6 signs + self-service onboarding flow shipped
        ↓
Week 28: Customer 7 signs
        ↓
Week 30: $5K MRR confirmed. No churn in period.
```

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Lead magnet doesn't convert | Medium | High | Test different offers. Try: free benchmark, free audit call, free 2-week trial. |
| Early customers churn | Medium | Critical | Monthly check-in calls with every customer. Don't let problems fester. |
| Onboarding becomes bottleneck | High | High | You can't do 7 onboarding calls while also building. Self-service data upload is mandatory by week 26. |
| Burnout | High | Critical | Track hours weekly. If you're over 50 hours for 2 weeks straight, something is wrong with the process. |

## ADHD-Friendly Weekly Focus

| Week | Your ONE job this week |
|---|---|
| 20-21 | Systematize onboarding — document every step |
| 22-23 | Close customer 4 |
| 24-25 | Close customer 5 + ship self-service data upload |
| 26-27 | Close customer 6 |
| 28-29 | Close customer 7 |
| 30 | Confirm $5K MRR and celebrate |

---

---

# MILESTONE 5: Prove Scale

## Strategic Objective

Prove Camino can grow beyond you. This means: more customers than you can personally onboard, systems that run without daily intervention, and enough revenue to consider hiring.

## Timeframe

Months 9-18

## The Math

- Target: 15+ customers
- Revenue: $12K+ MRR ($144K/year)
- Enough to: hire a part-time CSM or contractor

## Exit Criteria

| # | Criteria | Measurement | Status |
|---|---|---|---|
| 5.1 | 15+ paying customers | Stripe dashboard | ☐ |
| 5.2 | MRR is $10K+ | Stripe MRR | ☐ |
| 5.3 | Churn is below 5% monthly | Stable customer base | ☐ |
| 5.4 | Onboarding is fully self-service | No founder call required | ☐ |
| 5.5 | At least one integration is native (not CSV) | Zoho API or similar | ☐ |
| 5.6 | You have hired or contracted help | CSM, support, or dev help | ☐ |
| 5.7 | Weekly briefs generate without manual intervention | Fully automated pipeline | ☐ |

## Exit Gate

**"Can Camino acquire and retain customers without you being involved in every step?"**

Yes = You have a scalable business. Consider raising money or accelerating growth.
No = You have a high-paying consulting practice. Decide if that's what you want.

---

---

# Summary: The Path to $60K/Year

| Milestone | When | Customers | MRR | Key unlock |
|---|---|---|---|---|
| M1 | Week 10 | 1 | $800 | First payment proves value |
| M2 | Week 22 | 1 | $800 | 3-month retention proves habit |
| M3 | Week 20 | 3 | $2,400 | Repeatability proves pattern |
| M4 | Week 30 | 7 | $5,000 | Sustainability proves business |
| M5 | Month 18 | 15+ | $10K+ | Scale proves leverage |

**Your 6-month goal ($5K MRR) requires 7 customers.**

That's one customer every 3-4 weeks after Surge.

With referrals from Surge, a lead magnet generating inbound interest, and light cold outreach, this is achievable for a solo founder.

---

# The One Page You Print and Put On Your Wall

```
CAMINO — THE ONLY NUMBERS THAT MATTER

Sustainability = $5,000 MRR = 7 customers

Week 10:  1 customer (Surge paying)
Week 15:  2 customers
Week 18:  3 customers  
Week 22:  4 customers
Week 25:  5 customers
Week 27:  6 customers
Week 30:  7 customers → SUSTAINABILITY

Every week ask yourself:
"Am I closer to the next customer than I was last week?"

If yes, keep going.
If no, diagnose why and fix it.
```

---

*Document version 1.0 — March 2026*
