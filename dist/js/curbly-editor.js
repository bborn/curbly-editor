/**
 *   MediumButton  1.0 (24.02.2015)
 *   MIT (c) Patrick Stillhart
 *
 */
function MediumButton(options) {
    if (options.label === undefined || !/\S{1}/.test(options.label) ||
    options.start === undefined || !/\S{1}/.test(options.start) ||
    options.end === undefined || !/\S{1}/.test(options.end)) {

    if(options.label === undefined || !/\S{1}/.test(options.label) ||
       options.action === undefined || !/\S{1}/.test(options.action)) {
      console.error('[Custom-Button] You need to specify "label", "start" and "end" OR "label" and "action"');
      return;
    }
    }

  options.start = (options.start === undefined) ? '' : options.start;
  options.end = (options.end === undefined) ? '' : options.end;

    this.options = options;
    this.button = document.createElement('button');
    this.button.className = 'medium-editor-action';
    this.button.innerHTML = options.label;
    this.button.onclick = function() {
        // Get Current Value
        var html = getCurrentSelection(), sel = window.getSelection();

        //Modify Content
    var mark = true;
        if (options.start === undefined || html.indexOf(options.start) == -1 && html.indexOf(options.end) == -1) {

      if(options.action != undefined) html = options.action(html, true);

            html = options.start + html + options.end;

        } else { //clean old
      if(options.action != undefined) html = options.action(html, false);
      html = String(html).split(options.start).join('');
      html = String(html).split(options.end).join('');
        }




    var range;
        //Set new Content
        if (sel.getRangeAt && sel.rangeCount) {
            range = window.getSelection().getRangeAt(0);
            range.deleteContents();

            // Create a DocumentFragment to insert and populate it with HTML
            // Need to test for the existence of range.createContextualFragment
            // because it's non-standard and IE 9 does not support it
            if (range.createContextualFragment) {
                fragment = range.createContextualFragment(html);
            } else {
                var div = document.createElement('div');
                div.innerHTML = html;
                fragment = document.createDocumentFragment();
                while ((child = div.firstChild)) {
                    fragment.appendChild(child);
                }

            }
            var firstInsertedNode = fragment.firstChild;
            var lastInsertedNode = fragment.lastChild;
            range.insertNode(fragment);
            if (firstInsertedNode) {
                range.setStartBefore(firstInsertedNode);
                range.setEndAfter(lastInsertedNode);
            }
            sel.removeAllRanges();
            sel.addRange(range);
        }

    };

}

MediumButton.prototype.getButton = function() {
    return this.button;
};

MediumButton.prototype.checkState = function(node) {
  var html = getCurrentSelection();
    if (this.options.start != '' && html.indexOf(this.options.start) > -1 && html.indexOf(this.options.end) > -1) {
        this.button.classList.add('medium-editor-button-active');
    }

};

function getCurrentSelection() {

  var html = '', sel;
       if (typeof window.getSelection != 'undefined') {
           sel = window.getSelection();
           if (sel.rangeCount) {
               var container = document.createElement('div');
               for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                   container.appendChild(sel.getRangeAt(i).cloneContents());
               }
               html = container.innerHTML;
           }
       } else if (typeof document.selection != 'undefined') {
           if (document.selection.type == 'Text') {
               html = document.selection.createRange().htmlText;
           }
       }

  return html;

}

