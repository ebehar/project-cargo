'use babel';

import CargoProjectView from './project-cargo-view';
import { CompositeDisposable } from 'atom';
import smalltalk from 'smalltalk';

export default {
    config: require('./config'),
    path: require('./path'),
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
    },

    _createBasePath(path) {
      console.log('Creating directory: ' + path)

      let bin = 'md'
      let args = [ '/C', bin, path ]

      this.spawn.sync(
        'cmd',
        args,
        {
          stdio: 'ignore',
          env: process.env
        })
    },

    _createProject(basePath, projectName) {
      [basePath, projectName] = this.path.processInput(
          basePath,
          projectName
        )

      this._createBasePath(basePath)

      let bin = 'cargo'
      let args = ['/C', bin, 'new', projectName, '--bin']
      this.spawn.sync(
        'cmd',
        args,
        {
          cwd: basePath,
          stdio: 'ignore',
          env: process.env
        }
      )

      return [basePath, projectName]
    },

    defaultDirectory() {
      return atom.config.get('project-cargo.baseDirectory')
    },

    _create(basePath, projectName) {
        [basePath, projectName] = this._createProject(basePath, projectName)

        fullPath = basePath + projectName

        atom.project.addPath(fullPath)
    },

    create() {
        let path = this.defaultDirectory()
        let projectName = this.getProjectNameAndCreate(path)
    }
};
