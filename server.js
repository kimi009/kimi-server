const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs').promises
const { createReadStream, readFileSync } = require('fs')

const mime = require('mime')
const chalk = require('chalk')
const template = require('art-template')

class Server {
  constructor(config) {
    this.port = config.port
    this.dir = config.dir
  }
  start() {
    let server = http.createServer(this.handleRequest.bind(this))
    server.listen(this.port, () => {
      console.log(`${chalk.yellow(`Starting up kimi-server, serving ./${
        path.parse(this.dir).name
      }
    Available on:`)}
    http://127.0.0.1:${chalk.green(this.port)}
    Hit Ctrl+C to stop the server
      `)
    })
  }
  async handleRequest(req, res) {
    let { pathname } = url.parse(req.url)
    pathname = decodeURIComponent(pathname)
    let absPath = path.join(this.dir, pathname)
    try {
      let statObj = await fs.stat(absPath)
      // console.log(absPath, statObj.isFile())
      if (statObj.isFile()) {
        this.sendFile(absPath, req, res, statObj)
      } else {
        //列出所有的目录
        let children = await fs.readdir(absPath)
        children = children.map(item => {
          return {
            current: item,
            parent: path.join(pathname, item)
          }
        })
        // 把数据渲染到页面上，采用模板引擎
        let html = template(path.resolve(__dirname, 'template.html'), {
          children
        })
        res.setHeader('Content-Type', 'text/html;charset=utf-8')
        res.end(html)
      }
    } catch (error) {
      console.log(error)
      this.sendError(error, res)
    }
  }
  sendFile(absPath, req, res, statObj) {
    let contentType = mime.getType(absPath)
    let extName = path.extname(absPath)
    if (extName === '.vue') {
      contentType = 'text/plain'
    }
    contentType = `${contentType};charset=utf-8`
    res.setHeader('Content-Type', contentType)
    createReadStream(absPath).pipe(res)
  }
  sendError(err, res) {
    res.statusCode = 404
    res.end('Not Found')
  }
}

module.exports = Server
