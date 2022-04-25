import type { OutputOptions, RollupOptions } from 'rollup';
import type { Options as ESBuildOptions } from 'rollup-plugin-esbuild';
import fg from 'fast-glob';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import { packages } from '../meta/packages';
import json from '@rollup/plugin-json';
import { resolve } from 'path';

const configs: RollupOptions[] = [
];

const esbuildPlugin = esbuild();

const externals: string[] = [];

const dtsPlugin = [
  dts(),
];

const esbuildMinifer = (options: ESBuildOptions) => {
  const { renderChunk } = esbuild(options);
  return {
    'name': 'esbuild-minifer',
    renderChunk,
  };
};

for (const { globals, name, external, submodules, iife, build, cjs, mjs, dts, target } of packages){
  if(!build) { continue; }

  const iifeGlobals = {
    ...globals || {},
  };

  const iifeName = 'NoIdeaUse';
  const functionNames = [
    'index',
  ];

  if(submodules) {
    const packages = fg.sync('*/index.ts',{ 'cwd': resolve(`packages/${name}`) });
    functionNames.push(...packages.map(i => i.split('/')[0]));
  }

  for (const fn of functionNames){
    const input = fn === 'index' ? `packages/${name}/index.ts` : `packages/${name}/${fn}/index.ts`;

    const output: OutputOptions[] = [
    ];

    if(mjs){
      output.push({
        'file': `packages/${name}/dist/${fn}.njs`,
        'format': 'es',
      });
    }

    if (cjs !== false) {
      output.push({
        'file': `packages/${name}/dist/${fn}.cjs`,
        'format': 'cjs',
      });
    }

    if (iife !== false) {
      output.push(
        {
          'file': `packages/${name}/dist/${fn}.iife.js`,
          'format': 'iife',
          'name': iifeName,
          'extend': true,
          'globals': iifeGlobals,
          'plugins': [
          ],
        },
        {
          'file': `packages/${name}/dist/${fn}.iife.min.js`,
          'format': 'iife',
          'name': iifeName,
          'extend': true,
          'globals': iifeGlobals,
          'plugins': [
            esbuildMinifer({
              'minify': true,
            }),
          ],
        },
      );
    }

    configs.push({
      input,
      output,
      'plugins': [
        target
          ? esbuild({ target })
          : esbuildPlugin,
        json(),
      ],
      'external': [
        ...externals,
        ...external || [],
      ],
    });

    if(dts){
      configs.push({
        input,
        'output': {
          'file': `packages/${name}/dist/${fn}.d.ts`,
          'format': 'es',
        },
        'plugins': dtsPlugin,
        'external': [
          ...externals,
          ...external || [],
        ],
      });
    }
  }
}

export default configs;