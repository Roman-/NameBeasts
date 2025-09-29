/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_APP_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
