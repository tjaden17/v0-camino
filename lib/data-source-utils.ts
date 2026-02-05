import type { DataSource, FieldMapping } from "./types"

export function getConnectedDataSources(): DataSource[] {
  const stored = localStorage.getItem("camino-data-sources")
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export function saveDataSource(dataSource: DataSource) {
  const sources = getConnectedDataSources()
  const existingIndex = sources.findIndex((s) => s.id === dataSource.id)

  if (existingIndex >= 0) {
    sources[existingIndex] = dataSource
  } else {
    sources.push(dataSource)
  }

  localStorage.setItem("camino-data-sources", JSON.stringify(sources))
}

export function isDataSourceConnected(type: string): boolean {
  const sources = getConnectedDataSources()
  return sources.some((s) => s.type === type && s.connected)
}

export function getFieldMappings(): FieldMapping[] {
  const stored = localStorage.getItem("camino-field-mappings")
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export function saveFieldMapping(mapping: FieldMapping) {
  const mappings = getFieldMappings()
  const existingIndex = mappings.findIndex((m) => m.signalId === mapping.signalId)

  if (existingIndex >= 0) {
    mappings[existingIndex] = mapping
  } else {
    mappings.push(mapping)
  }

  localStorage.setItem("camino-field-mappings", JSON.stringify(mappings))
}

export function getFieldMappingForSignal(signalId: string): FieldMapping | undefined {
  const mappings = getFieldMappings()
  return mappings.find((m) => m.signalId === signalId)
}
