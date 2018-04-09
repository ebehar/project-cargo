'use babel';

import CargoProjectView from './project-cargo-view';
import { CompositeDisposable } from 'atom';
import smalltalk from 'smalltalk';

export default {
    config: require('./config'),
    spawn: require('cross-spawn'),

    subscriptions: null,

    win32: ((process.platform === 'win32') ? true : false),
    separator: ((process.platform === 'win32') ? '\\' : '/'),

    activate() {
      this.subscriptions = new CompositeDisposable()

      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'project-cargo:create': () => this.create()
      }))
    },

    deactivate() {
      this.subscriptions.dispose()
    },

    getProjectNameAndCreate(path) {
      let name

      smalltalk
          .prompt('Project Name', '', 'default')
          .then((input) => {
            this._create(path, input)
          })
          .catch(() => {
            console.log("Error")
            return
          })
    },

    _createBasePath(path) {
      let bin = 'md'
      let args = [ '/C', bin, path ]

      this.spawn.sync(
        'cmd',
        args,
        {
          stdio: 'ignore',
          env: process.env
        }
      )
    },

    _createProject(path, projectName) {
      this._createBasePath(path)

      let bin = 'cargo'
      let args = ['/C', bin, 'new', projectName, '--bin']
      this.spawn.sync(
        'cmd',
        args,
        {
          cwd: path,
          stdio: 'ignore',
          env: process.env
        }
      )
    },

    _addProjectFolder(path) {
      console.log('Adding project folder: ' + path)
      atom.project.addPath(path)
    },

    defaultDirectory() {
      return atom.config.get('project-cargo.baseDirectory')
    },

    _create(path, projectName) {
        this._createProject(path, projectName)

        fullPath =
          path[path.length-1] === this.separator ?
          path + projectName :
          path + this.separator + projectName

        this._addProjectFolder(fullPath)
    },

    create() {
        let path = this.defaultDirectory()
        let projectName = this.getProjectNameAndCreate(path)
    }
};
