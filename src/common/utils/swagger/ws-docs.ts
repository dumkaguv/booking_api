export type SchemaRef =
  | {
      $ref: string
    }
  | {
      type?: string
      items?: SchemaRef
      properties?: Record<string, SchemaRef>
      required?: string[]
    }

export type WsDocs = {
  tags: { name: string; description?: string }[]
  paths: Record<string, Record<string, unknown>>
}

export function jsonContent(schema: SchemaRef) {
  return {
    'application/json': { schema }
  }
}
