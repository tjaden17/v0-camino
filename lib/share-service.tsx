/**
 * Signal Share Service
 * 
 * Enables sharing signal insights via clipboard, Slack, or email
 */

import { createAdminClient } from "@/lib/supabase/admin"
import { getInterpretation, type SignalInterpretation } from "@/lib/interpretation-service"
import { getSignalDataPoints } from "@/lib/data-points-service"

export interface ShareOptions {
  include_metric?: boolean
  include_meaning?: boolean
  include_kpi_impact?: boolean
  format: "short" | "detailed"
}

export interface ShareSummary {
  text: string
  html?: string
  signalName: string
  signalValue: string
  changePercent: string
}

export interface ShareRecord {
  id: string
  signal_id: string
  shared_by: string
  share_type: "copy" | "slack" | "email"
  destination?: string
  summary_text: string
  created_at: string
}

/**
 * Generate a shareable summary for a signal
 */
export async function generateShareSummary(
  signalId: string,
  options: ShareOptions = { format: "short", include_metric: true, include_meaning: true }
): Promise<ShareSummary | null> {
  const supabase = createAdminClient()

  // Fetch signal
  const { data: signal, error } = await supabase
    .from("signals")
    .select("*")
    .eq("id", signalId)
    .single()

  if (error || !signal) {
    console.error("[v0] Signal not found:", signalId)
    return null
  }

  // Get latest data points from Neon signal_data_points
  const dataPoints = await getSignalDataPoints(signalId, { limit: 2 })

  const latestValue = dataPoints[0]?.value ?? 0
  const previousValue = dataPoints[1]?.value ?? 0
  const changePercent = previousValue !== 0 
    ? ((latestValue - previousValue) / previousValue) * 100 
    : 0

  // Get interpretation if needed
  let interpretation: SignalInterpretation | null = null
  if (options.include_meaning || options.include_kpi_impact) {
    const result = await getInterpretation(signalId)
    interpretation = result?.interpretation || null
  }

  // Build summary based on format
  const summary = buildSummaryText({
    signal,
    latestValue,
    changePercent,
    interpretation,
    options,
  })

  return {
    text: summary.text,
    html: options.format === "detailed" ? summary.html : undefined,
    signalName: signal.name,
    signalValue: `${latestValue}${signal.unit ? ` ${signal.unit}` : ""}`,
    changePercent: `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%`,
  }
}

/**
 * Share to another user (in-app notification)
 */
export async function shareToUser(
  signalId: string,
  fromUserId: string,
  toUserId: string,
  message?: string
): Promise<boolean> {
  const supabase = createAdminClient()

  // Generate summary
  const summary = await generateShareSummary(signalId, { format: "short", include_metric: true, include_meaning: true })
  if (!summary) return false

  // Create notification (if notifications table exists)
  try {
    await supabase.from("notifications").insert({
      user_id: toUserId,
      type: "signal_share",
      title: `Signal shared: ${summary.signalName}`,
      body: message || summary.text,
      data: { signal_id: signalId, from_user_id: fromUserId },
      read: false,
    })
  } catch (e) {
    console.log("[v0] Notifications table may not exist, skipping notification")
  }

  // Log the share
  await logShare(signalId, fromUserId, "copy", toUserId, summary.text)

  return true
}

/**
 * Share via email (uses Resend)
 */
export async function shareViaEmail(
  signalId: string,
  fromUserId: string,
  toEmail: string,
  customMessage?: string
): Promise<boolean> {
  const supabase = createAdminClient()

  // Get sender info
  const { data: sender } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", fromUserId)
    .single()

  // Generate detailed summary
  const summary = await generateShareSummary(signalId, {
    format: "detailed",
    include_metric: true,
    include_meaning: true,
    include_kpi_impact: true,
  })

  if (!summary) return false

  // Build email content
  const emailHtml = buildEmailTemplate({
    senderName: sender?.full_name || "A colleague",
    signalName: summary.signalName,
    signalValue: summary.signalValue,
    changePercent: summary.changePercent,
    summaryText: summary.text,
    customMessage,
  })

  // Send via Resend (if API key is configured)
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Camino <notifications@camino.app>",
          to: toEmail,
          subject: `Signal Update: ${summary.signalName} ${summary.changePercent}`,
          html: emailHtml,
        }),
      })

      if (!response.ok) {
        console.error("[v0] Failed to send email:", await response.text())
        return false
      }
    } else {
      console.log("[v0] RESEND_API_KEY not configured, skipping email send")
    }
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return false
  }

  // Log the share
  await logShare(signalId, fromUserId, "email", toEmail, summary.text)

  return true
}

/**
 * Copy signal summary to clipboard (returns formatted text)
 */
