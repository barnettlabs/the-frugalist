import * as React from 'react';

import { SelectSheet } from '@/components/ui';
import { useSelectedLanguage } from '@/lib';
import { translate } from '@/lib';
import type { Language } from '@/lib/i18n/resources';

import { Item } from './item';

export const LanguageItem = () => {
  const { language, setLanguage } = useSelectedLanguage();
  const [open, setOpen] = React.useState(false);

  const langs = React.useMemo(
    () => [
      { label: translate('settings.english'), value: 'en' },
      { label: translate('settings.arabic'), value: 'ar' },
    ],
    []
  );

  const selectedLanguage = React.useMemo(
    () => langs.find((lang) => lang.value === language),
    [language, langs]
  );

  return (
    <>
      <Item
        text="settings.language"
        value={selectedLanguage?.label}
        onPress={() => setOpen(true)}
      />
      <SelectSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={translate('settings.language')}
        options={langs}
        value={selectedLanguage?.value}
        onSelect={(option) => {
          setLanguage(option.value as Language);
          setOpen(false);
        }}
      />
    </>
  );
};
