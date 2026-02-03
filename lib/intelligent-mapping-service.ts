// 3-Tier Intelligent Column Mapping Service
// Tier 1: Auto-map (95-100% confidence)
// Tier 2: Suggest (80-94% confidence)
// Tier 3: Offer choices (60-79% confidence)

import type { DetectedColumn } from "./signal-discovery-service"

export interface MappingConfidence {
  csvColumn: string
  targetField: string
  confidence: number // 0-100
  tier: 1 | 2 | 3 | "unmapped"
  reasoning: string
  alternatives?: MappingAlternative[]
}

export interface MappingAlternative {
  targetField: string
  confidence: number
  reasoning: string
}

export interface IntelligentMappingResult {
  autoMapped: MappingConfidence[] // Tier 1: 95-100%
  suggestions: MappingConfidence[] // Tier 2: 80-94%
  choices: MappingConfidence[] // Tier 3: 60-79%
  unmapped: string[] // <60%
}

export interface FieldDefinition {
  key: string
  label: string
  type: "string" | "number" | "date" | "boolean"
  required: boolean
  description: string
  synonyms: string[]
  patterns: RegExp[]
  valueHints?: string[] // Sample values that indicate this field
}

// Universal field definitions for signal generation
export const UNIVERSAL_FIELDS: FieldDefinition[] = [
  {
    key: "unique_id",
    label: "Unique ID",
    type: "string",
    required: true,
    description: "Unique identifier for each record",
    synonyms: ["id", "ticket_id", "deal_id", "lead_id", "customer_id", "user_id", "opportunity_id", "case_id"],
    patterns: [/id$/i, /identifier/i, /number/i, /^(ticket|deal|lead|case|opportunity)[\s_-]?(num|no|#)/i],
    valueHints: ["TICK-", "DEAL-", "LEAD-", "#"],
  },
  {
    key: "name",
    label: "Name",
    type: "string",
    required: false,
    description: "Name or title of the record",
    synonyms: ["title", "subject", "account_name", "company_name", "deal_name", "opportunity_name"],
    patterns: [/name$/i, /title$/i, /subject$/i],
  },
  {
    key: "value",
    label: "Value/Amount",
    type: "number",
    required: false,
    description: "Numeric value or amount",
    synonyms: ["amount", "revenue", "deal_value", "total", "price", "cost", "metric_value"],
    patterns: [/amount$/i, /value$/i, /revenue$/i, /total$/i, /price$/i],
    valueHints: ["$", "USD", "€"],
  },
  {
    key: "status",
    label: "Status",
    type: "string",
    required: false,
    description: "Current status of the record",
    synonyms: ["state", "stage", "phase", "ticket_status", "deal_stage"],
    patterns: [/status$/i, /state$/i, /stage$/i],
    valueHints: ["open", "closed", "pending", "in progress", "won", "lost"],
  },
  {
    key: "priority",
    label: "Priority",
    type: "string",
    required: false,
    description: "Priority level",
    synonyms: ["importance", "severity", "urgency"],
    patterns: [/priority$/i, /severity$/i, /urgency$/i],
    valueHints: ["high", "medium", "low", "urgent", "critical"],
  },
  {
    key: "created_at",
    label: "Created Date",
    type: "date",
    required: false,
    description: "When the record was created",
    synonyms: ["created_date", "creation_date", "start_date", "opened_date", "submitted_date"],
    patterns: [/creat(ed|ion)[\s_-]?(date|time|at)/i, /start[\s_-]?date/i, /opened/i],
  },
  {
    key: "closed_at",
    label: "Closed Date",
    type: "date",
    required: false,
    description: "When the record was closed/completed",
    synonyms: ["closed_date", "completion_date", "resolved_date", "end_date", "finished_date"],
    patterns: [/clos(ed|ing)[\s_-]?(date|time|at)/i, /end[\s_-]?date/i, /resolv(ed|ing)/i, /complet(ed|ion)/i],
  },
  {
    key: "modified_at",
    label: "Modified Date",
    type: "date",
    required: false,
    description: "When the record was last updated",
    synonyms: ["updated_date", "last_modified", "last_updated", "changed_date"],
    patterns: [
      /modifi(ed|cation)[\s_-]?(date|time|at)/i,
      /updat(ed|ing)[\s_-]?(date|time)/i,
      /last[\s_-]?(chang|modif|updat)/i,
    ],
  },
  {
    key: "assignee",
    label: "Assignee/Owner",
    type: "string",
    required: false,
    description: "Person responsible for the record",
    synonyms: ["owner", "assigned_to", "responsible", "agent", "rep", "account_owner", "deal_owner"],
    patterns: [/assign(ee|ed)/i, /owner$/i, /responsible/i, /agent$/i],
  },
  {
    key: "category",
    label: "Category/Type",
    type: "string",
    required: false,
    description: "Classification or type",
    synonyms: ["type", "department", "team", "group", "classification", "industry", "segment"],
    patterns: [/category$/i, /type$/i, /department$/i, /classification$/i],
  },
  {
    key: "customer_name",
    label: "Customer Name",
    type: "string",
    required: false,
    description: "Name of the customer or account",
    synonyms: ["account", "company", "client", "organization", "account_name"],
    patterns: [/customer[\s_-]?name/i, /account[\s_-]?name/i, /company[\s_-]?name/i, /client/i],
  },
  {
    key: "description",
    label: "Description",
    type: "string",
    required: false,
    description: "Detailed description or notes",
    synonyms: ["details", "notes", "comments", "body", "content", "summary"],
    patterns: [/description$/i, /details$/i, /notes$/i, /comments$/i],
  },
  {
    key: "satisfaction_rating",
    label: "Satisfaction Rating",
    type: "number",
    required: false,
    description: "Customer satisfaction score",
    synonyms: ["csat", "rating", "score", "satisfaction_score", "feedback_rating"],
    patterns: [/satisfaction/i, /csat/i, /rating$/i, /score$/i],
    valueHints: ["1", "2", "3", "4", "5"],
  },
  {
    key: "source",
    label: "Source/Channel",
    type: "string",
    required: false,
    description: "Origin or source channel",
    synonyms: ["channel", "lead_source", "origin", "referrer", "medium"],
    patterns: [/source$/i, /channel$/i, /origin$/i, /referr(er|al)/i],
  },
]

/**
 * Intelligent 3-tier column mapping
 * Analyzes CSV columns and maps them to universal fields with confidence scoring
 */
export async function intelligentMapping(
  detectedColumns: DetectedColumn[],
  savedTemplate?: Record<string, string>,
): Promise<IntelligentMappingResult> {
  const autoMapped: MappingConfidence[] = []
  const suggestions: MappingConfidence[] = []
  const choices: MappingConfidence[] = []
  const unmapped: string[] = []

  for (const column of detectedColumns) {
    // Check if there's a saved template mapping
    if (savedTemplate && savedTemplate[column.name]) {
      autoMapped.push({
        csvColumn: column.name,
        targetField: savedTemplate[column.name],
        confidence: 100,
        tier: 1,
        reasoning: "Previously saved mapping template",
      })
      continue
    }

    // Find best matches for this column
    const matches = findFieldMatches(column, UNIVERSAL_FIELDS)

    if (matches.length === 0) {
      unmapped.push(column.name)
      continue
    }

    const bestMatch = matches[0]
    const secondBestMatch = matches[1]

    // Tier 1: Auto-map (95-100% confidence)
    if (bestMatch.confidence >= 95) {
      autoMapped.push({
        csvColumn: column.name,
        targetField: bestMatch.targetField,
        confidence: bestMatch.confidence,
        tier: 1,
        reasoning: bestMatch.reasoning,
      })
    }
    // Tier 2: Suggest (80-94% confidence)
    else if (bestMatch.confidence >= 80) {
      suggestions.push({
        csvColumn: column.name,
        targetField: bestMatch.targetField,
        confidence: bestMatch.confidence,
        tier: 2,
        reasoning: bestMatch.reasoning,
        alternatives: secondBestMatch ? [secondBestMatch] : undefined,
      })
    }
    // Tier 3: Offer choices (60-79% confidence)
    else if (bestMatch.confidence >= 60) {
      choices.push({
        csvColumn: column.name,
        targetField: bestMatch.targetField,
        confidence: bestMatch.confidence,
        tier: 3,
        reasoning: bestMatch.reasoning,
        alternatives: matches.slice(0, 3), // Show top 3 options
      })
    } else {
      unmapped.push(column.name)
    }
  }

  return {
    autoMapped,
    suggestions,
    choices,
    unmapped,
  }
}

/**
 * Find matching fields for a given column with confidence scoring
 */
function findFieldMatches(column: DetectedColumn, fields: FieldDefinition[]): MappingAlternative[] {
  const matches: MappingAlternative[] = []

  for (const field of fields) {
    const confidence = calculateMatchConfidence(column, field)

    if (confidence > 0) {
      matches.push({
        targetField: field.key,
        confidence,
        reasoning: generateReasoning(column, field, confidence),
      })
    }
  }

  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Calculate match confidence using multiple factors
 */
function calculateMatchConfidence(column: DetectedColumn, field: FieldDefinition): number {
  let confidence = 0
  const columnNameLower = column.name.toLowerCase().trim()

  // Factor 1: Exact match (100 points)
  if (columnNameLower === field.key.toLowerCase()) {
    return 100
  }

  // Factor 2: Synonym match (95 points)
  for (const synonym of field.synonyms) {
    if (columnNameLower === synonym.toLowerCase()) {
      confidence = Math.max(confidence, 95)
    }
  }

  // Factor 3: Pattern match (85-90 points)
  for (const pattern of field.patterns) {
    if (pattern.test(column.name)) {
      confidence = Math.max(confidence, 90)
    }
  }

  // Factor 4: Partial synonym match (70-80 points)
  for (const synonym of field.synonyms) {
    if (columnNameLower.includes(synonym.toLowerCase()) || synonym.toLowerCase().includes(columnNameLower)) {
      confidence = Math.max(confidence, 75)
    }
  }

  // Factor 5: Type compatibility (bonus +5 points)
  if (column.inferredType === field.type) {
    confidence += 5
  }

  // Factor 6: Value hints match (bonus +10 points)
  if (field.valueHints && column.sampleValues.length > 0) {
    const matchingHints = column.sampleValues.some((sample) =>
      field.valueHints!.some((hint) => String(sample).toLowerCase().includes(hint.toLowerCase())),
    )
    if (matchingHints) {
      confidence += 10
    }
  }

  // Factor 7: Fuzzy string similarity (50-70 points)
  if (confidence < 70) {
    const similarity = calculateStringSimilarity(columnNameLower, field.key.toLowerCase())
    if (similarity > 0.7) {
      confidence = Math.max(confidence, Math.round(similarity * 70))
    }
  }

  return Math.min(confidence, 100)
}

/**
 * Calculate Levenshtein distance-based string similarity
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Generate human-readable reasoning for the match
 */
function generateReasoning(column: DetectedColumn, field: FieldDefinition, confidence: number): string {
  const columnNameLower = column.name.toLowerCase()

  if (columnNameLower === field.key.toLowerCase()) {
    return `Exact match with field name "${field.label}"`
  }

  for (const synonym of field.synonyms) {
    if (columnNameLower === synonym.toLowerCase()) {
      return `Matches known synonym "${synonym}" for ${field.label}`
    }
  }

  for (const pattern of field.patterns) {
    if (pattern.test(column.name)) {
      return `Column name pattern suggests ${field.label}`
    }
  }

  if (field.valueHints && column.sampleValues.length > 0) {
    const matchingHint = field.valueHints.find((hint) =>
      column.sampleValues.some((sample) => String(sample).toLowerCase().includes(hint.toLowerCase())),
    )
    if (matchingHint) {
      return `Sample values (e.g., "${column.sampleValues[0]}") match ${field.label} patterns`
    }
  }

  if (column.inferredType === field.type) {
    return `Data type (${column.inferredType}) matches expected type for ${field.label}`
  }

  return `Fuzzy match with ${field.label} (${confidence}% confidence)`
}

/**
 * Save mapping template for future uploads
 */
export interface MappingTemplate {
  id: string
  name: string
  description: string
  source_type: string // e.g., "zoho_desk", "hubspot_crm"
  mappings: Record<string, string> // csvColumn -> targetField
  created_at: Date
  organization_id: string
}

/**
 * Apply user corrections to improve future mappings
 */
export function learnFromUserCorrections(originalMapping: MappingConfidence, userCorrectedField: string): void {
  // In a real implementation, this would:
  // 1. Store the correction in a database
  // 2. Update ML model or rule weights
  // 3. Improve future suggestions

  console.log(
    `[Learning] User corrected "${originalMapping.csvColumn}" from "${originalMapping.targetField}" to "${userCorrectedField}"`,
  )

  // Could update pattern weights or add new synonyms dynamically
}
