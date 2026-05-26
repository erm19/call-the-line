module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Required for tsyringe decorators — must come before class-properties
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    // Must be last
    'react-native-reanimated/plugin',
  ],
};
