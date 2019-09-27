module.exports = {
  paths: function (paths, env) {
    const blacklist = ['appPackageJson', 'appNodeModules', 'ownPath', 'ownNodeModules']
    for (let [key, value] of Object.entries(paths)) {
      if(blacklist.includes(key)){
        continue;
      }
      if (typeof value === 'string'){
        paths[key] = value.replace(process.cwd(),`${process.cwd()}/client`)
      }
    }

    return paths;
  },
}