export async function copyToClipboard(
  signalId: string,
  userId: string,
  options?: Partial<ShareOptions>
): Promise<string | null> {
  const summary = await generateShareSummary(signalId, {
    format: "short",
    include_metric: true,
    include_meaning: true,
    ...options,
  })

  if (!summary) return null

  // Log the share
  await logShare(signalId, userId, "copy", undefined, summary.text)

  return summary.text
}

/**
 * Share via Slack webhook
 */
export async function shareToSlack(
  signalId: string,
  fromUserId: string,
  webhookUrl: string,
  channel?: string
): Promise<boolean> {
  const summary = await generateShareSummary(signalId, {
    format: "short",
    include_metric: true,
    include_meaning: true,
  })

  if (!summary) return false

  // Build Slack message
  const slackMessage = {
    channel,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `Signal Update: ${summary.signalName}`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Current Value:*\n${summary.signalValue}`,
          },
          {
            type: "mrkdwn",
            text: `*Change:*\n${summary.changePercent}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: summary.text,
        },
      },
    ],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    })

    if (!response.ok) {
      console.error("[v0] Failed to send Slack message")
      return false
    }
  } catch (error) {
    console.error("[v0] Error sending Slack message:", error)
    return false
  }

  // Log the share
  await logShare(signalId, fromUserId, "slack", channel || webhookUrl, summary.text)

  return true
}

/**
 * Get share history for a signal
 */
export async function getShareHistory(signalId: string, limit = 10): Promise<ShareRecord[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("signal_shares")
    .select("*")
    .eq("signal_id", signalId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching share history:", error)
    return []
  }

  return data || []
}

// Helper functions

async function logShare(
  signalId: string,
  userId: string,
  shareType: "copy" | "slack" | "email",
  destination: string | undefined,
  summaryText: string
): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase.from("signal_shares").insert({
    signal_id: signalId,
    shared_by: userId,
    share_type: shareType,
    destination,
    summary_text: summaryText,
  })

  if (error) {
    console.error("[v0] Error logging share:", error)
  }
}

function buildSummaryText(context: {
  signal: any
  latestValue: number
  changePercent: number
  interpretation: SignalInterpretation | null
  options: ShareOptions
}): { text: string; html?: string } {
  const { signal, latestValue, changePercent, interpretation, options } = context

  const parts: string[] = []
  const htmlParts: string[] = []

  // Signal name and value
  if (options.include_metric !== false) {
    const valueStr = `${latestValue}${signal.unit ? ` ${signal.unit}` : ""}`
    const changeStr = `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%`
    const trend = changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat"
    
    parts.push(`${signal.name}: ${valueStr} (${changeStr} ${trend})`)
    htmlParts.push(`<strong>${signal.name}</strong>: ${valueStr} <span style="color: ${changePercent >= 0 ? "green" : "red"}">(${changeStr})</span>`)
  }

  // What it means
  if (options.include_meaning && interpretation?.what_it_means) {
    const meaning = interpretation.what_it_means.why_change_happened || interpretation.what_it_means.why_analysis
    if (meaning) {
      parts.push(`Why: ${meaning}`)
      htmlParts.push(`<p><strong>Why:</strong> ${meaning}</p>`)
    }
  }

  // KPI impact
  if (options.include_kpi_impact && interpretation?.so_what?.kpi_impact) {
    parts.push(`Impact: ${interpretation.so_what.kpi_impact}`)
    htmlParts.push(`<p><strong>Impact:</strong> ${interpretation.so_what.kpi_impact}</p>`)
  }

  const text = parts.join("\n\n")
  const html = options.format === "detailed" ? htmlParts.join("\n") : undefined

  return { text, html }
}

function buildEmailTemplate(context: {
  senderName: string
  signalName: string
  signalValue: string
  changePercent: string
  summaryText: string
  customMessage?: string
}): string {
  const { senderName, signalName, signalValue, changePercent, summaryText, customMessage } = context

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
    <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px;">Signal Update</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">${senderName} shared a signal with you</p>
  </div>
  
  ${customMessage ? `<p style="color: #374151; font-size: 14px; background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 20px;">"${customMessage}"</p>` : ""}
  
  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
    <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px;">${signalName}</h2>
    
    <div style="display: flex; gap: 24px; margin-bottom: 20px;">
      <div>
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Current Value</p>
        <p style="color: #111827; font-size: 24px; font-weight: bold; margin: 0;">${signalValue}</p>
      </div>
      <div>
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Change</p>
        <p style="color: ${changePercent.startsWith("+") ? "#10b981" : "#ef4444"}; font-size: 24px; font-weight: bold; margin: 0;">${changePercent}</p>
      </div>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
      <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">${summaryText.replace(/\n/g, "<br>")}</p>
    </div>
  </div>
  
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
    Sent via <a href="https://camino.app" style="color: #6366f1;">Camino</a>
  </p>
</body>
</html>`
}