;(function ($, window, document, undefined) {

    'use strict';

    /** Default values */
    var pluginName = 'mediumInsert',
        addonName = 'Grid', // first char is uppercase
        defaults = {
          label: '<span class="fa fa-columns"></span>',
          actions: {
              remove: {
                  label: '<span class="fa fa-times"></span>',
                  clicked: function () {
                      var $event = $.Event('click');
                      $(document).trigger($event);
                  }
              }
          }
        };

    /**
     * Grid object
     *
     * Sets options, variables and calls init() function
     *
     * @constructor
     * @param {DOM} el - DOM element to init the plugin on
     * @param {object} options - Options to override defaults
     * @return {void}
     */

    function Grid (el, options) {
        this.el = el;
        this.$el = $(el);
        this.templates = window.MediumInsert.Templates;
        this.core = this.$el.data('plugin_'+ pluginName);

        this.options = $.extend(true, {}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    /**
     * Initialization
     *
     * @return {void}
     */

    Grid.prototype.init = function () {
        this.events();
    };

    /**
     * Event listeners
     *
     * @return {void}
     */

    Grid.prototype.events = function () {
      $(document)
          .on('click.grid keyup.grid', $.proxy(this, 'unselectGrid'))
          .on('click.grid', '.medium-insert-grid-toolbar2 .medium-editor-action', $.proxy(this, 'toolbar2Action'));

      this.$el
          .on('click.grid keyup.grid', '.row', $.proxy(this, 'selectGrid'))
    };

    /**
     * Get the Core object
     *
     * @return {object} Core object
     */
    Grid.prototype.getCore = function () {
        return this.core;
    };

    /**
     * Add custom content
     *
     * This function is called when user click on the addon's icon
     *
     * @return {void}
     */

    Grid.prototype.add = function () {
      var $place = this.$el.find('.medium-insert-active'),
            that = this;

      this.getCore().hideButtons();

      if ($place.is('p')) {
            $place.replaceWith('<div class="medium-insert-active">'+ $place.html() +'</div>');
            $place = this.$el.find('.medium-insert-active');
            this.getCore().moveCaret($place);
        }

      $place.addClass('row').html([
        "<div class='column'>",
          "<p>Column</p>",
         "</div>",
         "<div class='column'>",
          "<p>Column</p>",
         "</div>"].join('')
        );

      this.$el.trigger('input');

    };


    /**
     * Select clicked grid
     *
     * @param {Event} e
     * @returns {void}
     */

    Grid.prototype.selectGrid = function (e) {
        if(this.gridSelected){
          return;
        } else {
          this.gridSelected = true;
          var $grid = $(e.target),
              that = this;

          console.log($grid);

          // Hide keyboard on mobile devices
          // this.$el.blur();

          $grid.closest('.row').addClass('medium-insert-grid-active');

          setTimeout(function () {
              that.addToolbar();
          }, 50);

          return
        }
    };

    /**
     * Unselect selected grid
     *
     * @param {Event} e
     * @returns {void}
     */

    Grid.prototype.unselectGrid = function (e) {
      if (this.gridSelected){
        var $el = $(e.target),
            $grid = this.$el.find('.medium-insert-grid-active');

        if ($el.parents(".medium-insert-grid-active").length > 0 ) {
          return;
        }

        this.gridSelected = false;
        $grid.removeClass('medium-insert-grid-active');
        $('.medium-insert-grid-toolbar2').remove();
      }
      return
    };



    /**
     * Adds grid toolbar to editor
     *
     * @returns {void}
     */

    Grid.prototype.addToolbar = function () {
        var $grid = this.$el.find('.medium-insert-grid-active'),
            active = false,
            $toolbar, $toolbar2, top;

        var template = [
            '<div class="medium-insert-grid-toolbar2 medium-editor-toolbar medium-editor-toolbar-active">',
                '<ul class="medium-editor-toolbar-actions clearfix">',
                '<li>',
                  '<button class="medium-editor-action" data-action="remove"><span class="fa fa-times"></span></button>',
                '</li>',
              '</ul>',
            '</div>'
          ].join('');

        $('body').append(template.trim());

        // $toolbar = $('.medium-insert-grid-toolbar');
        $toolbar2 = $('.medium-insert-grid-toolbar2');

        // top = $grid.offset().top - $toolbar.height() - 8 - 2 - 5; // 8px - hight of an arrow under toolbar, 2px - height of an image outset, 5px - distance from an image
        // if (top < 0) {
        //     top = 0;
        // }

        // $toolbar
        //     .css({
        //         top: top,
        //         left: $grid.offset().left + $grid.width() / 2 - $toolbar.width() / 2
        //     })
        //     .show();

        $toolbar2
            .css({
                top: $grid.offset().top + 2, // 2px - distance from a border
                left: $grid.offset().left + $grid.width() - $toolbar2.width() - 4 // 4px - distance from a border
            })
            .show();

        // $toolbar.find('button').each(function () {
        //     if ($p.hasClass('medium-insert-grid-'+ $(this).data('action'))) {
        //         $(this).addClass('medium-editor-button-active');
        //         active = true;
        //     }
        // });

        // if (active === false) {
        //     $toolbar.find('button').first().addClass('medium-editor-button-active');
        // }
    };

    /**
     * Fires toolbar2 action
     *
     * @param {Event} e
     * @returns {void}
     */

    Grid.prototype.toolbar2Action = function (e) {
        var $button = $(e.target).is('button') ? $(e.target) : $(e.target).closest('button'),
            callback = this.options.actions[$button.data('action')].clicked;

        this.removeGrid();

        if (callback) {
            callback(this.$el.find('.medium-insert-grid-active'));
        }

        this.getCore().hideButtons();

        this.$el.trigger('input');

        return
    };


    Grid.prototype.removeGrid = function () {
      var $grid, $parent, $empty;

      $grid = this.$el.find('.medium-insert-grid-active');

      if ($grid.length) {

        $grid.remove();

        $('.medium-insert-grid-toolbar, .medium-insert-grid-toolbar2').remove();

        this.$el.trigger('input');
      }
    };

    /** Addon initialization */

    $.fn[pluginName + addonName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName + addonName)) {
                $.data(this, 'plugin_' + pluginName + addonName, new Grid(this, options));
            }
        });
    };

})(jQuery, window, document);


