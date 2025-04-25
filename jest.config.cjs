module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    // map the CDN imports to your npm firebase package
    '^https://www\\.gstatic\\.com/firebasejs/.*/firebase-app\\.js$': 'firebase/app',
    '^https://www\\.gstatic\\.com/firebasejs/.*/firebase-auth\\.js$': 'firebase/auth',
    '^https://www\\.gstatic\\.com/firebasejs/.*/firebase-firestore\\.js$': 'firebase/firestore',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',
};
