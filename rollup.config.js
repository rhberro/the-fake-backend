import cleaner from 'rollup-plugin-cleaner';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'source/index.ts',
  output: {
    dir: 'build',
    format: 'cjs',
  },
  plugins: [
    cleaner({ targets: ['build'] }),
    typescript({
      typescript: require('typescript'),
      objectHashIgnoreUnknownHack: true,
    }),
    terser({ output: { comments: false } }),
  ],
};
