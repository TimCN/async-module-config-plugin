const cp = require("child_process")


class AsyncModuleConfigPlugin {
  constructor(modules) {
    // TODO: check modules = object<name:string,path:string>
    this.options = {}
    this.options.modules = modules
  }
  apply(compiler) {
    const { modules } = this.options
    const { entry, optimization } = compiler.options

    // if no runtimeChunk, add it
    if (!optimization.runtimeChunk) {
      optimization.runtimeChunk = {}
    }
    if (!optimization.runtimeChunk.name) {
      optimization.runtimeChunk.name = "manifest-runtime"
    }

    const appEntry = { ...entry };

    Object.keys(entry).forEach(key => delete entry[key])

    Object.keys(modules).forEach(key => {
      const path = modules[key].replace(/\/$/, "")
      entry[key] = `${path}/index.js`
    })

    Object.keys(appEntry).forEach(key => entry[key] = appEntry[key])

    compiler.hooks.afterEmit.tap({ name: "AsyncModuleConfigPlugin", stage: 0 }, compilation => {
      const { path: output } = compilation.options.output
      Object.keys(modules).forEach(key => {
        const path = modules[key].replace(/\/$/, "")
        cp.spawn("cp", ['-r', `${path}/${key}`, output])
      })
    })
  }
}


module.exports = AsyncModuleConfigPlugin