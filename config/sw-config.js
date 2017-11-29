module.exports = {
  cache: {
    cacheId: 'dashboard',
    runtimeCaching: [{
      handler: 'fastest',
      urlPattern: '\/$'
    }],
    staticFileGlobs: ['dist/**/*']
  },
  manifest: {
    background: '#FFFFFF',
    title: 'dashboard',
    short_name: 'PWA',
    theme_color: '#FFFFFF'
  }
};
