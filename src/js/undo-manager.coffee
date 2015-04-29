
$ = jQuery

class @UndoManager
  defaults = {
    debounceRate: 100
  }

  constructor: (@editor, @element, options = {}) ->
    @medium = @editor.medium
    @startValue = @editor.getContent(@element)
    @newValue = ''
    @startSelection = null
    @newSelection   = null

    @blocked = false

    @undoBtn = $('.undo')
    @redoBtn = $('.redo')
    @stack = new(Undo.Stack)

    @options = {}
    $.extend @options, defaults, options

    @log("Starting with options: ", @options)

    @events()
    @updateUI()


  log: ()->
    Array.prototype.unshift.call(arguments, 'UndoManager:')
    @editor.log.apply( @editor, arguments )

  events: ()->
    $(@element).observe('characterData childlist subtree',
      '*[class!=rangySelectionBoundary]',
      $.debounce @options.debounceRate, $.proxy(@, 'mutationCallback')
    )

    @stack.changed = (->
      @updateUI()
      return
    ).bind(@)

    # bind keyboard shortcuts for undo/redo
    $(@element).on 'keyup', (e)->
      if e.metaKey or e.keyCode is 90
        e.preventDefault()
        return false

    $(@element).on 'keydown', ((e) ->
      if !e.metaKey or e.keyCode isnt 90
        return

      e.preventDefault()
      if e.shiftKey
        @redo()
      else
        @undo()
      return false
    ).bind(@)

    $(document).on 'click.undo', '.redo', ((e)->
      @redo()
      e.preventDefault()
      return false
    ).bind(@)

    $(document).on 'click.undo', '.undo', ((e)->
      @undo()
      e.preventDefault()
      return false
    ).bind(@)

  undo: ()->
    @stack.undo() if @stack.canUndo()

  redo: ()->
    @stack.redo() if @stack.canRedo()

  mutationCallback: (mutations)->
    if @blocked
      @blocked = false
      return

    @newSelection = rangy.saveSelection()
    @newValue = @element.innerHTML

    @stack.execute new EditCommand(@)

    rangy.removeMarkers @newSelection

    @startValue = @newValue
    @startSelection = @newSelection
    return

  updateUI: ->
    @redoBtn.attr('disabled', !@stack.canRedo() )
    @undoBtn.attr('disabled', !@stack.canUndo() )
    return


EditCommand = Undo.Command.extend
  constructor: (manager)-> #, textarea, oldValue, newValue, oldSelection, newSelection) ->
    @manager = manager
    @textarea = manager.element
    @oldValue = manager.startValue
    @newValue = manager.newValue
    @oldSelection = manager.startSelection
    @newSelection = manager.newSelection
    return

  execute: ->

  undo: ->
    @manager.log "Undo: \n", @oldValue
    @manager.blocked = true
    @textarea.innerHTML = @oldValue
    if @oldSelection
      @oldSelection.restored = false
      rangy.restoreSelection @oldSelection
    return

  redo: ->
    @manager.log "Redo: \n", @newValue
    @manager.blocked = true
    @textarea.innerHTML = @newValue
    if @newSelection
      @newSelection.restored = false
      rangy.restoreSelection @newSelection
    return
