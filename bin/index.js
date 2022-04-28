#!/usr/bin/env node

const program = require('commander');
const {integrate} = require('../lib/build')
const {version} = require('../package.json');

program
  .command('build')
  .description('cocos应用打包')
  .version(`${version}`, '-v, --version', '输出当前版本')
  .action(function (dirs,options) {
    integrate()
  })
  .parse()


  // const options = program.opts();


