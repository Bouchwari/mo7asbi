module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@domain':         './src/domain',
            '@application':    './src/application',
            '@infrastructure': './src/infrastructure',
            '@presentation':   './src/presentation',
            '@i18n':           './src/i18n',
            '@src':            './src',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
