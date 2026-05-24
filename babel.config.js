module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Required for tsyringe metadata-based injection
    'babel-plugin-transform-typescript-metadata',
    // Decorator support must come before class-properties
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    // Required for tsyringe decorators
    ['@babel/plugin-transform-class-properties', { loose: true }],
    // Must be last
    'react-native-reanimated/plugin',
  ],
};
