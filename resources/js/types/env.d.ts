/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Augment Vue to include global properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    route: (name?: string, params?: any) => string;
    $page: {
      props: {
        auth: {
          user?: any;
        };
        [key: string]: any;
      };
      [key: string]: any;
    };
  }
}

// Global route function (from Ziggy)
declare global {
  interface Window {
    route: any;
  }

  // Add route current function support
  function route(name?: string, params?: any): {
    current: (name: string) => boolean;
  } & string;
}

declare function route(name?: string, params?: object): string & { current: (name: string) => boolean };