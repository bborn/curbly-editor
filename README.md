Curbly Editor
=============

Usage (Rails):

bower install curbly-editor

#= require medium-editor/medium-editor
#= require jquery-ui/jquery-ui
#= require handlebars/handlebars
#= require blueimp-file-upload/jquery.iframe-transport
#= require blueimp-file-upload/jquery.fileupload
#= require medium-editor-insert-plugin/medium-editor-insert-plugin
#= require rangy/rangy-core.min
#= require rangy/rangy-selectionsaverestore.min
#= require jquery.debounce
#= require jquery-observe/jquery-observe
#= require curbly-editor/curbly-editor

(($) ->
  $(document).ready ->
    editor = new Editor(".editable")
    window.editor = editor
) jQuery
