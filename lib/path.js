'use babel';

export default {
    separator: ((process.platform === 'win32') ? '\\' : '/'),

    // Returns `path` without the trailing slash if there
    // is one.
    removeTrailingSlash(path) {
      if (path[path.length-1] === this.separator) {
        return path.substring(0,path.length-1)
      }

      return path
    },

    // Return `path` with a trailing slash if there wasn't
    // one already.
    addTrailingSlash(path) {
      if (path[path.length-1] !== this.separator) {
        return path + this.separator
      }

      return path
    },

    // Determines if this path looks like it's intended to
    // be an absolute path in a system-agnostic way. For
    // Windows environments, "_likeAbsolutePath" is true
    // when the path given is absolute for the "current"
    // drive. Such a path will always fail "_isAbsoluteWindowsPath".
    likeAbsolutePath(path) {
      if (path[0] === this.separator) {
        return true
      }

      return false
    },

    // This isn't strictly correct--some Windows implementations
    // allow numeric drive identifiers (e.g., 1:, 2:), but this
    // follows the DOS convention of a drive in a path matching ^[a-z]:
    isAbsoluteWindowsPath(path) {
      if (path.match(/^[a-z]:\\/i)) {
        return true
      }
      return false
    },

    // Crude normalization method for Windows paths.
    // Assumes the default Windows drive is the environment
    // variable SystemDrive.
    makeAbsoluteWindowsPath(path) {
      if (this.isAbsoluteWindowsPath(path)) {
        return path
      }

      if (this.likeAbsolutePath(path)) {
        return process.env.SystemDrive + path
      }

      return process.env.SystemDrive + this.separator + path
    },

    _combinePathComponents(defaultRoot, path) {
      defaultRoot = this.addTrailingSlash(defaultRoot)

      return this.removeTrailingSlash(
        defaultRoot +
        path
      )
    },

    combineWindowsPath(defaultRoot, path) {
      // If path is absolute or pseudo-absolute:
      // canonicalize it and return.
      if (
        this.isAbsoluteWindowsPath(path) ||
        this.likeAbsolutePath(path)
      ) {
        return this.removeTrailingSlash(
          this.makeAbsoluteWindowsPath(path)
        )
      }

      // Otherwise, bind the project path to the defaultRoot
      // supplied as configuration, canonicalize them, and
      // return.
      defaultRoot = this.makeAbsoluteWindowsPath(defaultRoot)

      return this._combinePathComponents(defaultRoot, path)
    },

    combinePath(defaultRoot, path) {
      if (this.likeAbsolutePath(path)) {
        return path
      }

      return this._combinePathComponents(defaultRoot, path)
    },

    processInput(baseDirectory, projectPath) {
      if (process.platform === 'win32') {
        combinedPath =
          this.combineWindowsPath(
            baseDirectory,
            projectPath
          )

        return this.splitPath(combinedPath)
      }

      return this.splitPath(
        this.combinePath(baseDirectory, projectPath)
      )
    },

    splitPath(path) {
      splitIndex = path.lastIndexOf(this.separator)+1
      return [
              path.substring(0, splitIndex),
              path.substring(splitIndex)
             ]
    },
}
