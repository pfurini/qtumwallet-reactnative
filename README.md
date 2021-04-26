# Example React Native app using `qtumjs-wallet` lib with auto patching

This is an *empty* react-native app skeleton, with functioning `otijs-wallet` dependency and sub-dependencies.

### Notes

- This app uses `yarn` package manager. Please install it globally before cloning.
- Run `yarn` or `yarn install` to install dependencies and to run auto patching of the `otijs-wallet` lib and related dependencies
- Verify that the last `require('crypto');` statement in the `shim.js` file is uncommented

