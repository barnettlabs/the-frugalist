/* eslint-env node */

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Watch the shared assets folder at the monorepo root
config.watchFolders = [path.resolve(__dirname, '../shared')];

module.exports = withNativeWind(config, { input: './global.css' });
