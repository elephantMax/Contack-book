export default {
  install(Vue, options){
    Vue.prototype.$addBackup = function(backups, backup){
      backups.push(backup)
      sessionStorage.setItem('fields', JSON.stringify(backups))
      return JSON.parse(sessionStorage.getItem('fields'))
    }
    // Vue.prototype.$getBackups = function(){
    //   return 
    // }
  }
}