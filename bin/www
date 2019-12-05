#! /usr/bin/env node

// 解析用户的参数
let progarm = require('commander')

let configs = {
  '-p,--port <val>': 'set http-server port',
  '-d,--dir <dir>': 'set http-server directory'
}

Object.entries(configs).forEach(([key, value]) => {
  progarm.option(key, value)
})

progarm.name('kimi-server').usage('<option>')

let obj = progarm.parse(process.argv) //用户传入的配置

let Server = require('../server')

let defaultConfig = {
  port: 4000,
  dir: process.cwd(),
  ...obj
}

let server = new Server(defaultConfig)

server.start()
