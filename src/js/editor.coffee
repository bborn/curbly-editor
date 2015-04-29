# NOTES:
# 'clear':  new MediumButton({
#   label: '<i class="fa fa-exchange"></i>',
#   action: (html, mark)->
#     document.execCommand('formatblock', false, '<p>')
#     block = window.getSelection().focusNode.parentNode
#     $(block).toggleClass('clearfix')
#     return html
# }),

$ = jQuery

class @Editor

  defaults = {

    debug: false

    undo:
      debounceRate: 200

    mediumConfig:
      imageDragging: false
      firstHeader: "h1"
      secondHeader: "h2"
      buttonLabels : 'fontawesome'
      disableAnchorPreview: false
      checkLinkFormat: true
      buttons: [
        'bold'
        'italic'
        'underline'
        'anchor'
        'header1'
        'header2'
        'quote'
        'unorderedlist'
        'orderedlist'
        'removeFormat'
      ]
      paste:
        cleanPastedHtml: true
        cleanAttrs: ['style', 'dir']

    mediumInsertConfig:
      addons:
        grid: true
        images:
          uploadScript: '/manage_photos'
          deleteScript: null
          uploadCompleted: ((el, data)->
            #timeout to let the browser paint before
            #we sync the textarea value
            that = @
            setTimeout (->
              that.syncTextArea()
              return
            ), 200
          ).bind(@)
  }

  constructor: (@selector, options) ->
    self = @
    @options = {}
    $.extend @options, defaults, options

    @textarea = $(@selector).get(0)
    @startEditor()

  log: ()->
    if @options.debug && window.console
      Array.prototype.unshift.call(arguments, 'Editor:')
      window.console.log.apply( window.console, arguments )

  startEditor: ()->
    if @options.debug
      @log('Starting with options: ', @options)
      $('body').addClass('debug')

    if $(@selector).length > 0
      @initMedium()
      @initMediumInsert()
      @events()
      @initBoundTextAreas()
      @initUndo()

  initMedium: ->
    @medium = new MediumEditor(@selector, @options.mediumConfig)

  getContent: (element)->
    @medium.serialize()[element.id].value

  events: ()->
    for element in @medium.elements
      $(element).on "input", (=>
        @log "Input: ", @getContent(element)
        unwrapper(element)
        return
      ).bind(@)

    @medium.subscribe 'editablePaste', ((e, element)->
        @log "Paste: ", @getContent(element)
        @syncTextArea element
        return
      ).bind(@)

    #handle drop uploads
    @medium.subscribe 'editableDrop', ((e, element)->
      @log "Drop: ", e, element

      if e.dataTransfer.files.length < 1
        return true
      else
        @handleImageDropped(e, element)
      ).bind(@)


  initBoundTextAreas: ()->
    for element in @medium.elements
      element.boundTextArea = @textarea
      element.innerHTML = @textarea.value
      @syncTextArea(element)

  syncTextArea: (element)->
    @log "Sync Textarea"
    unless element
      for element in @medium.elements
        element.boundTextArea.value = @getContent(element)
    else
      element.boundTextArea.value = @getContent(element)


  initMediumInsert: ()->
    @options.mediumInsertConfig.editor = @medium
    $(@selector).mediumInsert(@options.mediumInsertConfig)


  handleImageDropped: (e, element)->
    data = e.dataTransfer.files
    that = @

    imagePlugin = $.data(element, 'plugin_mediumInsertImages')

    file = $(imagePlugin.templates['src/js/templates/images-fileupload.hbs']())

    fileUploadOptions =
      url: imagePlugin.options.uploadScript,
      dataType: 'json',
      acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
      formData: imagePlugin.options.formData,
      dropZone: null
      add: (e, data)->
        $.proxy(imagePlugin, 'uploadAdd', e, data)()
        return
      done: (e, data)->
        $.proxy(imagePlugin, 'uploadDone', e, data)()
        return

    if new XMLHttpRequest().upload
      fileUploadOptions.progress = (e, data)->
        $.proxy(imagePlugin, 'uploadProgress', e, data)()
      fileUploadOptions.progressall = (e, data)->
        $.proxy(imagePlugin, 'uploadProgressall', e, data)()

    file.fileupload(fileUploadOptions);
    file.fileupload('add', {files: data} )

    return false

  initUndo: ()->
    for element in @medium.elements
      undoManager = new UndoManager(@, element, {debounceRate: @options.undo.debounceRate })
