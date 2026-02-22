AI EXPERT PANEL CONSULTATION: SCALABLE NON-REAL TICKET FILTERING
=============================================================================

QUESTION: How do we make non-real ticket filtering scalable for different customers with different automated ticket patterns?

---

JORDAN (DATA ENGINEER)

The pattern recognition problem has three levels:

LEVEL 1: Known patterns (Goal 1)
Build a universal noise detector based on common automated ticket patterns we've seen across help desk tools. This doesn't need to be perfect—it needs to catch 80% of noise on day one.

Common patterns across Zoho, Zendesk, Freshdesk, HubSpot Service Hub:
1. Bulk creation timestamps (>5 tickets created within 60 seconds from same contact)
2. System notification subjects ("Policy acknowledgment", "Auto-reply", "Out of office", "Ticket created notification", "Survey reminder")
3. Zero customer threads (automated tickets rarely have back-and-forth)
4. Instant resolution (created and closed within <5 minutes)
5. Specific channel types (some tools flag automated tickets via Channel = "System" or "Notification")

My recommendation for Goal 1:

\`\`\`typescript
function isNonRealTicket(ticket: Row, allTickets: Row[]): boolean {
  const subject = (ticket['Subject'] || '').toLowerCase().trim()
  const createdTime = new Date(ticket['Created Time'] || '')
  const closedTime = new Date(ticket['Ticket Closed Time'] || '')
  const threads = parseInt(ticket['Number of Threads'] || '0')
  
  // Pattern 1: Known automated subjects
  const automatedKeywords = [
    'policy acknowledgment',
    'auto-reply',
    'out of office',
    'automatic reply',
    'survey reminder',
    'noreply',
    'do not reply',
    'system notification'
  ]
  if (automatedKeywords.some(kw => subject.includes(kw))) {
    return true
  }
  
  // Pattern 2: Bulk created (>5 tickets in 60 seconds)
  const sameMinuteTickets = allTickets.filter(t => {
    const tCreated = new Date(t['Created Time'] || '')
    return Math.abs(tCreated.getTime() - createdTime.getTime()) < 60000
  })
  if (sameMinuteTickets.length > 5) {
    return true
  }
  
  // Pattern 3: Zero customer interaction + instant close
  const resolutionSeconds = (closedTime.getTime() - createdTime.getTime()) / 1000
  if (threads === 0 && resolutionSeconds < 300) {
    return true
  }
  
  return false
}
\`\`\`

This catches Locumate's "Policy acknowledgment required" tickets AND will catch similar patterns for customer #2-5 without any configuration.

LEVEL 2: Per-org exclusion rules (Goal 2-3)
Store org-specific patterns in the database. After admin verifies generated signals, they can flag additional subjects to exclude.

Table: ticket_exclusion_rules
- org_id
- rule_type: "subject_contains" | "subject_exact" | "bulk_timestamp" | "channel"
- rule_value: the string or pattern to match
- created_at

When customer #2 uploads tickets and you discover their noise is "Meeting reminder" tickets, the admin adds one row. Next upload, those are auto-filtered.

LEVEL 3: AI-powered detection (Goal 4+)
Once you have 10+ customers, you have enough labeled data. Train a simple classifier: "Given subject, thread count, resolution time, and channel, is this a real support ticket?" The AI learns that "Policy acknowledgment" + 0 threads + instant close = noise.

---

ALEX (BI ANALYST)

From a data validation perspective, here's what matters:

1. ALWAYS show the filter impact in the admin verification screen:
   "Filtered out 21 tickets (Policy acknowledgment required, bulk created 2024-10-10)"
   The admin needs to see what was excluded to catch false positives.

2. NEVER silently filter. Log every exclusion:
   \`\`\`
   Table: filtered_tickets_log
   - org_id
   - ticket_id
   - subject
   - filtered_reason: "bulk_creation" | "automated_subject" | "zero_threads"
   - filtered_at
   \`\`\`
   This creates an audit trail. If the CS Manager says "Why is my ticket count wrong?" you can show them exactly what was excluded.

3. Add a confidence score to each filter:
   - High confidence: Matches known pattern + bulk timestamp + zero threads
   - Medium confidence: Matches one pattern only
   - Low confidence: Edge case
   
   For high confidence, auto-exclude. For medium/low, flag for admin review during onboarding.

4. Test the filter logic with Locumate's data:
   - Total tickets: 4,100
   - After universal filter: Should remove at least the 21 "Policy acknowledgment" tickets
   - Verify no real tickets (with >1 thread or genuine subjects like "Issue with app") are excluded
   - Target: 95%+ precision (almost no false positives), 80%+ recall (catches most noise)

---

PRODUCT MANAGER

This is a retention feature, not a billing blocker. Here's the phasing:

GOAL 1 (MSS):
Build the universal pattern detector (Jordan's Level 1 code). It's 30-60 minutes of work and catches 80% of noise across any help desk tool. Test it on Locumate's data, verify it works, ship it. Don't overthink it.

The acceptance criteria for Goal 1:
- Locumate's "Policy acknowledgment" tickets are filtered
- Real tickets like "Issue with app" (line 4 in the CSV) are NOT filtered
- Admin sees a summary: "Filtered 21 automated tickets"

GOAL 2:
Add the exclusion rules table. When Locumate's CS Manager says "Actually, we also want to exclude 'Locumate sign up' tickets because those are self-service registrations, not support requests," the admin adds one rule. Takes 5 minutes. Next upload, those are auto-filtered.

GOAL 3:
By customer #5, you have 5 different noise patterns. The universal detector is getting smarter because you've added common patterns from real customers to the keywords list.

GOAL 4:
Enough data for ML-based detection if you want it. But honestly, the rules-based approach might be sufficient forever. Don't build complexity you don't need.

---

UX DESIGNER

The user-facing piece: transparency.

On the signals screen, show:
"Tickets This Month: 4,079 (excludes 21 automated system tickets)"

With a tooltip or expandable section:
"We automatically filter out system-generated tickets like policy acknowledgments and bulk notifications to give you an accurate view of real customer support volume. [See what was filtered]"

If they click "See what was filtered," show:
- 21 tickets: "Policy acknowledgment required" (bulk created Oct 10, 2024)

This builds trust. The user knows we're not hiding data, we're cleaning it intelligently.

---

CTO

Build the universal pattern detector in Goal 1. It's the 80/20 solution—80% effectiveness for 20% of the effort.

The code lives in the generate route, before signal calculation:

\`\`\`typescript
// Filter tickets based on universal patterns
if (tab.name.toLowerCase().includes('ticket')) {
  const originalCount = rows.length
  rows = rows.filter(ticket => !isNonRealTicket(ticket, rows))
  const filteredCount = originalCount - rows.length
  
  console.log(`[v0] Filtered ${filteredCount} non-real tickets from ${originalCount} total`)
  
  // Store for admin verification
  metadata.ticketsFiltered = filteredCount
  metadata.ticketsTotal = originalCount
}
\`\`\`

The exclusion rules table (Goal 2) is a 2-hour addition when you need it. The AI approach (Goal 4) is optional—you might never need it.

---

SUMMARY

GOAL 1: Universal pattern detector (30-60 min)
- Hardcode common noise patterns (policy acknowledgment, auto-reply, bulk timestamps, zero threads + instant close)
- Test on Locumate data: 21 tickets filtered, 0 false positives
- Show admin the filter summary

GOAL 2: Per-org exclusion rules (2-3 hours when needed)
- Add ticket_exclusion_rules table
- Admin UI to add/remove rules
- Re-use saved rules on re-uploads

GOAL 3: Expand universal patterns from real customers
- Each customer's unique noise becomes a pattern in the universal detector
- No per-customer configuration needed—it's built into the system

GOAL 4: Optional ML detection (don't build unless needed)

The key insight: 90% of automated tickets follow recognizable patterns. A rules-based system with smart defaults handles this better than asking every customer to configure filters manually.

---

ACCEPTANCE CRITERIA FOR GOAL 1

1. Create isNonRealTicket() function with universal pattern detection
2. Filter tickets before signal calculation
3. Log filtered count in metadata
4. Admin verification screen shows: "Filtered X tickets (reasons)"
5. Test cases pass:
   - "Policy acknowledgment required" tickets → filtered
   - "Issue with app" tickets → NOT filtered
   - Bulk-created tickets (>5 in 60 seconds) → filtered
   - Normal tickets with threads and reasonable resolution time → NOT filtered
6. Tickets This Month signal shows: 4,079 (not 4,100)
7. Avg Resolution Time excludes the 306-day bulk tickets

TIME ESTIMATE: 30-60 minutes
