components = [
  'jquery/dist/jquery.js'
  'medium-editor/dist/js/medium-editor.js'
  'jquery-ui/jquery-ui'
  'handlebars/handlebars'
  'blueimp-file-upload/js/jquery.iframe-transport.js'
  'blueimp-file-upload/js/jquery.fileupload.js'
  'medium-editor-insert-plugin/dist/js/medium-editor-insert-plugin'
  'rangy/rangy-core'
  'rangy/rangy-selectionsaverestore'
  'jquery-observe/jquery-observe'
]

bower_components = 'bower_components'

for component in components
  require "../#{bower_components}/#{component}"
