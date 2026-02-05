# Camino - CXO Frequently Asked Questions

## 1. How long does it take to implement Camino?

**Answer:** Camino is designed for rapid deployment. Most companies are up and running in under 2 weeks:
- **Week 1**: Connect your first data source (HubSpot, Salesforce, or similar) and configure 5-10 key signals relevant to your role
- **Week 2**: Onboard teams, set up signal ownership, and establish your signal system hierarchy

Unlike traditional BI tools that require months of data modeling and dashboard building, Camino's smart signal templates work out-of-the-box. You'll see your first insights on day one.

**Proof point**: Our pilot customers saw their first actionable insights within 48 hours of connecting their CRM.

---

## 2. How is this different from our existing BI/analytics tools like Tableau or Looker?

**Answer:** Traditional BI tools are built for analysts to create reports. Camino is built for executives and managers to make faster decisions.

**Key differences:**
- **Focus**: BI tools show *what happened*. Camino shows *what matters now* and *what to do about it*
- **Speed**: BI requires building dashboards and writing queries. Camino auto-generates insights from your data sources
- **Audience**: BI is for data teams. Camino is for decision-makers who don't have time to dig through dashboards
- **Proactive**: BI is pull-based (you go find insights). Camino is push-based (insights come to you)

**Think of it this way**: Looker is your data warehouse. Camino is your executive assistant who watches your data and tells you what needs your attention.

---

## 3. What data sources does Camino integrate with?

**Answer:** Camino integrates with 25+ enterprise data sources across all business functions:

**Sales & Marketing**: Salesforce, HubSpot, Gong, Google Analytics, Meta Ads  
**Product & Engineering**: Amplitude, Mixpanel, Jira, Linear, GitHub, Datadog, PagerDuty  
**Customer Success**: Zendesk, Gainsight, Intercom  
**Finance & Operations**: Netsuite, Xero, Stripe, QuickBooks  
**Data & Analytics**: Snowflake, BigQuery, Databricks, Looker  
**Design & Research**: Figma, Maze, UserTesting, Dovetail  

We add new integrations monthly based on customer requests. If you have a mission-critical source we don't support yet, we can typically add it within 4-6 weeks.

---

## 4. How do you ensure our data is secure?

**Answer:** Security is non-negotiable at Camino. We implement enterprise-grade security standards:

**Infrastructure**:
- SOC 2 Type II compliant (audit in progress)
- Data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Hosted on AWS/GCP with multi-region redundancy
- Zero-trust architecture with role-based access control

**Data Access**:
- We never store your raw data - only computed metrics and aggregated insights
- OAuth 2.0 authentication for all data sources
- You control what data Camino can access (read-only permissions)
- Single Sign-On (SSO) support via SAML 2.0

**Compliance**:
- GDPR compliant
- CCPA compliant
- HIPAA-ready architecture (for healthcare customers)

**Your data never leaves your control**: You can revoke Camino's access to any data source at any time, and we'll immediately delete all associated insights.

---

## 5. What's the ROI? How do we measure success?

**Answer:** Our customers typically see ROI in three key areas:

**1. Time Savings** (Quantifiable)
- **Before Camino**: Executives spend 5-10 hours/week gathering data from multiple tools and asking teams for updates
- **After Camino**: Reduce this to 1-2 hours/week reviewing pre-generated insights
- **ROI**: 4-8 hours/week × $500-1000/hour (executive time value) = **$100K-400K annually** for a 10-person leadership team

**2. Faster Decision-Making** (Strategic Value)
- Identify problems 2-4 weeks earlier (declining win rates, churn signals, engineering bottlenecks)
- Course-correct before small issues become big problems
- Example: One customer caught a 15% drop in activation rate within 3 days instead of discovering it in their quarterly review - saved an estimated $2M in lost ARR

**3. Better Alignment** (Organizational Impact)
- Shared signal system ensures everyone is tracking toward the same goals
- Reduces "reporting tax" - teams stop creating one-off reports for leadership
- Example: Marketing and Sales teams at one customer now share 12 common signals, reducing cross-functional friction by 40%

**Typical payback period**: 3-4 months for mid-market companies, 1-2 months for enterprise.

---

## 6. Will my team actually use this, or will it become shelfware?

**Answer:** We've designed Camino specifically to avoid the "dashboard graveyard" problem. Here's how:

**Low adoption barriers**:
- **Mobile-first**: Executives check insights on their phone in under 60 seconds
- **Zero learning curve**: No training required - if you can read a text message, you can use Camino
- **Personalized**: Each user sees only the signals relevant to their role and goals

**Built-in engagement loops**:
- Daily/weekly digest emails with your most important signals
- Slack/Teams notifications for critical changes
- Collaborative features: Share signals, add context, discuss implications

**Proof of adoption**:
- 85% of pilot users log in at least 3x per week
- Average session time: 4 minutes (people find what they need quickly)
- 73% of shared insights receive team engagement within 24 hours

