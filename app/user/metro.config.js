const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// lucide-react-native ships ESM icon chunks as .mjs; Metro must resolve them.
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
