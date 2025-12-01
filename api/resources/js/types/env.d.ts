/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vue 3 Composition API types
declare module 'vue' {
  export function ref<T>(value: T): Ref<T>
  export function computed<T>(getter: () => T): ComputedRef<T>
  export function reactive<T extends object>(target: T): T
  export function watch<T>(source: T | (() => T), callback: (newValue: T, oldValue: T) => void, options?: WatchOptions): void
  export function onMounted(callback: () => void): void
  export function onUnmounted(callback: () => void): void
  export function nextTick(callback?: () => void): Promise<void>

  interface Ref<T> {
    value: T
  }

  interface ComputedRef<T> {
    readonly value: T
  }

  interface WatchOptions {
    immediate?: boolean
    deep?: boolean
  }
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