**Risk mitigation**: We offer a 30-day pilot with 5-10 users. If adoption is below 70% after 30 days, we'll refund your implementation fee.

---

## 7. Can we customize signals for our unique business model?

**Answer:** Absolutely. Camino provides both pre-built templates and full customization:

**Out-of-the-box** (Day 1):
- 50+ pre-built signal templates across all functions
- Automatically configured based on your industry and role

**Light customization** (Week 1-2):
- Modify thresholds and benchmarks to match your business
- Add custom formulas using your specific metrics
- Tag signals to teams and assign ownership

**Advanced customization** (Ongoing):
- Build completely custom signals from any data in your connected sources
- Create multi-stage signals (e.g., "if conversion rate drops AND CAC increases, alert me")
- API access for data science teams to build ML-powered signals

**Examples of custom signals our customers have built**:
- SaaS: "PLG-to-Sales handoff velocity" (tracks time from free trial to first sales touch)
- Marketplace: "Supply-demand imbalance score" (predicts when certain categories will have inventory issues)
- FinTech: "Regulatory risk index" (monitors compliance metrics across jurisdictions)

---

## 8. What happens if Camino shows conflicting data compared to our existing reports?

**Answer:** This is actually a feature, not a bug - and it happens for good reasons:

**Why differences occur**:
- **Data freshness**: Camino updates in real-time or daily, while monthly reports may use week-old data
- **Calculation methods**: Your finance team might calculate "win rate" differently than your sales team
- **Data sources**: Camino pulls from source systems (Salesforce), while reports might use a data warehouse with transformation lag

**How we handle this**:
- **Full transparency**: Every signal shows exactly how it's calculated and which data source it uses
- **Reconciliation mode**: Compare Camino's calculation with your existing reports side-by-side
- **Custom formulas**: Override Camino's default calculation with your company's preferred method

**What customers discover**:
- Often, the "discrepancy" reveals that different teams were using different definitions all along
- Camino becomes the source of truth because everyone can see the same calculation
- 60% of pilot customers end up changing their existing reports to match Camino's methodology because it's clearer

**Our commitment**: If Camino shows incorrect data due to a calculation bug, we fix it within 48 hours and provide a post-mortem.

---

## 9. What if our data is messy or incomplete?

**Answer:** Most companies have messy data - you're not alone. Camino is built to work with real-world data:

**How we handle data quality issues**:
- **Smart defaults**: If a field is missing, Camino uses intelligent fallbacks (e.g., if "close date" is blank, use "last activity date")
- **Confidence indicators**: Signals show a confidence score - "High confidence" (complete data) vs "Medium confidence" (estimated data)
- **Anomaly detection**: Camino flags unusual patterns that might indicate data quality issues
- **Progressive enhancement**: Signals get more accurate as your data quality improves

**Data hygiene features**:
- **Health checks**: Weekly reports showing data completeness by source
- **Suggested fixes**: "80% of your Salesforce deals are missing 'close reason' - this affects your loss analysis"
- **Ignore rules**: Exclude known bad data (e.g., test accounts, internal deals)

**Reality check**: Our pilot customers typically start with 60-70% data completeness and still get massive value. As they see the impact, they're motivated to clean up their data.

**Bottom line**: Camino works with your data as it is today, and helps you make it better over time.

---

## 10. What support do we get, and what happens if something breaks?

**Answer:** We provide white-glove support because executive tools can't afford downtime:

**Implementation support**:
- **Dedicated onboarding specialist**: 1:1 sessions to set up your first 10 signals
- **Weekly check-ins**: First month, we meet weekly to ensure you're getting value
- **Training materials**: Video tutorials, role-specific guides, best practices

**Ongoing support**:
- **Priority support**: Email/Slack response within 2 hours (business hours)
- **Escalation path**: Critical issues go directly to our engineering team
- **Customer Success Manager**: Quarterly business reviews to optimize your signal system

**Reliability commitments**:
- **99.9% uptime SLA**: If we miss this, you get service credits
- **Monitoring**: We track your signal freshness - if data stops updating, we alert you proactively
- **Incident communication**: Real-time status page + direct notifications for any issues

**Additional resources**:
- **Community**: Access to our customer Slack with 200+ executives sharing signal strategies
- **Best practices library**: 100+ signal templates contributed by other customers
- **Product roadmap input**: Quarterly sessions where you can influence what we build next

**Peace of mind**: We've maintained 99.95% uptime over the last 12 months, and our average response time for critical issues is 34 minutes.

---

## Ready to see Camino in action?

**Next Steps**:
1. **30-minute demo**: See Camino with your data sources
2. **2-week pilot**: 5-10 users, connect 2-3 data sources, no commitment
3. **ROI assessment**: We'll quantify your time savings and decision-making improvement

**Contact**: [Your contact information]

**Risk-free guarantee**: If you don't see measurable value within 30 days, we'll refund your pilot investment.