function unwrapper(node){
    sel = rangy.saveSelection();
    jQuery(node).find("span:not(.rangySelectionBoundary)[style]").contents().unwrap();
    rangy.restoreSelection(sel);
}




/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
//
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
//
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
//
// About: Release History
//
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
//
// Topic: Note for non-jQuery users
//
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
//
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function(window,undefined){
  '$:nomunge'; // Used by YUI compressor.

  // Since jQuery really isn't required for this plugin, use `jQuery` as the
  // namespace only if it already exists, otherwise use the `Cowboy` namespace,
  // creating it if necessary.
  var $ = window.jQuery || window.Cowboy || ( window.Cowboy = {} ),

    // Internal method reference.
    jq_throttle;

  // Method: jQuery.throttle
  //
  // Throttle execution of a function. Especially useful for rate limiting
  // execution of handlers on events like resize and scroll. If you want to
  // rate-limit execution of a function to a single time, see the
  // <jQuery.debounce> method.
  //
  // In this visualization, | is a throttled-function call and X is the actual
  // callback execution:
  //
  // > Throttled with `no_trailing` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X    X        X    X    X    X    X    X
  // >
  // > Throttled with `no_trailing` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X             X    X    X    X    X
  //
  // Usage:
  //
  // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
  // >
  // > jQuery('selector').bind( 'someevent', throttled );
  // > jQuery('selector').unbind( 'someevent', throttled );
  //
  // This also works in jQuery 1.4+:
  //
  // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  //
  // Arguments:
  //
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
  //    true, callback will only execute every `delay` milliseconds while the
  //    throttled-function is being called. If no_trailing is false or
  //    unspecified, callback will be executed one final time after the last
  //    throttled-function call. (After the throttled-function has not been
  //    called for `delay` milliseconds, the internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the throttled-function is executed.
  //
  // Returns:
  //
  //  (Function) A new, throttled, function.

  $.throttle = jq_throttle = function( delay, no_trailing, callback, debounce_mode ) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,

      // Keep track of the last time `callback` was executed.
      last_exec = 0;

    // `no_trailing` defaults to falsy.
    if ( typeof no_trailing !== 'boolean' ) {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }

    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;

      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply( that, args );
      };

      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      };

      if ( debounce_mode && !timeout_id ) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }

      // Clear any existing timeout.
      timeout_id && clearTimeout( timeout_id );

      if ( debounce_mode === undefined && elapsed > delay ) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();

      } else if ( no_trailing !== true ) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        //
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        //
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
      }
    };

    // Set the guid of `wrapper` function to the same of original callback, so
    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
    // callback as a reference.
    if ( $.guid ) {
      wrapper.guid = callback.guid = callback.guid || $.guid++;
    }

    // Return the wrapper function.
    return wrapper;
  };

  // Method: jQuery.debounce
  //
  // Debounce execution of a function. Debouncing, unlike throttling,
  // guarantees that a function is only executed a single time, either at the
  // very beginning of a series of calls, or at the very end. If you want to
  // simply rate-limit execution of a function, see the <jQuery.throttle>
  // method.
  //
  // In this visualization, | is a debounced-function call and X is the actual
  // callback execution:
  //
  // > Debounced with `at_begin` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // >                          X                                 X
  // >
  // > Debounced with `at_begin` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X                                 X
  //
  // Usage:
  //
  // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
  // >
  // > jQuery('selector').bind( 'someevent', debounced );
  // > jQuery('selector').unbind( 'someevent', debounced );
  //
  // This also works in jQuery 1.4+:
  //
  // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  //
  // Arguments:
  //
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
  //    unspecified, callback will only be executed `delay` milliseconds after
  //    the last debounced-function call. If at_begin is true, callback will be
  //    executed only at the first debounced-function call. (After the
  //    throttled-function has not been called for `delay` milliseconds, the
  //    internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the debounced-function is executed.
  //
  // Returns:
  //
  //  (Function) A new, debounced, function.

  $.debounce = function( delay, at_begin, callback ) {
    return callback === undefined
      ? jq_throttle( delay, at_begin, false )
      : jq_throttle( delay, callback, at_begin !== false );
  };

})(this);

