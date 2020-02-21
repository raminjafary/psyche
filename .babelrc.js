module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: process.env.NODE_ENV === 'development' ? 'commonjs' : false,
        useBuiltIns: 'entry',
        corejs: 3,
        targets: {
          node: 'current'
        }
      }
    ],
    '@babel/preset-typescript'
  ]
}
