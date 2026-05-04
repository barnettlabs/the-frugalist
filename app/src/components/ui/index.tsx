import { cssInterop } from 'nativewind';
import Svg from 'react-native-svg';

export * from './button';
export * from './checkbox';
export { default as colors } from './colors';
export * from './floating-add-button';
export * from './form-section';
export * from './header-back-button';
export * from './theme';
export * from './focus-aware-status-bar';
export * from './image';
export * from './input';
export * from './list';
export * from './logo';
export * from './masthead-bar';
export * from './modal';
export * from './progress-bar';
export * from './screen-container';
export * from './scroll-aware';
export * from './section-header';
export * from './select';
export * from './text';
export * from './tool-card';
export * from './utils';

// export base components from react-native
export {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
export { SafeAreaView } from 'react-native-safe-area-context';

//Apply cssInterop to Svg to resolve className string into style
cssInterop(Svg, {
  className: {
    target: 'style',
  },
});
