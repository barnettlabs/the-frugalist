import { NavigationContext } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';

type Props = { hidden?: boolean };
export const FocusAwareStatusBar = ({ hidden = false }: Props) => {
  const navigation = React.useContext(NavigationContext);
  const [isFocused, setIsFocused] = React.useState(true);
  const { colorScheme } = useColorScheme();

  React.useEffect(() => {
    if (!navigation) {
      setIsFocused(true);
      return;
    }

    setIsFocused(navigation.isFocused());

    const unsubscribeFocus = navigation.addListener('focus', () => {
      setIsFocused(true);
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsFocused(false);
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  if (Platform.OS === 'web') return null;

  return isFocused ? (
    <SystemBars
      style={colorScheme === 'light' ? 'dark' : 'light'}
      hidden={hidden}
    />
  ) : null;
};
