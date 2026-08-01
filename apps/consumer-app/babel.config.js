module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Must be listed last — react-native-reanimated v4 moved its worklet
    // transform into the separate react-native-worklets package.
    plugins: ["react-native-worklets/plugin"],
  };
};
