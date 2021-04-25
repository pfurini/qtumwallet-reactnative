# Example React Native app using `qtumjs-wallet` lib with auto patching

### Notes

- This app uses `yarn` package manager. Please install it globally before cloning.
- After cloning please edit the patch at `./patches/qtumjs-wallet+0.2.2.patch` replacing the URLS for `MAINNET` and `TESTNET` networks with your own (or the official ones).
- Run `yarn` or `yarn install` to install dependencies and to run auto patching of the `qtumjs-wallet` lib
- Verify that the last `require('crypto');` statement in the `shim.js` file is uncommented

**PLEASE NOTE** that `qtumjs-wallet` cannot work in React Native without patching!
