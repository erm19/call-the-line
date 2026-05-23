module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Required for tsyringe decorators
    ['@babel/plugin-transform-class-properties', { loose: true }],
    // Must be last
    'react-native-reanimated/plugin',
  ],
};
