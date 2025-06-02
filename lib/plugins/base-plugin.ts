export abstract class BasePlugin {
  abstract id: string
  abstract name: string
  abstract scopes: string[]

  abstract isEnabled(): boolean
  abstract fetchData(accessToken: string): Promise<any>
  abstract formatForAI(data: any): string
}
