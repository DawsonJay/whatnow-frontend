/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'vite' {
  export function defineConfig(config: any): any;
}

declare module '@vitejs/plugin-react' {
  const react: any;
  export default react;
}
