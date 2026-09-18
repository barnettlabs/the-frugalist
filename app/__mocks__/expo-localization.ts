// expo-localization dropped the standalone `locale` export in SDK 57;
// getLocales() is the supported entry point.
export const getLocales = () => [
	{
		languageTag: 'en-US',
		languageCode: 'en',
		regionCode: 'US',
		textDirection: 'ltr' as const,
	},
];

export const getCalendars = () => [{ timeZone: 'UTC' }];

export const timezone = 'UTC';
export const isRTL = false;
