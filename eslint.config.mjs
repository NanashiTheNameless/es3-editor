import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['dist/**', 'out/**']
  },
  {
    rules: {
      'react/jsx-no-undef': 'off',
      'react-hooks/exhaustive-deps': 'off'
    }
  }
];

export default eslintConfig;
