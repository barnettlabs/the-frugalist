/* eslint-env node */

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

/*
 * The calculators come from @frugalist/contracts, linked in from
 * packages/contracts and used as its compiled dist/ - the same build the API
 * runs. It is a watch folder so the dev server reloads when it is rebuilt.
 *
 * Its own imports (zod) resolve from the app rather than from
 * packages/contracts/node_modules, which links to the root workspace's copy:
 * left alone, the bundle carries two versions of zod.
 */
const contractsDir = path.resolve(__dirname, '../packages/contracts');
// Metro may see the package by its real path or through the app's symlink.
const contractsPaths = [contractsDir, path.join(__dirname, 'node_modules/@frugalist/contracts')];

config.watchFolders = [...(config.watchFolders ?? []), contractsDir];

config.resolver.resolveRequest = (context, moduleName, platform) => {
	const fromContracts = contractsPaths.some(dir => context.originModulePath.startsWith(dir + path.sep));
	const isPackage = !moduleName.startsWith('.') && !path.isAbsolute(moduleName);

	if (fromContracts && isPackage) {
		return context.resolveRequest(
			{ ...context, originModulePath: path.join(__dirname, 'package.json') },
			moduleName,
			platform
		);
	}

	return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
