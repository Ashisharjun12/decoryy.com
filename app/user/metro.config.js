const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const exclusionList =
  require('metro-config/private/defaults/exclusionList').default;

const METRO_PORT = 8081;

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  port: METRO_PORT,
};

// Keep Metro from crawling native build trees (large on Windows / OneDrive).
config.resolver = {
  ...config.resolver,
  blockList: exclusionList([
    /[/\\]android[/\\]\.gradle[/\\]/,
    /[/\\]android[/\\]build[/\\]/,
    /[/\\]ios[/\\]build[/\\]/,
    /[/\\]ios[/\\]Pods[/\\]/,
  ]),
  useWatchman: process.platform !== 'win32',
};

// lucide-react-native ships ESM icon chunks as .mjs; Metro must resolve them.
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