/*
 * Undo.js - A undo/redo framework for JavaScript
 *
 * http://jzaefferer.github.com/undo
 *
 * Copyright (c) 2011 Jörn Zaefferer
 *
 * MIT licensed.
 */
(function() {

// based on Backbone.js' inherits
var ctor = function(){};
var inherits = function(parent, protoProps) {
  var child;

  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  ctor.prototype = parent.prototype;
  child.prototype = new ctor();

  if (protoProps) extend(child.prototype, protoProps);

  child.prototype.constructor = child;
  child.__super__ = parent.prototype;
  return child;
};

function extend(target, ref) {
  var name, value;
  for ( name in ref ) {
    value = ref[name];
    if (value !== undefined) {
      target[ name ] = value;
    }
  }
  return target;
};

var Undo = {
  version: '0.1.15'
};

Undo.Stack = function() {
  this.commands = [];
  this.stackPosition = -1;
  this.savePosition = -1;
};

extend(Undo.Stack.prototype, {
  execute: function(command) {
    this._clearRedo();
    command.execute();
    this.commands.push(command);
    this.stackPosition++;
    this.changed();
  },
  undo: function() {
    this.commands[this.stackPosition].undo();
    this.stackPosition--;
    this.changed();
  },
  canUndo: function() {
    return this.stackPosition >= 0;
  },
  redo: function() {
    this.stackPosition++;
    this.commands[this.stackPosition].redo();
    this.changed();
  },
  canRedo: function() {
    return this.stackPosition < this.commands.length - 1;
  },
  save: function() {
    this.savePosition = this.stackPosition;
    this.changed();
  },
  dirty: function() {
    return this.stackPosition != this.savePosition;
  },
  _clearRedo: function() {
    // TODO there's probably a more efficient way for this
    this.commands = this.commands.slice(0, this.stackPosition + 1);
  },
  changed: function() {
    // do nothing, override
  }
});

Undo.Command = function(name) {
  this.name = name;
}

var up = new Error("override me!");

extend(Undo.Command.prototype, {
  execute: function() {
    throw up;
  },
  undo: function() {
    throw up;
  },
  redo: function() {
    this.execute();
  }
});

Undo.Command.extend = function(protoProps) {
  var child = inherits(this, protoProps);
  child.extend = Undo.Command.extend;
  return child;
};

// AMD support
if (typeof define === "function" && define.amd) {
  // Define as an anonymous module
  define(Undo);
} else if(typeof module != "undefined" && module.exports){
  module.exports = Undo
}else {
  this.Undo = Undo;
}
}).call(this);

