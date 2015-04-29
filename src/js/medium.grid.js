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
