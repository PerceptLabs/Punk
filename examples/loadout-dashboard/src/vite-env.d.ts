/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly hot?: {
    accept: (cb?: (mod: any) => void) => void
    dispose: (cb: (data: any) => void) => void
    invalidate: () => void
    on: (event: string, cb: (...args: any[]) => void) => void
  }
}