(function() {
  var $, EditCommand;

  $ = jQuery;

  this.UndoManager = (function() {
    var defaults;

    defaults = {
      debounceRate: 100
    };

    function UndoManager(editor, element, options) {
      this.editor = editor;
      this.element = element;
      if (options == null) {
        options = {};
      }
      this.medium = this.editor.medium;
      this.startValue = this.editor.getContent(this.element);
      this.newValue = '';
      this.startSelection = null;
      this.newSelection = null;
      this.blocked = false;
      this.undoBtn = $('.undo');
      this.redoBtn = $('.redo');
      this.stack = new Undo.Stack;
      this.options = {};
      $.extend(this.options, defaults, options);
      this.log("Starting with options: ", this.options);
      this.events();
      this.updateUI();
    }

    UndoManager.prototype.log = function() {
      Array.prototype.unshift.call(arguments, 'UndoManager:');
      return this.editor.log.apply(this.editor, arguments);
    };

    UndoManager.prototype.events = function() {
      $(this.element).observe('characterData childlist subtree', '*[class!=rangySelectionBoundary]', $.debounce(this.options.debounceRate, $.proxy(this, 'mutationCallback')));
      this.stack.changed = (function() {
        this.updateUI();
      }).bind(this);
      $(this.element).on('keyup', function(e) {
        if (e.metaKey || e.keyCode === 90) {
          e.preventDefault();
          return false;
        }
      });
      $(this.element).on('keydown', (function(e) {
        if (!e.metaKey || e.keyCode !== 90) {
          return;
        }
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
        return false;
      }).bind(this));
      $(document).on('click.undo', '.redo', (function(e) {
        this.redo();
        e.preventDefault();
        return false;
      }).bind(this));
      return $(document).on('click.undo', '.undo', (function(e) {
        this.undo();
        e.preventDefault();
        return false;
      }).bind(this));
    };

    UndoManager.prototype.undo = function() {
      if (this.stack.canUndo()) {
        return this.stack.undo();
      }
    };

    UndoManager.prototype.redo = function() {
      if (this.stack.canRedo()) {
        return this.stack.redo();
      }
    };

    UndoManager.prototype.mutationCallback = function(mutations) {
      if (this.blocked) {
        this.blocked = false;
        return;
      }
      this.newSelection = rangy.saveSelection();
      this.newValue = this.element.innerHTML;
      this.stack.execute(new EditCommand(this));
      rangy.removeMarkers(this.newSelection);
      this.startValue = this.newValue;
      this.startSelection = this.newSelection;
    };

    UndoManager.prototype.updateUI = function() {
      this.redoBtn.attr('disabled', !this.stack.canRedo());
      this.undoBtn.attr('disabled', !this.stack.canUndo());
    };

    return UndoManager;

  })();

  EditCommand = Undo.Command.extend({
    constructor: function(manager) {
      this.manager = manager;
      this.textarea = manager.element;
      this.oldValue = manager.startValue;
      this.newValue = manager.newValue;
      this.oldSelection = manager.startSelection;
      this.newSelection = manager.newSelection;
    },
    execute: function() {},
    undo: function() {
      this.manager.log("Undo: \n", this.oldValue);
      this.manager.blocked = true;
      this.textarea.innerHTML = this.oldValue;
      if (this.oldSelection) {
        this.oldSelection.restored = false;
        rangy.restoreSelection(this.oldSelection);
      }
    },
    redo: function() {
      this.manager.log("Redo: \n", this.newValue);
      this.manager.blocked = true;
      this.textarea.innerHTML = this.newValue;
      if (this.newSelection) {
        this.newSelection.restored = false;
        rangy.restoreSelection(this.newSelection);
      }
    }
  });

}).call(this);

