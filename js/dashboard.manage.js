(function ($, Drupal, drupalSettings, _) {

  /**
   * Update ajax url for Manage Dashboard links.
   *
   * @param $block
   *   Dashboard block to update the manage link for.
   */
  function initDashboardManage($block) {
    var destination = 'destination=' + Drupal.encodePath(drupalSettings.path.currentPath);
    var tab = $block.data('contacts-manage-block-tab'),
      name = $block.data('contacts-manage-block-name'),
      url = [['/admin/contacts/ajax/manage-off-canvas', tab, name].join('/'), destination].join('?');

    // @todo Build link url as part of rendering but keep it hidden.
    $block.addClass('manage-wrapper');
    var link = $block.find('.manage-trigger');
    if (link.length !== 0) {
      link.find('a').attr('data-ajax-url', url);
    }

    $(document).trigger('drupalManageLinkAdded', {
      $el: $block
    });
  }

  /**
   * Update the Dashboard tab with changes made to block contents.
   *
   * @param tab
   *   ID of tab to be updated.
   * @param context
   *   The context of the tab.
   */
  function updateDashboardDrag(tab, context) {
    var $dragAreas = $(context).find('.drag-area');

    if ($dragAreas.length === 0) {
      return;
    }

    var regions = [];
    $dragAreas.each(function () {
      var sortedIDs = $(this).sortable("toArray", {attribute: 'data-contacts-manage-block-name'});
      if (sortedIDs.length !== 0) {
        var region = $(this, context).data('contacts-manage-region-id');

        var data = {
          'region': region,
          'blocks': sortedIDs
        };

        regions.push(data);
      }
    });

    var url = $(context).find('[data-contacts-manage-update-url]').data('contacts-manage-update-url'),
      postData = {
        regions: regions,
        tab: tab
      };

    $.ajax({
      type: 'POST',
      url: url,
      data: $.param(postData)
    }).done(function (data) {
      console.log(data);
    });
  }

  /**
   * Find all dashboard blocks and set manage ajax links.
   */
  Drupal.behaviors.contactsDashboardManage = {
    attach: function attach(context) {
      var $context = $(context);

      var $placeholders = $context.find('[data-contacts-manage-block-name]').once('contextual-render');
      if ($placeholders.length === 0) {
        return;
      }

      var ids = [];
      $placeholders.each(function () {
        ids.push($(this).data('contacts-manage-block-name'));
      });

      _.each(ids, function (id) {
        $placeholders = $context.find('[data-contacts-manage-block-name="' + id + '"]');

        for (var i = 0; i < $placeholders.length; i++) {
          initDashboardManage($placeholders.eq(i));
        }
      });
    }
  };

  /**
   * Set toolbar manage mode ajax link.
   */
  Drupal.behaviors.contactsDashboardManageToolbar = {
    attach: function attach(context) {
      var $context = $(context);

      var $placeholders = $context.find('.toolbar-dashboard-manage').once('toolbar-render');
      if ($placeholders.length === 0) {
        return;
      }

      $placeholders.each(function () {
        $(this).attr('data-ajax-url', '/admin/contacts/ajax/manage-mode');
        $(this).addClass('use-ajax');
        $(this).attr('data-ajax-progress', 'fullscreen');

        $(document).trigger('drupalManageTabAdded', {
          $el: $(this)
        });
      });
    }
  };

  /**
   * Add sorting of dashboard blocks in manage mode.
   */
  Drupal.behaviors.contactsDashboardManageDrag = {
    attach: function attach(context) {

      var $dragAreas = $(context).find('.drag-area');

      if ($dragAreas.length === 0) {
        return;
      }

      $dragAreas.each(function () {
        $(this).sortable({
          placeholder: "drag-area-placeholder",
          items: '.draggable',
          connectWith: '.drag-area',
          scrollSpeed: 10,
          update: function update(event, ui) {
            var itemRegion = ui.item.closest('.drag-area');
            if (event.target === itemRegion[0]) {

              var tab = ui.item.closest('[data-contacts-manage-block-tab]').data('contacts-manage-block-tab');
              updateDashboardDrag(tab, context);
            }
          }
        });
      });
    }
  };

  $(document).on('drupalManageLinkAdded', function (event, data) {
    Drupal.ajax.bindAjaxLinks(data.$el[0]);
  });

  $(document).on('drupalManageTabAdded', function (event, data) {
    Drupal.ajax.bindAjaxLinks(data.$el[0]);
  });

})(jQuery, Drupal, drupalSettings, _);