(function() {
  var $;

  $ = jQuery;

  this.Editor = (function() {
    var defaults;

    defaults = {
      debug: false,
      undo: {
        debounceRate: 200
      },
      mediumConfig: {
        imageDragging: false,
        firstHeader: "h1",
        secondHeader: "h2",
        buttonLabels: 'fontawesome',
        disableAnchorPreview: false,
        checkLinkFormat: true,
        buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote', 'unorderedlist', 'orderedlist', 'removeFormat'],
        paste: {
          cleanPastedHtml: true,
          cleanAttrs: ['style', 'dir']
        }
      },
      mediumInsertConfig: {
        addons: {
          grid: true,
          images: {
            uploadScript: '/manage_photos',
            deleteScript: null,
            uploadCompleted: (function(el, data) {
              var that;
              that = this;
              return setTimeout((function() {
                that.syncTextArea();
              }), 200);
            }).bind(Editor)
          }
        }
      }
    };

    function Editor(selector, options) {
      var self;
      this.selector = selector;
      self = this;
      this.options = {};
      $.extend(this.options, defaults, options);
      this.textarea = $(this.selector).get(0);
      this.startEditor();
    }

    Editor.prototype.log = function() {
      if (this.options.debug && window.console) {
        Array.prototype.unshift.call(arguments, 'Editor:');
        return window.console.log.apply(window.console, arguments);
      }
    };

    Editor.prototype.startEditor = function() {
      if (this.options.debug) {
        this.log('Starting with options: ', this.options);
        $('body').addClass('debug');
      }
      if ($(this.selector).length > 0) {
        this.initMedium();
        this.initMediumInsert();
        this.events();
        this.initBoundTextAreas();
        return this.initUndo();
      }
    };

    Editor.prototype.initMedium = function() {
      return this.medium = new MediumEditor(this.selector, this.options.mediumConfig);
    };

    Editor.prototype.getContent = function(element) {
      return this.medium.serialize()[element.id].value;
    };

    Editor.prototype.events = function() {
      var element, i, len, ref;
      ref = this.medium.elements;
      for (i = 0, len = ref.length; i < len; i++) {
        element = ref[i];
        $(element).on("input", ((function(_this) {
          return function() {
            _this.log("Input: ", _this.getContent(element));
            unwrapper(element);
          };
        })(this)).bind(this));
      }
      this.medium.subscribe('editablePaste', (function(e, element) {
        this.log("Paste: ", this.getContent(element));
        this.syncTextArea(element);
      }).bind(this));
      return this.medium.subscribe('editableDrop', (function(e, element) {
        this.log("Drop: ", e, element);
        if (e.dataTransfer.files.length < 1) {
          return true;
        } else {
          return this.handleImageDropped(e, element);
        }
      }).bind(this));
    };

    Editor.prototype.initBoundTextAreas = function() {
      var element, i, len, ref, results;
      ref = this.medium.elements;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        element = ref[i];
        element.boundTextArea = this.textarea;
        element.innerHTML = this.textarea.value;
        results.push(this.syncTextArea(element));
      }
      return results;
    };

    Editor.prototype.syncTextArea = function(element) {
      var i, len, ref, results;
      this.log("Sync Textarea");
      if (!element) {
        ref = this.medium.elements;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          element = ref[i];
          results.push(element.boundTextArea.value = this.getContent(element));
        }
        return results;
      } else {
        return element.boundTextArea.value = this.getContent(element);
      }
    };

    Editor.prototype.initMediumInsert = function() {
      this.options.mediumInsertConfig.editor = this.medium;
      return $(this.selector).mediumInsert(this.options.mediumInsertConfig);
    };

    Editor.prototype.handleImageDropped = function(e, element) {
      var data, file, fileUploadOptions, imagePlugin, that;
      data = e.dataTransfer.files;
      that = this;
      imagePlugin = $.data(element, 'plugin_mediumInsertImages');
      file = $(imagePlugin.templates['src/js/templates/images-fileupload.hbs']());
      fileUploadOptions = {
        url: imagePlugin.options.uploadScript,
        dataType: 'json',
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        formData: imagePlugin.options.formData,
        dropZone: null,
        add: function(e, data) {
          $.proxy(imagePlugin, 'uploadAdd', e, data)();
        },
        done: function(e, data) {
          $.proxy(imagePlugin, 'uploadDone', e, data)();
        }
      };
      if (new XMLHttpRequest().upload) {
        fileUploadOptions.progress = function(e, data) {
          return $.proxy(imagePlugin, 'uploadProgress', e, data)();
        };
        fileUploadOptions.progressall = function(e, data) {
          return $.proxy(imagePlugin, 'uploadProgressall', e, data)();
        };
      }
      file.fileupload(fileUploadOptions);
      file.fileupload('add', {
        files: data
      });
      return false;
    };

    Editor.prototype.initUndo = function() {
      var element, i, len, ref, results, undoManager;
      ref = this.medium.elements;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        element = ref[i];
        results.push(undoManager = new UndoManager(this, element, {
          debounceRate: this.options.undo.debounceRate
        }));
      }
      return results;
    };

    return Editor;

  })();

}).call(this);

//= require ./medium.button.js
//= require ./medium.grid.js
//= require ./unwrapper
//= require ./jquery.debounce.js
//= require ./undo
//= require ./undo-manager
//= require ./editor
