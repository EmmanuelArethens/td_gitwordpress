(function ($) {
    if (!Element.prototype.scrollIntoViewIfNeeded) {
        Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
            centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

            var parent = this.parentNode,
                parentComputedStyle = window.getComputedStyle(parent, null),
                parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
                parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
                overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
                overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
                overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
                overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
                alignWithTop = overTop && !overBottom;

            if ((overTop || overBottom) && centerIfNeeded) {
                parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
            }

            if ((overLeft || overRight) && centerIfNeeded) {
                parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
            }

            if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
                this.scrollIntoView(alignWithTop);
            }
        };
    }

    $.fn.tagName = function () {
        if (!this[0])
            return null;
        if (this[0] && this[0].nodeName) {
            return this[0].nodeName.toLowerCase();
        }
        return null;
    };

    $.fn.insertAt = function (index, $parent) {
        return this.each(function () {
            if ($(this).parent().is($parent)) {
                var siblings = $(this).siblings();
                if (index < siblings.length) {
                    siblings.eq(index).before(this);
                } else {
                    siblings.last().after(this);
                }
            } else {
                if (index === 0 || !$parent.children().length) {
                    $parent.prepend(this);
                } else {
                    if (index >= $parent.children().length) {
                        $parent.append(this);
                    } else {
                        $parent.children().eq(index - 1).after(this);
                    }
                }
            }
        });
    };


    if (!NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
        HTMLCollection.prototype.forEach = Array.prototype.forEach; // Because of https://bugzilla.mozilla.org/show_bug.cgi?id=14869

    }

    if (!Array.from) {
        Array.from = function (object) {
            return [].slice.call(object);
        };
    }

})(jQuery);

(function ($, root) {
    var CP_Customizer = {
            events: {
                "PREVIEW_LOADED": "PREVIEW_LOADED",
                "ADD_FIXED_OVERLAYS": "ADD_FIXED_OVERLAYS",
                "RIGHT_SECTION_CLOSED": "RIGHT_SECTION_CLOSED",
                "ELEMENT_DECORATED": "ELEMENT_DECORATED",
                "CONTENT_ROW_REMOVED": "CONTENT_ROW_REMOVED"
            },

            getSlug: window.getSlug,

            wpApi: wp.customize,

            hooks: window.hooksManager,

            CONTENT_ELEMENTS: 'p,h1,h2,h3,h4,h5,h6,a,span,i,hr,img,ul,div.spacer',
            TEXT_ELEMENTS: "p,h1,h2,h3,h4,h5,h6,span",
            THEME_MOD_NODES: '[data-theme],[data-theme-src],[data-theme-fa]',

            data: function () {
                return root.cpCustomizerGlobal.pluginOptions.data;
            },

            addContentElementsSelectors: function (selectors) {
                if (!_.isArray(selectors)) {
                    selectors = [selectors]
                }

                this.CONTENT_ELEMENTS = this.CONTENT_ELEMENTS.split(',').concat(selectors).join(',')
            },

            options: function (key, defaultValue) {
                var result = root.cpCustomizerGlobal.pluginOptions;

                if (key) {
                    var keyParts = key.split(':');
                    for (var i = 0; i < keyParts.length; i++) {
                        var part = keyParts[i];

                        if (!_.isUndefined(result[part])) {
                            result = result[part];
                        } else {
                            result = defaultValue;
                            break;
                        }
                    }
                }

                return result;
            },

            slugPrefix: function () {
                return root.cpCustomizerGlobal.pluginOptions.slugPrefix;
            },

            bind: function (event, callback) {
                $(window).bind('cp_customizer.' + event, callback);
            },

            unbind: function (event, callback) {
                $(window).unbind('cp_customizer.' + event, callback);
            },

            on: function (event, callback, async) {

                if (async) {
                    var originalCallback = callback;
                    callback = function () {
                        var args = Array.from(arguments);
                        var cb = this.callback;

                        setTimeout(function () {
                            cb.apply(this, args);
                        }, 0);

                    }.bind({
                        callback: originalCallback
                    });
                }

                this.bind('cp_customizer.' + event, callback);
            },

            off: function (event, callback) {
                this.unbind('cp_customizer.' + event, callback);
            },

            trigger: function (event, data) {
                $(window).trigger('cp_customizer.' + event, data);
            },

            showLoader: function () {
                $('div#cp-full-screen-loader').addClass('active');
            },

            hideLoader: function () {
                $('div#cp-full-screen-loader').removeClass('active');
            },

            jsTPL: {},

            __containerDataHandlers: {},

            addContainerDataHandler: function (selector, getter, setter) {
                this.__containerDataHandlers[selector] = {
                    getter: getter,
                    setter: setter
                };
            },

            __containerDataFilters: [],

            addContainerDataFilter: function (callback) {
                this.__containerDataFilters.push(callback);
            },


            __modules: [],
            __modulesLoaded: false,
            addModule: function (callback) {
                var self = this;

                jQuery(document).ready(function () {
                    // this.__modules.push(callback);
                    callback(self);
                });

            },

            popUp: function (title, elementID, data) {
                var selector = "#TB_inline?inlineId=" + elementID;
                var query = [];


                $.each(data || {}, function (key, value) {
                    query.push(key + "=" + value);
                });

                selector = query.length ? selector + "&" : selector + "";
                selector += query.join("&");

                root.tb_show(title, selector);

                root.jQuery('#TB_window').css({
                    'z-index': '5000001',
                    'transform': 'opacity .4s',
                    'opacity': 0
                });

                root.jQuery('#TB_overlay').css({
                    'z-index': '5000000'
                });


                setTimeout(function () {
                    root.jQuery('#TB_window').css({
                        'margin-top': -1 * ((root.jQuery('#TB_window').outerHeight() + 50) / 2),
                        'opacity': 1
                    });
                    root.jQuery('#TB_window').find('#cp-item-ok').focus();
                }, 0);

                if (data && data.class) {
                    root.jQuery('#TB_window').addClass(data.class);
                }

                return root.jQuery('#TB_window');
            },


            popUpInfo: function (title, content, data) {
                var id = _.uniqueId('temp-popup-text');

                var tempContainer = $('<div id="' + id + '" />').hide();
                tempContainer.appendTo($('body'));
                tempContainer.append('<div>' + content + '</div>');

                return this.popUp(title, id, data);

            },

            popupPrompt: function (title, text, value, callback, extraHTML) {

                if (extraHTML) {
                    extraHTML = '<div class="prompt-extra">' + extraHTML + '</div>';
                } else {
                    extraHTML = '';
                }

                var content = '' +
                    '<div class="prompt-wrapper">' +
                    '   <h4 class="prompt-title">' + text + '</h4>' +
                    '   <div class="prompt-content">' +
                    '      <input value="' + CP_Customizer.utils.htmlEscape(value) + '" type="text">' +
                    '   </div>' +
                    '   ' + extraHTML +
                    '   <div class="prompt-footer">' +
                    '      <button class="submit button button-primary">OK</button>' +
                    '      <button class="cancel button button-secondary">Cancel</button>' +
                    '   </div>' +
                    '</div>';

                var data = {
                    width: "400",
                    class: "popup-400"
                };

                var $content = this.popUpInfo(title, content, data);

                function onClose(canceled) {
                    var newValue = $content.find('input').val().trim();

                    if (canceled) {
                        newValue = null;
                    }

                    if (_.isFunction(callback)) {
                        callback(newValue, value)
                    }
                    CP_Customizer.closePopUps();
                }

                $content.on('keypress', 'input', function () {
                    if (event.which !== 13) {
                        return true;
                    }
                    onClose();
                });

                $content.on('click', 'button.submit', function () {
                    onClose();
                });


                $content.on('click', 'button.cancel', function () {
                    onClose(true);
                });

            },

            popupSelectPrompt: function (title, text, value, options, callback, emptySelection, extraHTML) {
                var select = '<select>';


                if (emptySelection) {
                    select += "<option value='' >" + emptySelection + "</option>";
                }

                for (var i in options) {
                    var selectedAttr = (i === value) ? "selected" : "";
                    select += "<option " + CP_Customizer.utils.htmlEscape(selectedAttr) + " value='" + i + "' >" + options[i] + "</option>";
                }

                select += '</select>';
                if (extraHTML) {
                    extraHTML = '<div class="prompt-extra">' + extraHTML + '</div>';
                } else {
                    extraHTML = '';
                }

                var content = '' +
                    '<div class="prompt-wrapper">' +
                    '   <h4 class="prompt-title">' + text + '</h4>' +
                    '   <div class="prompt-content">' +
                    '       ' + select +
                    '   </div>' +
                    '   ' + extraHTML +
                    '   <div class="prompt-footer">' +
                    '      <button class="submit button button-primary">OK</button>' +
                    '      <button class="cancel button button-secondary">Cancel</button>' +
                    '   </div>' +
                    '</div>';

                var data = {
                    width: "400",
                    class: "popup-400"
                };

                var $content = this.popUpInfo(title, content, data);

                function onClose(canceled) {
                    var newValue = $content.find('select').val();

                    if (canceled) {
                        newValue = null;
                    }

                    if (_.isFunction(callback)) {
                        callback(newValue, value)
                    }
                    CP_Customizer.closePopUps();
                }

                $content.on('click', 'button.submit', function () {
                    onClose();
                });


                $content.on('click', 'button.cancel', function () {
                    onClose(true);
                });

                return $content;

            },

            closePopUps: function () {
                root.tb_remove();
                root.jQuery('#TB_overlay').css({
                    'z-index': '-1'
                });
            },

            openMultiImageManager: function (title, callback, single) {
                var node = false;
                var interestWindow = root;
                custom_uploader = interestWindow.wp.media.frames.file_frame = interestWindow.wp.media({
                    title: title,
                    button: {
                        text: 'Choose Images'
                    },
                    multiple: !single
                });
                //When a file is selected, grab the URL and set it as the text field's value
                custom_uploader.on('select', function () {
                    var attachment = custom_uploader.state().get('selection').toJSON();
                    callback(attachment);
                });
                custom_uploader.off('close.cp').on('close.cp', function () {
                    callback(false);
                });
                //Open the uploader dialog
                custom_uploader.open();

                custom_uploader.content.mode('browse');
                // Show Dialog over layouts frame
                interestWindow.jQuery(interestWindow.wp.media.frame.views.selector).parent().css({
                    'z-index': '16000000'
                });
            },

            openImageManager: function (callback, multi) {
                this.openMultiImageManager('Image Manager', function (obj) {
                    if ($('iframe').length) {
                        $('iframe').get(0).focus();
                    }
                    if (!obj) {
                        return;
                    }
                    for (var i = 0; i < obj.length; i++) {
                        var link = obj[i].url;
                        callback(link);
                    }
                }, !multi);
            },

            openMediaCustomFrame: function (extender, mode, title, single, callback) {
                var interestWindow = root;

                var frame = extender(interestWindow.wp.media.view.MediaFrame.Select);

                var custom_uploader = new frame({
                    title: title,
                    button: {
                        text: title
                    },
                    multiple: !single
                });


                //When a file is selected, grab the URL and set it as the text field's value
                custom_uploader.on('select', function () {
                    attachment = custom_uploader.state().get('selection').toJSON();
                    custom_uploader.content.mode('browse');
                    callback(attachment);
                });


                custom_uploader.on('close', function () {
                    custom_uploader.content.mode('browse');
                    callback(false);
                });

                //Open the uploader dialog
                custom_uploader.open();
                custom_uploader.content.mode(mode);
                // Show Dialog over layouts frame
                interestWindow.jQuery(custom_uploader.views.selector).parent().css({
                    'z-index': '16000000'
                });

            },

            openFAManager: function (title, callback, single) {
                var node = false;
                var interestWindow = root;

                // if (!interestWindow.wp.media.cp.FAFrame) {
                var frame = interestWindow.wp.media.cp.extendFrameWithFA(interestWindow.wp.media.view.MediaFrame.Select);
                var custom_uploader = new frame({
                    title: title,
                    button: {
                        text: 'Choose Icon'
                    },
                    multiple: !single
                });
                interestWindow.wp.media.cp.FAFrame = custom_uploader;

                // }


                //When a file is selected, grab the URL and set it as the text field's value
                interestWindow.wp.media.cp.FAFrame.on('select', function () {
                    attachment = custom_uploader.state().get('selection').toJSON();
                    interestWindow.wp.media.cp.FAFrame.content.mode('browse');
                    callback(attachment);
                });
                interestWindow.wp.media.cp.FAFrame.on('close', function () {
                    interestWindow.wp.media.cp.FAFrame.content.mode('browse');
                    callback(false);
                });

                //Open the uploader dialog
                interestWindow.wp.media.cp.FAFrame.open();
                interestWindow.wp.media.cp.FAFrame.content.mode('cp_font_awesome');
                // Show Dialog over layouts frame
                interestWindow.jQuery(custom_uploader.views.selector).parent().css({
                    'z-index': '16000000'
                });

            },

            openCropableImageManager: function (width, height, callback) {
                var control = new root.wp.customize.CroppedImageControl('custom_image_cropper[' + Date.now() + ']');

                control.params = {
                    button_labels: {
                        frame_title: "Select Image"
                    },
                    height: height,
                    width: width
                };

                control.initFrame();
                control.frame.setState('library').open();
                control.frame.content.mode('browse');

                function fixCropKeyPressBug() {
                    setTimeout(function () {
                        root.jQuery(top.document).unbind(root.jQuery.imgAreaSelect.keyPress);
                    }, 100);
                }

                control.setImageFromAttachment = function (attachment) {
                    callback([attachment]);
                    fixCropKeyPressBug();
                };

                control.frame.on('close', function () {
                    fixCropKeyPressBug();
                });


                root.jQuery(control.frame.views.selector).parent().css({
                    'z-index': '16000000'
                });

                root.jQuery(control.frame.views.selector).find('.instructions').remove();
            },

            openGalleryImageManager: function (options, callback) {
                var interestWindow = root;
                options = _.extend({
                    "shortocode": false,
                    "ids": [],
                    "columns": "5",
                    "state": 'gallery-edit',
                    "size": "medium",
                    "link": "file"
                }, options);


                if (_.isArray(options.ids)) {
                    options.ids = options.ids.join(",");
                }

                if (_.isEmpty(options.ids.trim())) {
                    options.ids = 'fake-' + Date.now();
                }

                var shortcode = "[gallery";
                $.each(options, function (index, val) {
                    shortcode += " " + index + '="' + val + '"';
                });
                shortcode += "]";

                var gallery = interestWindow.wp.media.gallery;
                var frame = gallery.edit(shortcode);


                frame.state(options.state).on('update', function (selection) {
                    var ids = selection.map(function (model) {
                        return model.id
                    });
                    callback(selection, ids);
                });


                // if (options.mediaSidebar === false) {
                //     frame.$el.find('.media-sidebar').hide();
                //     frame.$el.find('.media-sidebar').siblings('.media-toolbar ul').css('right', '0px');
                // } else {
                //     frame.$el.find('.media-sidebar').siblings('.media-toolbar ul').css('right', '');
                //     frame.$el.find('.media-sidebar').show();
                // }

                interestWindow.jQuery(frame.views.selector).parent().css({
                    'z-index': '16000000'
                });

                if (options.ids.match(/fake-\d+/)) {
                    frame.setState('gallery-library')
                }
            },

            openMediaBrowser: function (type, callback, data) {
                var cb;
                if (callback instanceof jQuery) {
                    cb = function (response) {

                        if (!response) {
                            return;
                        }

                        var value = response[0].url;
                        if (data !== "multiple") {
                            if (type == "icon") {
                                value = response[0].fa;
                            }
                            callback.val(value).trigger('change');
                        }
                    };
                } else {
                    cb = function () {
                        callback.apply(this, arguments);
                        CP_Customizer.preview.blur();
                    }
                }

                switch (type) {
                    case "image":
                        this.openMultiImageManager('Change image', cb, data);
                        break;
                    case "cropable":
                        this.openCropableImageManager(data.width, data.height, cb);
                        break;
                    case "icon":
                        this.openFAManager('Change Font Awesome Icon', cb);
                        break;
                    case "gallery":
                        this.openGalleryImageManager(data, cb);
                        break;
                }
            },

            getCustomizerRootEl: function () {
                return root.jQuery(root.document.body).find('form#customize-controls');
            },

            openRightSidebar: function (elementId, options) {
                options = options || {};
                this.hideRightSidebar();
                var $form = this.getCustomizerRootEl();
                var $container = $form.find('#' + elementId + '-popup');
                if ($container.length) {
                    $container.addClass('active');

                    if (options.floating && !_(options.y).isUndefined()) {
                        $container.css({
                            top: options.y
                        });
                    }
                } else {
                    $container = $('<li id="' + elementId + '-popup" class="reiki-right-section active"> <span data-reiki-close-right="true" title="Close Panel" class="close-panel"></span> </li>');

                    if (options.floating) {
                        $container.addClass('floating');
                    }

                    $toAppend = $form.find('li#accordion-section-' + elementId + ' > ul');

                    if ($toAppend.length === 0) {
                        $toAppend = $form.find('#sub-accordion-section-' + elementId);
                    }


                    if ($toAppend.length === 0) {
                        $toAppend = $('<div class="control-wrapper" />');
                        $toAppend.append($form.find('#customize-control-' + elementId).children());
                    }

                    $form.append($container);
                    $container.append($toAppend);

                    if (options.floating && !_(options.y).isUndefined()) {
                        $container.css({
                            top: options.y
                        });
                    }


                    $container.find('span.close-panel').click(CP_Customizer.hideRightSidebar);

                }

                if (options.focus) {
                    $container.find(options.focus)[0].scrollIntoViewIfNeeded();
                }

                $container.css('left', jQuery('#customize-header-actions')[0].offsetWidth + 1);

                CP_Customizer.hooks.doAction('right_sidebar_opened', elementId, options, $container);

                $form.find('span[data-reiki-close-right="true"]').click(function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    CP_Customizer.hideRightSidebar();
                });

                $form.find('li.accordion-section').unbind('click.right-section').bind('click.right-section', function (event) {
                    if ($(event.target).is('li') || $(event.target).is('.accordion-section-title')) {
                        CP_Customizer.hideRightSidebar();
                    }
                });

            },

            hideRightSidebar: function () {
                var $form = root.jQuery(root.document.body).find('#customize-controls');
                var $visibleSection = $form.find('.reiki-right-section.active');
                if ($visibleSection.length) {
                    $visibleSection.removeClass('active');
                    root.CP_Customizer.trigger(root.CP_Customizer.events.RIGHT_SECTION_CLOSED, [$visibleSection]);
                }

            },

            isRightSidebarVisible: function (sectionID) {
                var $form = root.jQuery(root.document.body).find('#customize-controls');
                return $form.find('#' + sectionID + '-popup').hasClass('active');
            },

            updateState: function (force) {
                if (force) {
                    this._setContent();
                } else {
		    this.setContent();
		}
                
                this.overlays.hoverOverlay().hide();
                this.overlays.updateAllOverlays();
            },


            __changesetUpdate: _.debounce(function (callback) {
                var changeSet = root.CP_Customizer.wpApi.requestChangesetUpdate.apply(root.CP_Customizer.wpApi);
                if (_.isFunction(callback)) {
                    changeSet.then(callback);
                }
            }, 10),

            __requestCachedCbs: [],
            requestChangesetUpdate: function (cb) {
                if (_.isFunction(cb)) {
                    this.__requestCachedCbs.push(cb);
                }
                var self = this;
                this.__changesetUpdate(function () {
                    while (self.__requestCachedCbs.length) {
                        var cb = self.__requestCachedCbs.shift();
                        cb.call(self);
                    }
                });
            },

            // if the mod is not set create a dirty one
            __onSetForcedTransport: {},
            setMod: function (mod, value, transport, reqCB) {

                mod = CP_Customizer.utils.phpTrim(mod, "|");

                var modParts = mod.split('|');
                mod = modParts.shift();

                var setting = root.wp.customize(mod);
                value = _.clone(value);
                if (!setting) {
                    mod = "CP_AUTO_SETTING[" + mod + "]";
                    setting = root.wp.customize(mod);
                    if (!setting) {
                        setting = wp.customize.create(mod, mod, {}, {
                            type: 'theme_mod',
                            transport: (transport || 'postMessage'),
                            previewer: wp.customize.previewer
                        });
                    }
                }

                var oldTransport = setting.transport;
                if (!this.__onSetForcedTransport[setting.id]) {
                    this.__onSetForcedTransport[setting.id] = oldTransport;
                }

                if (transport) {
                    setting.transport = transport;
                }

                var oldValue = _.clone(setting._value);

                var jsonEncoded = false;
                try {
                    var parsed = decodeURI(oldValue);
                    parsed = JSON.parse(parsed);

                    if (_.isObject(parsed) || _.isArray(parsed)) {
                        oldValue = parsed;
                        jsonEncoded = true;
                    }
                } catch (e) {

                }

                if (_.isObject(oldValue)) {
                    setting._value = undefined; // force no value before set( forces the setting to set the value )
                }

                if (modParts.length) {

                    if (!oldValue || _.isEmpty(oldValue)) {
                        oldValue = CP_Customizer.preview.data('mod_defaults')[mod];
                    }

                    var path = modParts.join('.');
                    value = CP_Customizer.utils.setToPath(oldValue, path, value);
                }

                var control = wp.customize.control(mod);


                if (jsonEncoded) {
                    value = encodeURI(JSON.stringify(value));
                }

                setting.set(value);

                // update control

                if (control) {
                    var type = control.params.type;
                    if (type === "radio-html") {
                        jQuery(control.container.find('input[value="' + value + '"]')).prop('checked', true);
                    } else {
                        if (type === "kirki-spacing") {
                            for (var prop in value) {
                                if (value.hasOwnProperty(prop)) {
                                    jQuery(control.container.find('.' + prop + ' input')).prop('value', value[prop]);
                                }
                            }
                        } else {
                            if (type.match('kirki')) {
                                kirkiSetSettingValue(mod, value);
                            }
                        }
                    }
                }


                var changeSetCB = function () {
                    if (this.__onSetForcedTransport[setting.id]) {
                        setting.transport = this.__onSetForcedTransport[setting.id];
                        this.__onSetForcedTransport[setting.id] = null;
                    }

                    if (_.isFunction(reqCB)) {
                        reqCB();
                    }

                };

                if (_.isFunction(reqCB)) {
                    this.requestChangesetUpdate(changeSetCB);
                } else {
                    setting.transport = oldTransport;
                }

            },

            getMod: function (mod, defaultValue) {
                var setting = root.wp.customize(mod);
                if (!setting) {
                    mod = "CP_AUTO_SETTING[" + mod + "]";
                    setting = root.wp.customize(mod);
                }

                if (!setting) {
                    return defaultValue;
                }

                return _.clone(setting.get());
            },

            onModChange: function (mod, callback) {
                var autoMod = "CP_AUTO_SETTING[" + mod + "]";
                var modCallback = _.debounce(function (value) {
                    if (_.isFunction(callback)) {
                        value.bind(callback);
                    }
                }, 100);


                CP_Customizer.wpApi(mod, modCallback);
                CP_Customizer.wpApi(autoMod, modCallback);

            },

            setMultipleMods: function (mods, transport, finishCb) {
                var index = 0;

                $(root).off('blur.wp-customize-changeset-update');

                var reqCB = function () {
                    index -= 1;
                    if (index <= 0) {
                        if (_.isFunction(finishCb)) {
                            finishCb();
                        }
                        index = 0;
                    }
                };


                _.each(mods, function (value, mod) {
                    index += 1;
                    CP_Customizer.setMod(mod, value, transport, reqCB);
                });
            },

            _setContent: function (callback) {
                var previewJQuery = CP_Customizer.preview.jQuery();

                if (root.CP_Customizer.preview.data().maintainable) {
                    var content = root.CP_Customizer.preview.getContent().trim();
                    content = '<!--@@CPPAGEID[' + root.CP_Customizer.preview.data().pageID + ']@@-->' + content;
                    var setting = root.wp.customize('page_content');
                    if (!setting) {
                        return;
                    }


                    setting.set(content);
                }

                var modsToSet = {};

                this.preview.find("[data-theme-href]").each(function () {
                    var prop = jQuery(this).attr('data-theme-href');
                    var val = jQuery(this).attr('href').trim();
                    // root.CP_Customizer.setMod(prop, val);
                    modsToSet[prop] = CP_Customizer.preview.cleanURL(val);
                });

                this.preview.find("[data-theme-target]").each(function () {
                    var prop = jQuery(this).attr('data-theme-target');
                    var val = jQuery(this).attr('target') || "_self";
                    // root.CP_Customizer.setMod(prop, val.trim());
                    modsToSet[prop] = val.trim();
                });


                this.preview.find("[data-theme-src]").each(function () {
                    var prop = jQuery(this).attr('data-theme-src');
                    var val = jQuery(this).attr('src');
                    // root.CP_Customizer.setMod(prop, val.trim());
                    modsToSet[prop] = val.trim();
                });

                this.preview.find("[data-theme-fa]").each(function () {
                    var prop = jQuery(this).attr('data-theme-fa');
                    var val = jQuery(this).attr('class').match(/fa\-[a-z\-]+/ig).pop();
                    // root.CP_Customizer.setMod(prop, val.trim());
                    modsToSet[prop] = val.trim();
                });

                if (root.CP_Customizer.options().mods) {
                    for (var selector in root.CP_Customizer.options().mods) {
                        var $el = this.preview.find(selector);
                        var modData = root.CP_Customizer.options().mods[selector];
                        if (modData.atts) {
                            for (var attr in modData.atts) {
                                // $el.attr('data-theme-' + attr, modData.atts[attr]);
                                var prop = $el.attr('data-theme-' + attr);
                                var val = root.CP_Customizer.hooks.applyFilters('temp_attr_mod_value', $el.attr(attr) || "", attr, $el);
                                // root.CP_Customizer.setMod(prop, val.trim());
                                modsToSet[prop] = val.trim();
                            }
                        }


                    }
                }

                this.preview.find("[data-dynamic-mod='true']").each(function () {
                    var atts = Array.from(this.attributes),
                        $el = root.CP_Customizer.preview.find(this);

                    for (var i = 0; i < atts.length; i++) {
                        var attr = atts[i].name,
                            prop = atts[i].value;

                        if (attr.indexOf('data-theme-') === 0) {
                            attr = attr.replace('data-theme-', '');
                            var val = root.CP_Customizer.hooks.applyFilters('temp_attr_mod_value', $el.attr(attr) || "", attr, $el);
                            modsToSet[prop] = val.trim();
                        }

                    }
                });

                this.preview.find("[data-theme]").each(function () {

                    var prop = jQuery(this).attr('data-theme');

                    if (!previewJQuery(this).data('was-changed')) {
                        if (previewJQuery('[data-theme="' + prop + '"]').length > 1) {
                            return;
                        }
                    }

                    // root.CP_Customizer.preview.cleanNode(toSave);
                    // var toSave = jQuery(this).clone();

                    var toSave = jQuery(this).clone();
                    var val = root.CP_Customizer.preview.getContent($(this));
                    // root.CP_Customizer.setMod(prop, val);
                    modsToSet[prop] = val.trim();
                    $(this).data('was-changed', false);
                });

                root.CP_Customizer.cleanClose();

                CP_Customizer.setMultipleMods(modsToSet, 'postMessage', callback);

            },

            setContent: _.debounce(function(callback) {
                this._setContent(callback); 
            }, 200),

            save: function () {

                CP_Customizer.preview.blur();
                this.setContent(function () {
                    wp.customize.previewer.save();
                });
            },

            cleanClose: function () {

            },

            __saveTimeout: false,

            markSave: _.debounce(function () {
                var self = this;
                clearTimeout(self.__saveTimeout);

                self.__saveTimeout = setTimeout(function () {
                    self.setContent();
                }, 500);
            }, 200),


            parseShortcode: function (shortcode) {
                shortcode = shortcode.replace('[', '').replace(']', '');

                var tag = shortcode.split(' ')[0].trim();
                var shortcodeAttrs = shortcode.match(/(\s(.*?)=")(.*?)(")/ig);
                var response = {
                    tag: tag,
                    attrs: {}
                };
                if (!shortcodeAttrs) {
                    return response;
                }
                for (var i = 0; i < shortcodeAttrs.length; i++) {
                    var attr = shortcodeAttrs[i].trim();
                    response.attrs[attr.split('=')[0]] = attr.split('="')[1].slice(0, -1)
                }
                return response;

            },

            isShortcodeContent: function ($node) {
                return root.jQuery($node).closest('[data-content-shortcode]').length > 0;
            },

            isShortcodeContentEditable: function ($node) {
                return root.jQuery($node).closest('[data-content-shortcode][data-editable="true"]').length > 0;
            },

            isOnCanvasMod: function (node) {
                node = $(node)[0];
                var hasThemeModAtt = Array.from(node.attributes).map(function (a) {

                    return (a.name.toLowerCase().indexOf('data-theme') !== -1);

                }).reduce(function (a, b) {
                    return a || b;
                });

                return hasThemeModAtt;
            },

            nodeWrapsShortcode: function ($node, tag) {
                var shortcode = this.getNodeShortcode($node);

                if (shortcode) {
                    return (shortcode.tag === tag.trim());
                }

                return false;
            },

            getNodeShortcode: function ($node) {
                if (!$node.attr('data-content-shortcode')) {
                    return undefined;
                }

                return this.parseShortcode($node.attr('data-content-shortcode'));
            },

            renderNodeShortcodes: function ($node) {
                $node = $($node); // make sure the node is wrapped with jqury
                var $nodes = $node.find('[data-content-shortcode]');
                if ($node.is('[data-content-shortcode]')) {
                    $nodes = $nodes.add($node);
                }
                var self = this;
                $nodes.each(function () {
                    self.updateNodeShortcode($(this), "[" + $(this).attr('data-content-shortcode') + "]");
                })
            },
            updateNodeShortcode: function ($node, shortcode, noRerender, context) {
                if (!$node.attr('data-content-shortcode')) {
                    return undefined;
                }

                var attrShortcode = shortcode.replace('[', '').replace(']', '');

                $node.attr('data-content-shortcode', attrShortcode);

                if (noRerender !== true) {
                    if (!context) {
                        context = {
                            query: CP_Customizer.preview.data().queryVars
                        }
                    }

                    (function ($node) {
                        CP_Customizer.preview.pauseObserver();
                        CP_Customizer.preview.blur();
                        $node.html('<div class="shortcode-temp-placeholder"></div>');
                        jQuery.ajax({
                            url: ajaxurl,
                            method: 'POST',
                            data: {
                                action: 'cp_shortcode_refresh',
                                shortcode: btoa(shortcode),
                                context: context,
                                _: Date.now()
                            }
                        }).done(function (response) {
                            $node.empty();
                            $node.html(response);

                            CP_Customizer.hideLoader();
                            CP_Customizer.preview.decorateMods($node);
                            CP_Customizer.preview.decorateElements($node);

                            _.delay(function () {
                                root.CP_Customizer.hooks.doAction("shortcode_updated", $node, shortcode);
                                root.CP_Customizer.updateState();
                            }, 0);
                        });
                        CP_Customizer.preview.restartObserver();
                    })($node);
                }

                CP_Customizer.updateState();
                return true;
            },

            updateNodeFromShortcodeObject: function ($node, shortcodeObj, noRerender, context) {
                var shortcode = '[' + shortcodeObj.tag + ' ';

                for (var a in shortcodeObj.attrs) {
                    shortcode += a + '="' + shortcodeObj.attrs[a] + '" ';
                }

                shortcode += ']';

                return this.updateNodeShortcode($node, shortcode, noRerender, context);
            },

            preview: {
                frame: function () {
                    var frame = wp.customize.previewer.targetWindow.get();

                    if (!frame) {
                        frame = wp.customize.previewer.container.find('iframe')[0];

                        if (frame) {
                            frame = frame.contentWindow;
                        } else {
                            frame = null;
                        }
                    }

                    return frame;
                },

                currentDevice: function () {
                    return jQuery('.active[data-device]').data('device');
                },


                __observerFunctionsToPause: ["prepareFormPreview", "prepareLinkPreview"],
                __observerOriginalFunctions: {},

                pauseObserver: function () {
                    var previewApi = CP_Customizer.preview.frame().wp.customize;

                    this.__observerOriginalFunctions = {};
                    var self = CP_Customizer.preview;
                    _.each(self.__observerFunctionsToPause, function (fn) {
                        if (_.isFunction(previewApi[fn])) {
                            self.__observerOriginalFunctions[fn] = previewApi[fn];
                            previewApi[fn] = function () {
                            };
                        }
                    });
                },

                restartObserver: _.debounce(function () {
                    var previewApi = CP_Customizer.preview.frame().wp.customize;

                    var self = CP_Customizer.preview;
                    _.each(self.__observerFunctionsToPause, function (fn) {
                        if (_.isFunction(previewApi[fn]) && _.isFunction(self.__observerOriginalFunctions[fn])) {
                            previewApi[fn] = self.__observerOriginalFunctions[fn];
                        }
                    });
                }, 100),


                addSilentExecution: function (callback) {
                    return _.compose(this.pauseObserver, callback, this.restartObserver);
                },

                silentCall: function (callback) {
                    var args = arguments.length > 1 ? arguments[1] : undefined;
                    var context = arguments.length > 2 ? arguments[2] : this;

                    callback = this.addSilentExecution(callback);

                    return callback.apply(context, arguments);
                },

                __refreshDone: true,

                refresh: _.throttle(function () {
                    CP_Customizer.wpApi.previewer.refresh();
                }, 100),

                data: function (key, defaultValue) {

                    if (!this.frame()) {
                        return {};
                    }

                    var result = this.frame().cpCustomizerPreview || {};

                    if (key) {
                        var keyParts = key.split(':');
                        for (var i = 0; i < keyParts.length; i++) {
                            var part = keyParts[i];

                            if (!_.isUndefined(result[part])) {
                                result = result[part];
                            } else {
                                result = defaultValue;
                                break;
                            }
                        }
                    }

                    return result;
                },

                getChangesetURL: function () {
                    var changeset = wp.customize.settings.changeset.uuid ? "?changeset_uuid=" + wp.customize.settings.changeset.uuid : "";

                    if (changeset) {
                        changeset += "&cp__changeset__preview=" + Date.now();
                    }

                    return window.location.origin + window.location.pathname + changeset;
                },

                isPageMaintainable: function () {
                    return this.data.maintainable;
                },

                // http://stackoverflow.com/questions/7451468/contenteditable-div-how-can-i-determine-if-the-cursor-is-at-the-start-or-end-o/7478420#7478420
                getSelectionTextInfo: function (el) {
                    var atStart = false, atEnd = false;
                    var window = this.frame();
                    var document = this.frame().document;
                    var selRange, testRange;
                    if (window.getSelection) {
                        var sel = window.getSelection();
                        if (sel.rangeCount) {
                            selRange = sel.getRangeAt(0);
                            testRange = selRange.cloneRange();

                            testRange.selectNodeContents(el);
                            testRange.setEnd(selRange.startContainer, selRange.startOffset);
                            atStart = (testRange.toString() == "");

                            testRange.selectNodeContents(el);
                            testRange.setStart(selRange.endContainer, selRange.endOffset);
                            atEnd = (testRange.toString() == "");
                        }
                    } else if (document.selection && document.selection.type != "Control") {
                        selRange = document.selection.createRange();
                        testRange = selRange.duplicate();

                        testRange.moveToElementText(el);
                        testRange.setEndPoint("EndToStart", selRange);
                        atStart = (testRange.text == "");

                        testRange.moveToElementText(el);
                        testRange.setEndPoint("StartToEnd", selRange);
                        atEnd = (testRange.text == "");
                    }

                    return {atStart: atStart, atEnd: atEnd};
                },

                isCustomFrontPage: function () {
                    return this.data.isFrontPage;
                },

                jQuery: function (data) {
                    if (data) {
                        return this.frame().jQuery(data);
                    }
                    return this.frame().jQuery;
                },

                getPageContainerSelector: function () {
                    var startSelector = "#cp_customizer_content_area_start";

                    var attrName = 'data-cp-content-container-' + top.CP_Customizer.slugPrefix();
                    var $parent = this.jQuery(startSelector).parent();
                    if (!$parent.attr(attrName)) {
                        $parent.attr(attrName, _.uniqueId("page-content-container-"));
                    }

                    selector = "[" + attrName + "='" + $parent.attr(attrName) + "']";

                    selector = CP_Customizer.hooks.applyFilters('page_content_container_selector', selector);

                    return selector;
                },

                getRootNode: function () {
                    if (!wp.customize('page_content')) {
                        return this.jQuery("<div/>");
                    }

                    return this.find(this.getPageContainerSelector());
                },

                find: function (query) {
                    var $ = this.jQuery();
                    return $(query);
                },

                getSectionByDataId: function (id) {
                    return this.find('[data-id="' + id + '"]');
                },

                getThemeMods: function ($container) {
                    if (!$container || $container.is(this.getRootNode())) {
                        $container = this.jQuery('body');
                    }

                    var themeModNodesSelector = root.CP_Customizer.hooks.applyFilters('theme_mod_nodes_selector', root.CP_Customizer.THEME_MOD_NODES);

                    if (root.CP_Customizer.options().mods) {
                        for (var m in root.CP_Customizer.options().mods) {
                            themeModNodesSelector += ',' + m;
                        }
                    }

                    $themeModNodes = $container.find(themeModNodesSelector);

                    if ($container.is(themeModNodesSelector)) {
                        $themeModNodes.add($container);
                    }

                    return $themeModNodes;
                },

                getContentNodes: function (filter) {
                    var nodes = this.getRootNode().children().toArray();
                    nodes.html = function () {
                        return this.map(function (node) {
                            return node.outerHTML;
                        }).join('');
                    };

                    return nodes;
                },

                getContent: function ($node) {

                    $node = $node || this.getContentNodes();
                    var nodesHML = $node.html();
                    var $currentNodes = $('<div/>').append(nodesHML);

                    $currentNodes.find('.reiki-customizer-ordering-overlay').remove();

                    // cleanup inline styling, leaving only background properties and typography
                    $currentNodes[0].querySelectorAll('[style]').forEach(function (el) {
                        var style = el.getAttribute('style'),
                            whitelistedProps = root.CP_Customizer.options('cssAllowedProperties'),
                            inlineCss = {},
                            styleProps = style.split(';');

                        for (var i = 0; i < styleProps.length; i++) {
                            var propParts = styleProps[i].split(':'),
                                prop = (propParts.shift() || "").trim(),
                                value = (propParts || []).join(':').trim();

                            if (prop && value) {
                                inlineCss[prop] = value;
                            }

                        }

                        var inlineCssText = "";

                        for (var prop in inlineCss) {
                            inlineCssText += prop + ': ' + inlineCss[prop] + '; ';
                        }

                        if (inlineCssText.trim()) {
                            el.setAttribute('style', inlineCssText.trim());
                        } else {
                            el.removeAttribute('style');
                        }

                        el.removeAttribute('data-mce-style');

                    });


                    $currentNodes[0].querySelectorAll('[data-content-shortcode]').forEach(function (el) {
                        el.innerHTML = '[' + el.getAttribute('data-content-shortcode') + ']';
                    });


                    $currentNodes[0].querySelectorAll('[data-attr-shortcode]').forEach(function (el) {
                        var attr = el.getAttribute('data-attr-shortcode');
                        var parts = attr.split(',');

                        for (var i = 0; i < parts.length; i++) {
                            var part = parts[i].trim();
                            part = part.split(':');
                            el.setAttribute(part[0].trim(), '[' + part[1].trim() + ']');
                        }
                    });


                    this.cleanNode($currentNodes);

                    $currentNodes[0].querySelectorAll('*').forEach(function (el) {
                        var attributes = el.attributes;
                        for (var i = 0; i < attributes.length; i++) {
                            var attrName = attributes.item(i).name;
                            if (attrName.match(/scrollreveal/)) {
                                el.removeAttribute(attrName);
                            }
                        }
                    });

                    $currentNodes.find('*').not('[data-cpid]').remove();

                    // $currentNodes.find('*').not('[data-cpid]').each(function () {
                    //     var $el = $(this);

                    //     if ($el.attr('data-cp-remove-this')) {
                    //         $el.remove();
                    //     }

                    //     if (this.previousSibling && this.previousSibling.nodeType === 8) {
                    //         var commentText = this.previousSibling.textContent,
                    //             shortcode = "",
                    //             startComment = "";

                    //         this.previousSibling.parentNode.removeChild(this.previousSibling);
                    //         if (commentText.match(/cp-shortcode:(.*?):(.*)/)) {
                    //             shortcode = commentText.match(/cp-shortcode:(.*?):(.*)/).pop();
                    //             startComment = commentText;
                    //         }

                    //         var nextSibling = this.nextSibling;

                    //         while (nextSibling) {
                    //             if (nextSibling.nodeType === 8) {
                    //                 var commentText = nextSibling.textContent;

                    //                 if (commentText.trim() === startComment.trim()) {
                    //                     nextSibling.parentNode.removeChild(nextSibling);
                    //                     break;
                    //                 }
                    //             }

                    //             $(nextSibling).attr('data-cp-remove-this', '1');
                    //             nextSibling = nextSibling.nextSibling;
                    //         }

                    //         this.outerHTML = shortcode;
                    //     } else {
                    //         $el.remove();
                    //     }
                    // });

                    $currentNodes.find('br').each(function () {
                        if (!this.nextSibling) {
                            $(this).remove();
                        }
                    });

                    CP_Customizer.hooks.applyFilters('get_content', $currentNodes);
                    return $currentNodes.html().replace(/data-cpid="[^"]+"/gi, '');

                },

                __cleanNode: function (el) {
                    el.removeAttribute('data-content-editable');
                    el.removeAttribute('data-content-code-editable');
                    el.removeAttribute('data-container-editable');
                    el.removeAttribute('contenteditable');
                    el.removeAttribute('spellcheck');

                    el.classList.remove('ui-sortable');
                    el.classList.remove('ui-sortable-disabled');
                    el.classList.remove('ui-sortable-handle');
                    el.classList.remove('customize-unpreviewable');

                    var elClass = el.getAttribute('class');
                    if (elClass) {
                        // remove the tinymce (mce-*) classes;
                        elClass = elClass.replace(/mce\-[a-z\-]+/ig, "").trim();

                        // remove multiple spaces in class names
                        elClass = elClass.replace(/\s\s+/g, ' ');

                        el.setAttribute('class', elClass);
                    }

                    if (el.id && el.id.indexOf('mce_') === 0) {
                        el.removeAttribute('id');
                    }

                    // preview styles
                    el.removeAttribute('data-preview-empty');

                    // clean node url

                    if (el.getAttribute('href')) {
                        var href = CP_Customizer.preview.cleanURL(el.getAttribute('href'));
                        el.setAttribute('href', href)
                    }
                },


                getNodeClasses: function (node) {
                    var $clone = $(node).clone();
                    this.__cleanNode($clone[0]);
                    return Array.from($clone[0].classList);
                },

                cleanNode: function ($node) {

                    $node[0].querySelectorAll('[data-content-editable], [data-content-code-editable], [data-container-editable]').forEach(function (el) {
                        root.CP_Customizer.preview.__cleanNode(el);
                    });

                    $node[0].querySelectorAll('.ui-sortable,.ui-sortable-disabled,.ui-sortable-handle').forEach(function (el) {
                        root.CP_Customizer.preview.__cleanNode(el);
                    });

                    root.CP_Customizer.preview.__cleanNode($node[0]);

                    return $node;
                },

                cleanURL: function (url) {
                    url = url
                        .replace(/customize_theme=([a-z0-9\-]+)/, "")
                        .replace(/customize_changeset_uuid=([a-z0-9\-]+)/, "")
                        .replace(/customize_messenger_channel=([a-z0-9\-]+)/, "");

                    url = url.replace(/\?&/, ""); // replace remaining characters

                    return url;
                },


                markNode: function ($node, prefix) {

                    CP_Customizer.preview.pauseObserver();
                    prefix = prefix || 'new_cp_node_';

                    $($node).find("*").andSelf().each(function () {
                        $(this).attr('data-cpid', _.uniqueId(prefix));
                    });

                    CP_Customizer.preview.restartObserver();
                },

                insertNode: function ($node, $parent, index) {

                    CP_Customizer.preview.silentCall(function () {
                        index = (index !== undefined) ? index : $parent.children().length;
                        jQuery($node).insertAt(index, $parent);

                        this.decorateElements($node);
                        this.markNode($node);

                        root.CP_Customizer.updateState();

                        $parent.removeAttr('data-preview-empty');
                    });
                },

                removeNode: function ($node, skipUpdate) {
                    CP_Customizer.preview.pauseObserver();
                    var $parent = $node.parent();
                    $node.remove();

                    if (!skipUpdate) {
                        root.CP_Customizer.updateState();
                    }

                    if ($parent.children().length === 0) {
                        $parent.attr('data-preview-empty', 1);
                    } else {
                        $parent.removeAttr('data-preview-empty');
                    }

                    _.delay(function () {
                        root.CP_Customizer.overlays.hoverOverlay().hide();
                        var addOverlay = root.CP_Customizer.overlays.addOverlay();
                        root.CP_Customizer.overlays.updateOverlay(addOverlay, addOverlay.data().node, false, true);
                    }, 10);

                    CP_Customizer.preview.restartObserver();
                },


                insertContentSection: function (newRow, index) {
                    index = _.isNumber(index) ? index : undefined;

                    if (_.isUndefined(index) && this.getRootNode().children('[data-id][data-label]').length) {
                        index = this.getRootNode().children('[data-id][data-label]').last().index() + 1;
                    }

                    this.insertNode(newRow, this.getRootNode(), index);
                    this.decorateElements(newRow);


                    function colorize(row) {
                        var hasColor = (tinycolor(row.css('background-color')).getAlpha() !== 0);

                        if (!hasColor && !row.is('[data-bg="transparent"]')) {
                            var prevSection = row.prev('[data-id][data-label]');

                            if (!prevSection.length) {
                                row.css('background-color', '#ffffff');
                                return;
                            }

                            var isPrevTransparent = (tinycolor(prevSection.css('background-color')).getAlpha() === 0);
                            var isPrevWhite = (tinycolor(prevSection.css('background-color')).toHex().toUpperCase() === "FFFFFF" || tinycolor(prevSection.css('background-color')).toHex().toUpperCase() === "FFF");

                            if (isPrevTransparent || isPrevWhite) {
                                row.css('background-color', '#f6f6f6');
                            } else {
                                row.css('background-color', '#ffffff');
                            }
                        }
                    }

                    colorize(newRow);

                    CP_Customizer.renderNodeShortcodes(newRow);
                    this.jQuery('html, body').animate({
                        'scrollTop': newRow.offset().top
                    });


                    CP_Customizer.updateState();

                },

                editContainerData: function () {
                    var item = $(this),
                        fields = [],
                        elements = item.find('[data-content-code-editable],[data-theme-href],[data-theme],[data-theme-fa]');


                    if (!elements.length) {
                        elements = item.filter('.fa');
                    }

                    item.blur();

                    CP_Customizer.overlays.updateOverlay(CP_Customizer.overlays.hoverOverlay(), item);

                    if (item.is('[data-content-code-editable]') || item.is('[data-bg="image"]')) {
                        elements = elements.add(item);
                    }

                    elements = elements.filter(function (index, elem) {
                        var result = true;
                        elem = $(elem);

                        for (var i = 0; i < CP_Customizer.__containerDataFilters.length; i++) {
                            var filter = CP_Customizer.__containerDataFilters[i];
                            if (false === filter.call(elem, elem)) {
                                result = false;
                                break;
                            }
                        }
                        return result;

                    });

                    elements.each(function (index, elem) {
                        var result = false,
                            setter = false,
                            $elem = $(this);

                        for (var selector in CP_Customizer.__containerDataHandlers) {
                            if ($elem.is(selector)) {
                                result = CP_Customizer.__containerDataHandlers[selector].getter.call($elem, $elem);
                                setter = CP_Customizer.__containerDataHandlers[selector].setter;
                                break;
                            }
                        }

                        result = root.CP_Customizer.hooks.applyFilters('container_data_element', result, $elem);
                        if (result !== false) {
                            if (!_.isArray(result)) {
                                result = [result];
                            }

                            for (var i = 0; i < result.length; i++) {
                                result[i].id = 'item_no_' + index + '_' + i;
                                result[i].setter = setter;
                                result[i].node = $elem;
                            }

                            fields = fields.concat(result);
                        }

                    });

                    var content = '';
                    for (var i = 0; i < fields.length; i++) {
                        var field = fields[i],
                            type = field.type || 'text';

                        var $fieldContent = $(CP_Customizer.jsTPL[type] ? CP_Customizer.jsTPL[type](field) : '');

                        if (field.classes) {
                            $fieldContent.addClass(field.classes);
                        }

                        content += $('<div />').append($fieldContent).html();
                    }

                    var popupContainer = $('#cp-container-editor');


                    function setContent() {
                        for (var i = 0; i < fields.length; i++) {
                            var field = fields[i],
                                value = {},
                                node = field.node
                            if (field.getValue) {
                                value = field.getValue($('[id="' + field.id + '"]'));
                            } else {
                                var _values = $('[id^="' + field.id + '"]').filter('input,textarea,select').map(function (index, elem) {
                                    return {
                                        key: $(this).attr('id').replace(field.id + "__", ''),
                                        value: $(this).is('[type=checkbox]') ? this.checked : $(this).val()
                                    };
                                }).toArray();

                                _(_values).each(function (v) {
                                    value[v.key] = v.value;
                                });

                                if (_values.length === 1 && value.hasOwnProperty(field.id)) {
                                    value = value[field.id];
                                }
                            }

                            if (field.setter) {
                                field.setter.call(node, node, value, field.type, field);
                                root.CP_Customizer.hooks.doAction('container_data_element_setter', node, value, field);
                            }
                        }

                        if (node.is('[data-theme]')) {
                            CP_Customizer.preview.jQuery(node).data('was-changed', true);
                        }


                        if (node.closest('[data-theme]').length) {
                            CP_Customizer.preview.jQuery(node.closest('[data-theme]')).data('was-changed', true);
                        }


                        CP_Customizer.closePopUps();
                        CP_Customizer.updateState();
                    }


                    setContent = CP_Customizer.preview.addSilentExecution(setContent);

                    popupContainer.find('[id="cp-item-ok"]').off().click(setContent);

                    popupContainer.find('[id="cp-item-cancel"]').off().click(function () {
                        CP_Customizer.closePopUps();
                    });

                    popupContainer.find('#cp-items').html(content);

                    CP_Customizer.popUp('Manage Content', "cp-container-editor", {
                        class: "data-edit-popup"
                    });

                },

                __dataContainers: ['[data-container-editable]', '[data-type=group]'],

                addDataContainerSelector: function (selector) {
                    this.__dataContainers.push(selector);
                },

                getContainersSelector: function (addSelectors) {
                    var result = _.clone(this.__dataContainers);

                    if (_.isArray(addSelectors)) {
                        result = result.concat(addSelectors);
                    } else {
                        if (_.isString(addSelectors)) {
                            result.push(addSelectors);
                        }
                    }

                    return result.join(',');
                },


                addContentBinds: function () {
                    var $ = this.jQuery(),
                        document = this.frame().document,
                        window = this.frame();

                    $(document).on('mouseover.hoveroverlay', this.getContainersSelector('[data-widgets-area],[data-bg="image"]'), _.debounce(function () {
                        var node = $(this);
                        var hoverOverlay = root.CP_Customizer.overlays.hoverOverlay();

                        if (node.closest('[data-type=group]').length) {
                            node = $(this).closest('[data-type=group]');
                        }

                        root.CP_Customizer.overlays.assignNode(hoverOverlay, node, true);
                        hoverOverlay.show();

                        var structureAllowsRemoving = (node.parents('[data-type=row]').length || node.parents('[data-type=column]').length) && node.siblings().length;

                        if (structureAllowsRemoving && node.is(root.CP_Customizer.CONTENT_ELEMENTS)) {
                            hoverOverlay.find('.remove').show();
                        } else {
                            hoverOverlay.find('.remove').hide();
                        }
                    }, 1));


                    $(document).on('mouseover.hoveroverlay', '[data-content-editable], .page-content i.fa, body [data-content-item-container="true"]', _.debounce(function () {

                        var node = $(this);

                        if (node.parent().is('[data-content-item-container="true"]')) {
                            return;
                        }

                        var hoverOverlay = root.CP_Customizer.overlays.hoverOverlay();

                        if (node.closest('[data-type=group]').length) {
                            node = $(this).closest('[data-type=group]');
                        }

                        root.CP_Customizer.overlays.assignNode(hoverOverlay, node);
                        hoverOverlay.show();

                        if (CP_Customizer.isShortcodeContent(node)) {
                            hoverOverlay.find('.remove').hide();

                            if (!CP_Customizer.isOnCanvasMod(node)) {
                                hoverOverlay.hide();
                            }
                        } else {
                            if (node.parents('[data-type=row]').length || node.parents('[data-type=column]').length) {
                                hoverOverlay.find('.remove').show();
                            } else {
                                hoverOverlay.find('.remove').hide();
                            }
                        }


                    }, 1));

                    $(document).on('mouseover.hoveroverlay', '.page-content [data-content-shortcode][data-editable=true]', function () {
                        var overlay = root.CP_Customizer.overlays.hoverOverlay();
                        root.CP_Customizer.overlays.assignNode(overlay, $(this));
                        overlay.show();
                    });


                    $(document).on('mouseover', root.CP_Customizer.preview.getPageContainerSelector() + ' > div', function () {
                        root.CP_Customizer.trigger('content.section.hovered', [$(this)]);
                    });


                    $(document).on('mouseover', '[data-type="richtext"]', function () {
                        var hoverOverlay = root.CP_Customizer.overlays.hoverOverlay();
                        root.CP_Customizer.overlays.assignNode(hoverOverlay, $(this), true);

                    });


                    $(document).on('mouseover.addoverlay', '.page-content [data-type="row"] > div, [data-theme] [data-type="row"] > div, .page-content [data-type="column"]', function () {

                        if ($(this).find('[data-type=column]').length) {
                            return;
                        }

                        if ($(this).parent().is('[data-content-shortcode]')) {
                            return;
                        }

                        var addOverlay = root.CP_Customizer.overlays.addOverlay();
                        root.CP_Customizer.overlays.assignNode(addOverlay, $(this));
                        addOverlay.show();
                    });


                    $(document).on('mouseover.rowitemoverlay', '.page-content [data-type="row"] > div, [data-theme] [data-type="row"] > div, .page-content [data-type="row"] > div, [data-theme] [data-type="row"] > div * ', function () {
                            var node = $(this);

                            if (!node.parent().is('[data-type="row"]')) {
                                var parents = node.parentsUntil('[data-type="row"]');
                                node = parents.last();
                            }

                            if (CP_Customizer.isShortcodeContent(node)) {
                                return;
                            }


                            var itemOverlay = root.CP_Customizer.overlays.rowItemHoverOverlay();
                            root.CP_Customizer.overlays.assignNode(itemOverlay, node);
                            itemOverlay.show();
                        }
                    );

                    $(window).on('scroll', root.CP_Customizer.overlays.updateAllOverlays);
                    $(window).on('resize', _(root.CP_Customizer.overlays.updateAllOverlays).debounce(50));

                    $(document).on('click', this.getContainersSelector(), root.CP_Customizer.preview.editContainerData);

                    $(document).on('click', 'body [data-content-editable]', function () {
                        $(this).focus();
                    });

                    $(document).on('click', 'img[data-content-editable], [data-bg="image"]', function () {


                        var self = $(this),
                            type = "image",
                            data = {};

                        if (self.is(CP_Customizer.preview.getContainersSelector())) {
                            return;
                        }

                        if (self.attr('data-size')) {
                            var size = self.attr('data-size').split('x');
                            type = "cropable";
                            data = {
                                width: size[0],
                                height: size[1] ? size[1] : size[0],
                            };
                        }

                        root.CP_Customizer.openMediaBrowser(type, setterCB, data);

                        function setterCB(src) {
                            if (!src) {
                                return;
                            }
                            if (self.is('img')) {
                                self.attr('src', src[0].url);
                            } else {
                                self.css('background-image', 'url(' + src[0].url + ')');
                            }
                            root.CP_Customizer.markSave();
                        }
                    });

                    $(document).on('click', 'i.fa', function () {
                        CP_Customizer.preview.editContainerData.apply(this);
                    });

                    var cachedValue = "";
                    $(document).on('mousedown', '.page-content [data-content-editable]', function (event) {
                        cachedValue = $(this).text();
                    });


                    $(document).on('mouseup', '.page-content [data-content-editable]', function () {
                        if ($(this).text() !== cachedValue) {
                            root.CP_Customizer.markSave();
                            cachedValue = $(this).text();
                        } else {
                            cachedValue = "";
                        }
                    });

                    //Check for IE ('Trident')
                    var contentEditableInputEvent = /Trident/.test(navigator.userAgent) ? 'textinput' : 'input';


                    $(document).on(contentEditableInputEvent, 'body [data-content-editable]', function () {
                        if ($(this).is('[data-theme]')) {
                            $(this).data('was-changed', true);
                            return;
                        }
                        root.CP_Customizer.overlays.updateOverlay(root.CP_Customizer.overlays.hoverOverlay(), $(this), false, true);
                        root.CP_Customizer.markSave();
                    });


                    $(document).on('blur', 'body [data-theme]', function () {
                        if ($(this).data('was-changed')) {
                            root.CP_Customizer.markSave();
                        }
                    });

                    var elementsSpecificSelector = CP_Customizer.TEXT_ELEMENTS.split(',').map(function (item) {
                        var result = CP_Customizer.preview.getPageContainerSelector() + ' ' + item;

                        result += ", [data-theme] " + item;
                        return result;
                    });

                    elementsSpecificSelector.push('[data-theme]');

                    elementsSpecificSelector = elementsSpecificSelector.join(',');

                    var elementsOnFocusLeave = _.debounce(function () {
                        var $this = $(this);
                        root.CP_Customizer.preview.markNode();

                        if ($this.is(root.CP_Customizer.CONTENT_ELEMENTS) && $this.html().trim().length === 0) {
                            $this.attr('data-preview-empty', 1);
                        }
                    }, 10);

                    $(document).on('blur focusout', elementsSpecificSelector, elementsOnFocusLeave);

                    $(document).on('focus', elementsSpecificSelector, function (event) {
                        var $this = $(this);
                        $this.removeAttr('data-preview-empty');

                        if ($this.is('.fa')) {
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    });


                    $(document).on('keypress.cp', '[contenteditable=true]', function (event) {

                        root.CP_Customizer.overlays.updateOverlay(root.CP_Customizer.overlays.hoverOverlay(), $(this), false, true);

                        $(this).removeAttr('data-preview-empty');

                        if (event.which !== 13)
                            return true;

                        var document = CP_Customizer.preview.frame().document;

                        var docFragment = document.createDocumentFragment();
                        //add a new line
                        var newEle = document.createTextNode('\n');
                        docFragment.appendChild(newEle);
                        //add the br, or p, or something else
                        newEle = document.createElement('br');
                        docFragment.appendChild(newEle);

                        var caretPosition = root.CP_Customizer.preview.getSelectionTextInfo(this);
                        // if (caretPosition.atEnd) {

                        // add en empty space node
                        newEle = document.createElement('br');
                        docFragment.appendChild(newEle);

                        //  }

                        //make the br replace selection
                        var range = window.getSelection().getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(docFragment);
                        //create a new range
                        range = document.createRange();
                        range.setStartAfter(newEle);
                        range.collapse(true);
                        //make the cursor there
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);

                        event.preventDefault();

                        root.CP_Customizer.overlays.updateOverlay(root.CP_Customizer.overlays.hoverOverlay(), $(this), false, true);

                        return false;
                    });


                    $(document).on('keypress.cpmarksave', '[contenteditable=true]', _.debounce(function (event) {
                        root.CP_Customizer.preview.markNode($(this));
                        root.CP_Customizer.markSave();
                    }, 100));

                    $(window).bind('keydown', function (event) {
                        if (event.ctrlKey || event.metaKey) {
                            var key = String.fromCharCode(event.which).toLowerCase();
                            if (key === "s") {
                                event.preventDefault();
                                event.stopPropagation();
                                root.CP_Customizer.save();
                            }
                        }
                    });


                },
                // http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
                placeCursorAtEnd: function (contentEditableElement) {
                    try {
                        var range, selection,
                            document = this.frame().document,
                            window = this.frame();
                        if (document.createRange) //Firefox, Chrome, Opera, Safari, IE 9+
                        {
                            range = document.createRange(); //Create a range (a range is a like the selection but invisible)
                            range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
                            range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
                            selection = window.getSelection(); //get the selection object (allows you to change selection)
                            selection.removeAllRanges(); //remove any selections already made
                            selection.addRange(range); //make the range you have just created the visible selection
                        } else if (document.selection) //IE 8 and lower
                        {
                            range = document.body.createTextRange(); //Create a range (a range is a like the selection but invisible)
                            range.moveToElementText(contentEditableElement); //Select the entire contents of the element with the range
                            range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
                            range.select(); //Select the range (make it the visible selection
                        }
                    } catch (e) {

                    }
                }
                ,


                decorateMods: function ($container) {

                    // decorate default mods
                    CP_Customizer.preview.pauseObserver();
                    $container = $container ? this.jQuery($container) : this.find('body');
                    var defaultMods = root.CP_Customizer.preview.getThemeMods($container);
                    var preview = this;
                    defaultMods.each(function () {
                        var $el = $(this);
                        if ($el.is('[data-theme]')) {
                            preview.markNode($el);
                            $el.find('[data-type="row"] > div').each(preview.enableSortable);
                        }
                    });

                    if (root.CP_Customizer.options().mods) {
                        for (var selector in root.CP_Customizer.options().mods) {
                            var $el = this.find(selector);
                            var modData = root.CP_Customizer.options().mods[selector];
                            if (modData.type) {
                                $el.attr(modData.type, modData.mod);

                                if (modData.type === "data-theme") {
                                    preview.markNode($el);
                                    $el.find('[data-type="row"] > div').each(this.enableSortable);
                                }
                            }

                            if (modData.atts) {
                                for (var attr in modData.atts) {
                                    $el.attr('data-theme-' + attr, modData.atts[attr]);
                                }
                            }

                        }
                    }

                    CP_Customizer.preview.restartObserver();
                }
                ,

                decorateElements: function ($container) {


                    CP_Customizer.preview.pauseObserver();

                    var $ = root.CP_Customizer.preview.jQuery(),
                        self = this;

                    var elementsContainers = root.CP_Customizer.hooks.applyFilters('decorable_elements_containers', [root.CP_Customizer.preview.getPageContainerSelector()]);
                    $container = $container ? $($container) : root.CP_Customizer.preview.find(elementsContainers.join(','));
                    if (!root.CP_Customizer.preview.data().maintainable) {
                        return;
                    }

                    $(function () {
                        var $toDecorate = $("");
                        $toDecorate = $toDecorate.add($container);
                        // $toDecorate = $toDecorate.add($('[data-theme]'));
                        CP_Customizer.overlays.addFixedOverlays($toDecorate);
                    });


                    $container.find('a').unbind('click').click(function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        event.stopPropagation();

                        if ($(this).is('[data-container-editable]') || $(this).is('[data-type=group]')) {
                            self.editContainerData.apply(this);
                        }

                        return false;
                    });
                    var elements = $container.find(root.CP_Customizer.CONTENT_ELEMENTS).filter(function () {
                        return root.CP_Customizer.preview.data().maintainable;
                    });

                    if ($container.is(root.CP_Customizer.CONTENT_ELEMENTS)) {
                        if (elements.length) {
                            elements.add($container);
                        } else {
                            elements = $container;
                        }
                    }


                    elements = elements.filter(function (item) {
                        if ($(this).closest('[data-content-shortcode]').length) {
                            return false;
                        }
                        return true;
                    });
                    elements = elements.add(root.CP_Customizer.preview.getThemeMods($container).filter(root.CP_Customizer.CONTENT_ELEMENTS));
                    elements.filter('a').each(function () {
                        var $el = $(this);

                        if ($el.closest(root.CP_Customizer.preview.getPageContainerSelector()).length) {
                            $el.attr('data-container-editable', true);
                        }

                        if ($el.is('[data-theme]')) {
                            $el.attr('data-container-editable', true);
                        }

                    });
                    elements.filter('ul').attr('data-container-editable', true);
                    elements = elements.filter(function (item) {
                        if (this.tagName === "SPAN" && $(this).parents(CP_Customizer.TEXT_ELEMENTS).length) {
                            return false;
                        }

                        if ($(this).parents(root.CP_Customizer.preview.getContainersSelector()).length) {
                            $(this).attr('data-content-code-editable', true);
                            return false;
                        }

                        if ($(this).is(root.CP_Customizer.preview.getContainersSelector())) {
                            $(this).attr('data-content-code-editable', true);
                            return false;
                        }

                        return true;
                    });

                    elements.not('i.fa,a').attr('data-content-editable', true);
                    elements.not('i.fa,hr,a').attr('contenteditable', true);

                    elements.filter('i.fa').each(function () {
                        if ($(this).parent().is(root.CP_Customizer.CONTENT_ELEMENTS)) {
                            return;
                        }

                        $(this).attr('data-content-editable', true);
                        $(this).attr('contenteditable', true);
                    });

                    var contentEditableElements = $container.find('[contenteditable="true"]');

                    if ($container.is('[contentededitable=true]')) {
                        contentEditableElements.add($container);
                    }


                    var handlePasteEvent = function (e) {
                        var $ = CP_Customizer.preview.jQuery();

                        var text = '';
                        var that = $(this);
                        var document = CP_Customizer.preview.frame().document;

                        e.preventDefault();
                        e.stopPropagation();

                        if (e.clipboardData) {
                            text = e.clipboardData.getData('text/plain');
                        } else if (window.clipboardData) {
                            text = window.clipboardData.getData('Text');
                        } else if (e.originalEvent.clipboardData) {
                            text = $('<div></div>').text(e.originalEvent.clipboardData.getData('text'));
                        }

                        text = text.replace(/\r\n/g, '<br/>').replace(/\r/g, '<br/>').replace(/\n/g, '<br/>');

                        if (document.queryCommandSupported('insertText')) {
                            document.execCommand('insertHTML', false, text);
                            return false;
                        }
                        else { // IE > 7
                            that.find('*').each(function () {
                                $(this).addClass('within');
                            });

                            setTimeout(function () {
                                // nochmal alle durchlaufen
                                that.find('*').each(function () {
                                    // wenn das element keine klasse 'within' hat, dann unwrap
                                    // http://api.jquery.com/unwrap/
                                    $(this).not('.within').contents().unwrap();
                                });
                                root.CP_Customizer.preview.markNode(that);
                            }, 1);
                        }
                        root.CP_Customizer.markSave();
                    };

                    contentEditableElements.filter('*').each(function () {
                        this.addEventListener('paste', handlePasteEvent);
                    });

                    $container.find('[data-type="row"] > div, [data-type=column]').each(this.enableSortable);

                    if ($container.is('[data-type="row"] > div, [data-type=column]')) {
                        this.enableSortable.call($container);
                    }

                    if ($container.closest('.ui-sortable').length) {
                        try {
                            $container.closest('.ui-sortable').sortable('refresh');
                            $container.closest('.ui-sortable').sortable('disable');
                        } catch (e) {

                        }
                    }

                    root.CP_Customizer.trigger(root.CP_Customizer.events.ELEMENT_DECORATED, [$container]);
                    CP_Customizer.preview.restartObserver();

                },

                enableSortable: function () {
                    var $ = CP_Customizer.preview.jQuery();
                    var $this = $(this);

                    if ($this.find('[data-type=column]').length) {
                        return;
                    }

                    if ($this.parent().is('[data-content-shortcode]')) {
                        return;
                    }


                    if ($this.children().length === 0) {
                        if ($this.is(root.CP_Customizer.CONTENT_ELEMENTS) && $this.html().trim().length === 0) {
                            $this.attr('data-preview-empty', 1);
                        }
                    }

                    $this.sortable({
                        axis: "y",
                        start: function (event, ui) {
                            ui.helper.css({
                                'position': 'fixed',
                                'left': ui.helper.offset().left + 'px'
                            });
                        },
                        sort: function (event, ui) {
                            ui.helper.css('top', event.clientY);
                        },
                        stop: function (evt, ui) {
                            $this.sortable('disable');
                            $('.node-hover-overlay[is-dragging=true]').removeAttr('is-dragging');
                            $(ui.item).data('reikidragging', false);

                            function refreshOverlay() {
                                root.CP_Customizer.overlays.assignNode(root.CP_Customizer.overlays.hoverOverlay(), $(ui.item));
                                root.CP_Customizer.overlays.updateOverlay(root.CP_Customizer.overlays.hoverOverlay(), $(ui.item));
                            }

                            setTimeout(refreshOverlay, 10);
                            $('[contenteditable]').attr('contenteditable', true);
                            root.CP_Customizer.isSorting = false;
                            root.CP_Customizer.updateState();
                        },
                        deactivate: function (evt, ui) {
                            $('.node-hover-overlay[is-dragging=true]').removeAttr('is-dragging');
                        }

                    });
                    $this.sortable('disable');
                }
                ,

                showTextElementCUI: function (node) {
                    CP_Customizer.preview.pauseObserver();
                    node = $(node)[0];

                    var cui = this.getTextElementCUI();

                    cui.hidden = false;
                    cui.target = node;
                    cui.bodyElement = node;
                    cui.show();
                    cui.fire('focusin');
                    cui.undoManager.clear();
                    cui.theme.panel.getEl().classList.add('cp-tinymce-inline');
                    cui.theme.panel.getEl().style.display = "block";
                }
                ,

                hideTextElementCUI: function () {
                    var cui = this.getTextElementCUI();

                    if (cui.theme && cui.theme.panel) {
                        cui.theme.panel.getEl().style.display = "none";
                    }

                    if (cui.getBody()) {
                        cui.fire('focusout');
                        // cui.hide();
                    }
                }
                ,

                getFonts: function () {

                    var defaultFonts = {
                        "Arial": "arial,helvetica,sans-serif",
                        "Arial Black": "arial black,sans-serif",
                        "Andale Mono": "andale mono,monospace",
                        // "Book Antiqua": "book antiqua,palatino,serif",
                        // "Comic Sans MS": "comic sans ms,sans-serif",
                        // "Courier New": "courier new,courier,monospace",
                        // "Georgia": "georgia,palatino,serif",
                        // "Helvetica": "helvetica,arial,sans-serif",
                        // "Impact": "impact,sans-serif",
                        // "Symbol": "symbol",
                        "Tahoma": "tahoma,arial,helvetica,sans-serif",
                        "Terminal": "terminal,monaco,monospace",
                        "Times New Roman": "times new roman,times,serif",
                        // "Trebuchet MS": "trebuchet ms,geneva,sans-serif",
                        "Verdana": "verdana,geneva,sans-serif"
                        // "Webdings": "webdings",
                        // "Wingdings": "wingdings,zapf dingbats"
                    };

                    var googleFonts = {};

                    if (root.CP_Customizer.pluginOptions.data.fonts) {
                        for (var font in root.CP_Customizer.pluginOptions.data.fonts) {
                            googleFonts[font] = font + ",arial,helvetica,sans-serif";
                        }
                    }

                    googleFonts = root.CP_Customizer.hooks.applyFilters('tinymce_google_fonts', googleFonts);

                    var fonts = _.extend(googleFonts, defaultFonts);

                    fonts.toTinyMCEFormat = function () {
                        var result = [];
                        for (var font in this) {
                            if (_.isString(this[font])) {
                                result.push(font + "=" + this[font]);
                            }
                        }

                        return result.join(';');
                    };

                    return fonts;
                }
                ,

                getTextElementCUI: function () {
                    var editorID = 'cp-tinymce-cui-editor';
                    var editor = root.CP_Customizer.preview.frame().tinymce.get(editorID);

                    var self = this;
                    if (!editor) {
                        this.jQuery('body').after('<div id="' + editorID + '"></div>');
                        var options = {
                            "selector": "#" + editorID,
                            inline: true,
                            style_formats_merge: true,
                            extended_valid_elements: 'span',
                            "formats": {
                                fontweight: {inline: 'span', styles: {fontWeight: '%value'}},
                                fontsize: {inline: 'span', styles: {fontSize: '%value'}},
                                fontcolor: {inline: 'span', styles: {color: '%value'}},
                                italic: {inline: 'span', styles: {fontStyle: 'italic'}},
                            },
                            "menubar": false,
                            "theme": "modern",
                            "skin": "lightgray",
                            "toolbar": 'fontselect addwebfont font-weight font-size-popup italic underline strikethrough font-color-popup | removeformat',
                            "font_formats": this.getFonts().toTinyMCEFormat(),
                            "paste_as_text": true,
                            "forced_root_block": false,
                            setup: function (ed) {
                                var bm;

                                ed.addButton('font-weight', {
                                    type: 'listbox',
                                    text: 'Font Weight',
                                    icon: false,
                                    onselect: function (e) {

                                        ed.formatter.apply('fontweight', {value: this.value()});
                                    },
                                    values: [
                                        {text: '100', value: '100'},
                                        {text: '200', value: '200'},
                                        {text: '300', value: '300'},
                                        {text: '400', value: '400'},
                                        {text: '500', value: '500'},
                                        {text: '600', value: '600'},
                                        {text: '700', value: '700'},
                                        {text: '800', value: '800'},
                                        {text: '900', value: '900'},
                                    ],
                                    onPostRender: function () {
                                        var btn = this;
                                        ed.on('NodeChange', function (e) {
                                            var weight = jQuery(ed.selection.getNode()).css('font-weight');
                                            if (weight == "bold") weight = "700";
                                            if (weight == "normal") weight = "400";
                                            btn.value(weight);
                                        });

                                        btn.on('show', function (e) {
                                            ed.theme.panel.getEl().style.display = "block";
                                            e.control.$el.css({top: this.$el.offset().top + 34, left: this.$el.offset().left})
                                        });
                                    }
                                });
                                ed.addButton('addwebfont', {
                                    type: 'button',
                                    icon: 'insert',
                                    tooltip: "Add web font",
                                    onPostRender: function () {
                                        this.on("click", function () {
                                            top.wp.customize.control('one_page_express_web_fonts').focus()
                                        });
                                    }
                                });
                                ed.addButton('font-color-popup', {
                                    type: "colorbutton",
                                    icon: false,


                                    onPostRender: function () {
                                        var btn = this;

                                        self.jQuery(this.getEl()).spectrum({
                                            showAlpha: true,
                                            preferredFormat: "rgb",
                                            showInput: true,
                                            show: function () {
                                                //console.log(this);
                                                var color = jQuery(ed.selection.getNode()).css('color');
                                                self.jQuery(btn.getEl()).spectrum("set", color);
                                                var container = self.jQuery(btn.getEl()).spectrum("container");


                                                var offTop = container.offset().top
                                                var scrollTop = self.frame().scrollY;

                                                container.css({
                                                    top: self.jQuery(btn.getEl()).offset().top - scrollTop + 30,
                                                    "left": "auto",
                                                    "right": CP_Customizer.preview.frame().innerWidth - jQuery(btn.getEl()).offset().left - 40
                                                });

                                                self.jQuery(self.jQuery('body')[0].ownerDocument).scroll(function () {
                                                    var offTop = container.offset().top
                                                    var scrollTop = self.jQuery('body').scrollTop()

                                                    container.offset({
                                                        top: self.jQuery(btn.getEl()).offset().top - scrollTop + 30
                                                    });
                                                });

                                            },
                                            change: function (color) {
                                                var col = color.toRgbString();
                                                btn.value(col);

                                                ed.selection.moveToBookmark(bm);
                                                ed.formatter.apply('fontcolor', {value: col});
                                            }
                                        });

                                        btn.on("click", function () {
                                            bm = ed.selection.getBookmark();
                                        });

                                        ed.on('NodeChange', function (e) {
                                            var color = jQuery(ed.selection.getNode()).css('color');
                                            btn.color(color);
                                            self.jQuery(btn.getEl()).spectrum("set", color);
                                        });

                                        function onEditorBlur(e) {
                                            self.jQuery(btn.getEl()).spectrum('hide');
                                            CP_Customizer.preview.restartObserver();
                                        }

                                        ed.on('blur', onEditorBlur);


                                    }
                                });
                                ed.on('focus', function (e) {
                                    _.delay(function () {
                                        var editorEL = e.target.theme.panel.getEl(),
                                            node = e.target.bodyElement,
                                            margin = ($(node).width() - $(editorEL).width()) / 2;

                                        $(editorEL).css({
                                            'margin-left': margin
                                        });
                                    }, 0);
                                });

                                updateOnEditorBlur = _.debounce(function (e) {
                                    _.delay(function () {
                                        var $node = $(e.target.bodyElement);
                                        CP_Customizer.preview.markNode($node);

                                        if ($node.is('[data-theme]')) {
                                            CP_Customizer.preview.jQuery($node).data('was-changed', true);
                                        }
                                        CP_Customizer.updateState();
                                    }, 0);
                                }, 100);

                                ed.on('blur', updateOnEditorBlur);

                            }
                        };
                        root.CP_Customizer.preview.frame().tinymce.init(options);
                        editor = root.CP_Customizer.preview.frame().tinymce.get(editorID);

                    }

                    return editor;
                }
                ,

                blur: function () {
                    var hoverOverlay = CP_Customizer.overlays.hoverOverlay();
                    var hoveredNode = CP_Customizer.preview.jQuery(hoverOverlay.data().node);

                    var fakeNode = CP_Customizer.preview.jQuery("<p contenteditable='true' style='display: none;' />");

                    CP_Customizer.overlays.assignNode(hoverOverlay, fakeNode);
                    CP_Customizer.preview.getTextElementCUI().fire('blur');

                }
            },

            overlays: {


                addFixedOverlays: function ($startNode) {
                    var $ = root.CP_Customizer.preview.jQuery();

                    if ($startNode.length > 1) {

                        var self = this;
                        $startNode.each(function () {
                            self.addFixedOverlays($(this));
                        });
                        return;

                    }
                    $startNode = $startNode || $('body');

                    if ($startNode.closest('[data-type="row"]').length || $startNode.closest('[data-type="column"]').length) {
                        return;
                    }

                    root.CP_Customizer.trigger(root.CP_Customizer.events.ADD_FIXED_OVERLAYS, [$startNode]);

                }
                ,


                __fixedOverlayOptions: {}
                ,
                registerFixedOverlayOptions: function (name, options) {

                    if (_.isObject(name)) {
                        _.each(name, function (options, key) {
                            CP_Customizer.overlays.registerFixedOverlayOptions(key, options);
                        });
                    } else {

                        if (!this.__fixedOverlayOptions.hasOwnProperty(name)) {
                            this.__fixedOverlayOptions[name] = options;
                        } else {
                            // console.error("Overlay options name '" + name + "' already exists");
                        }
                    }

                }
                ,

                getOverlayOptionButton: getButtonElement,

                addOptionsToFixedOverlay:
                    function ($container, type, node, callback) {
                        var typeOptions = this.__fixedOverlayOptions[type],
                            $toAppend;

                        if (!typeOptions) {
                            console.error('Undefined typeoptions', type, node);
                            return;
                        }

                        var jQuery = CP_Customizer.preview.jQuery();
                        var _node = (typeOptions.nodeOverrider || _.identity)(node);
                        for (var key in typeOptions) {
                            var filteredOptions = CP_Customizer.hooks.applyFilters('section_fixed_overlay', typeOptions[key], key);
                            if (typeOptions.hasOwnProperty(key)) {
                                switch (key) {
                                    case 'title':
                                        $toAppend = getTitleElement(filteredOptions, _node, type);
                                        if ($toAppend) {
                                            $container.append($toAppend);
                                        }
                                        break;
                                    case 'items':
                                        $toAppend = getItemsElements(filteredOptions, _node, type);
                                        $container.append($toAppend);
                                        break;
                                    case 'node_binds':
                                        var nodeBinds = filteredOptions;
                                        jQuery.each(nodeBinds, function (bind, callbacks) {
                                            if (bind === "hover") {
                                                _node.hover(
                                                    function (event) {
                                                        callbacks[0].bind(this)(event, jQuery(this).data().overlay);
                                                    },
                                                    function (event) {
                                                        var isNodeRelated = jQuery(this).data().overlay.find("*").andSelf().is(event.relatedTarget);
                                                        if (isNodeRelated) {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            return false;
                                                        }

                                                        callbacks[1].bind(this)(event, jQuery(this).data().overlay);
                                                    }
                                                );
                                            } else {
                                                _node.bind(bind, callbacks);
                                            }
                                        });
                                        break;
                                    case 'toolbar_binds':
                                        var toolbarBinds = typeOptions[key];
                                        var overlay = jQuery(node).data().overlay;
                                        jQuery.each(toolbarBinds, function (bind, callbacks) {
                                            if (bind === "hover") {
                                                overlay.find('.overlay-toolbar').hover(
                                                    function (event) {
                                                        callbacks[0].bind(node)(event, overlay);
                                                    },
                                                    function (event) {
                                                        callbacks[1].bind(node)(event, overlay);
                                                    }
                                                );
                                            } else {
                                                overlay.bind(bind, callbacks);
                                            }
                                        });
                                        break;
                                }
                            }
                        }

                        if (callback) {
                            callback(typeOptions);
                        }
                    }

                ,

                updateOverlay: function (overlay, node, cover, positionOnly) {
                    var $ = root.CP_Customizer.preview.jQuery();
                    node = $(node);
                    updateControls = !positionOnly;

                    if (!node || !node.length) {
                        return;
                    }


                    if (updateControls) {
                        overlay.find('.pen-overlay').css({
                            width: node.outerWidth(),
                            height: node.outerHeight(),
                            'pointer-events': 'all',
                            'display': 'block'
                        });

                        overlay.find('.add-element-bubble.visible').removeClass('visible');
                        overlay.find('.add-element-bubble .expanded').removeClass('expanded');

                        if (node.outerHeight() < 30) {
                            overlay.find('.pen-overlay').addClass('small');
                        } else {
                            overlay.find('.pen-overlay').removeClass('small');
                        }


                        if (node.parent().is('.ui-sortable') && node.siblings(root.CP_Customizer.CONTENT_ELEMENTS).length && node.closest(".page-content,[data-theme]").length) {
                            overlay.find('.move').show();
                        } else {
                            overlay.find('.move').hide();
                        }


                        if (!node.is(':visible')) {
                            overlay.hide();
                        } else {
                            overlay.show();
                        }

                        overlay.find('.add').show();
                        if (node.closest('[data-add-content]').length) {
                            value = node.closest('[data-add-content]').attr('data-add-content');

                            if (value === "false") {
                                overlay.find('.add').hide();
                            }
                        }


                        if (node.closest('[data-type="row"]').length && node.closest('[data-type="row"]').is('[data-custom-items]')) {
                            overlay.find('.top-container').hide();
                            overlay.find('[h-align-center]').hide();
                        } else {
                            overlay.find('.top-container').show();
                            overlay.find('[h-align-center]').show();
                        }


                        if (overlay.is('.add-content-overlay')) {
                            if (node.is('[data-type="column"]') && node.closest('[data-type=row]').length === 0) {
                                overlay.find('.remove').hide();
                            } else {
                                if (node.closest('[data-type=row]').children().length > 1) {
                                    overlay.find('.remove').show();
                                } else {
                                    overlay.find('.remove').hide();
                                }
                            }
                        }

                        if (overlay.is('.node-hover-overlay')) {
                            if (node.siblings().length === 0) {
                                overlay.find('.remove').hide();
                            } else {
                                if (node.is(root.CP_Customizer.CONTENT_ELEMENTS)) {
                                    overlay.find('.remove').show();
                                } else {
                                    overlay.find('.remove').hide();
                                }
                            }
                        }


                    }

                    var bounds = node[0].getBoundingClientRect();
                    var scrollTop = root.CP_Customizer.preview.frame().pageYOffset;
                    var scrollLeft = root.CP_Customizer.preview.frame().pageXOffset;
                    overlay.css({
                        left: (parseInt(bounds.left) + scrollLeft) + "px",
                        top: (parseInt(bounds.top) + scrollTop) + "px"
                    });

                    overlay.css({
                        width: node.outerWidth(),
                        'position': 'absolute'
                    });

                    if (!cover) {
                        overlay.css({
                            height: 'auto',
                            'background-color': ''
                        });
                    }

                    overlay.children('.overlay-left, .overlay-right').css({
                        height: node.outerHeight(),
                        width: '0px'
                    });
                    overlay.children('.overlay-right').css({
                        left: node.outerWidth()
                    });
                    overlay.children('.overlay-top, .overlay-bottom').css({
                        height: '0px',
                        width: node.outerWidth()
                    });
                    overlay.children('.overlay-bottom').css({
                        top: node.outerHeight()
                    });

                    overlay.children('[align-bottom]').each(function () {
                        $(this).css({
                            top: node.outerHeight() - 5
                        });
                    });

                    overlay.children('[align-top]').css({
                        top: 0
                    });

                    overlay.children('[h-align-center]').each(function () {
                        $(this).css({
                            left: (node.outerWidth() - $(this).outerWidth()) / 2
                        });
                    });

                }
                ,


                updateAllOverlays: function (event) {
                    var updateOnlySections = Array.from(arguments).length === 0;
                    var update = function () {
                        var $ = CP_Customizer.preview.jQuery();
                        this.overlaysContainer.children().each(function () {
                            var isSection = $(this).is('.section-overlay');

                            if (updateOnlySections && !isSection) {
                                return;
                            }

                            var node = $(this).data('node');
                            if (node) {
                                root.CP_Customizer.overlays.updateOverlay($(this), $(node), false, true);

                                var isScrollEvent = event && event.type == 'scroll';

                                if ($(this).is('.heatzone') && !isScrollEvent) {
                                    $(this).removeClass('heatzone');
                                }
                            }
                        });
                    }.bind({
                        overlaysContainer: root.CP_Customizer.overlays.overlaysContainer()
                    });

                    update();
                    return true;
                }
                ,

                overlaysContainer: function () {
                    var overlaysContainer = CP_Customizer.preview.find('#cp-overlays');

                    if (!overlaysContainer.length) {
                        overlaysContainer = CP_Customizer.preview.jQuery()('<div id="cp-overlays"></div>');
                        CP_Customizer.preview.find('html').append(overlaysContainer);
                    }

                    return overlaysContainer;
                }
                ,

                hoverOverlay: function () {
                    var $ = root.CP_Customizer.preview.jQuery();
                    var hoverOverlay = $('[data-overlay="cp-hoveroverlay"]');

                    if (hoverOverlay.length) {
                        return hoverOverlay;
                    }

                    hoverOverlay = $('<div data-overlay="cp-hoveroverlay" class="node-hover-overlay"><div class="pen-overlay"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 20 20"><path d="M13.89 3.39l2.71 2.72c.46.46.42 1.24.03 1.64l-8.01 8.02-5.56 1.16 1.16-5.58s7.6-7.63 7.99-8.03c.39-.39 1.22-.39 1.68.07zm-2.73 2.79l-5.59 5.61 1.11 1.11 5.54-5.65zm-2.97 8.23l5.58-5.6-1.07-1.08-5.59 5.6z"></path></svg></div><span title="Move element" class="move"></span><span title="Delete element" class=" remove"></span><div class="overlay-top overlay-border"></div><div class="overlay-left overlay-border"></div><div class="overlay-right overlay-border"></div><div class="overlay-bottom overlay-border"></div></div>');

                    root.CP_Customizer.overlays.overlaysContainer().append(hoverOverlay);
                    hoverOverlay.hide();

                    hoverOverlay.find('.remove').click(function () {
                        root.CP_Customizer.preview.removeNode($(hoverOverlay.data('node')));
                        hoverOverlay.hide();
                    });

                    hoverOverlay.find('.pen-overlay').unbind('click').click(function (event) {
                        var $node = $(hoverOverlay.data('node'));

                        if ($node.is('[data-widgets-area]')) {
                            root.wp.customize.section('sidebar-widgets-' + $node.attr('data-widgets-area')).focus();
                            return;
                        }

                        if ($node.is('hr')) {
                            return;
                        }

                        if ($node.is('[data-content-shortcode]')) {
                            var shortcodeData = CP_Customizer.parseShortcode($node.attr('data-content-shortcode'));
                            CP_Customizer.hooks.doAction('shortcode_edit', $node, shortcodeData);
                            CP_Customizer.hooks.doAction('shortcode_edit_' + shortcodeData.tag, $node, shortcodeData);
                            return;
                        }

                        if (!$node.data('container-editable')) {
                            $node.off();
                            $(this).hide();
                        }

                        if ($node.is('[data-content-item-container="true"]')) {
                            $node = $node.children().eq(0);
                        }

                        $node.click();

                        if ($node.is(root.CP_Customizer.TEXT_ELEMENTS)) {
                            $node.focus();

                            _.delay(function () {
                                root.CP_Customizer.preview.placeCursorAtEnd($node[0]);
                            }, 5);

                            CP_Customizer.hooks.doAction('text_element_clicked', $node);

                            hoverOverlay.activateHeatZone();
                        } else {
                            CP_Customizer.hooks.doAction('element_clicked', $node);
                        }

                    });

                    function findCenter($, el) {
                        el = $(el);
                        var o = el.offset();
                        return {
                            x: o.left + el.outerWidth() / 2,
                            y: o.top + el.outerHeight() / 2
                        };
                    }

                    function triggerDrag(el, ev) {
                        var target = el,
                            $ = root.CP_Customizer.preview.jQuery(),
                            frame = root.CP_Customizer.preview.frame();

                        var self = this,
                            center = findCenter($, target),
                            options = {},
                            x = Math.floor(center.x),
                            y = Math.floor(center.y),
                            dx = options.dx || 0,
                            dy = options.dy || 0;
                        var coord = {
                            clientX: x,
                            clientY: y
                        };

                        var type = "mousedown";

                        var e = $.extend({
                            bubbles: true,
                            cancelable: (type != "mousemove"),
                            view: frame,
                            detail: 0,
                            screenX: 0,
                            screenY: 0,
                            clientX: 0,
                            clientY: 0,
                            ctrlKey: false,
                            altKey: false,
                            shiftKey: false,
                            metaKey: false,
                            button: 0,
                            relatedTarget: el
                        }, coord);

                        // var relatedTarget = $(el).parent().data('node');

                        var evt = document.createEvent("MouseEvents");
                        evt.initMouseEvent(type, e.bubbles, e.cancelable, e.view, e.detail,
                            e.screenX, e.screenY, ev.clientX, ev.clientY,
                            e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                            e.button, null);

                        el.dispatchEvent(evt);
                    }


                    var moveHandlerCallback = function ($handle, event) {

                        if (event.which !== 1) {
                            return;
                        }

                        var overlay = $handle.closest('.node-hover-overlay');

                        var $node = $(hoverOverlay.data('node'));

                        if ($node.siblings().length === 0) {
                            return;
                        }

                        $node.blur();

                        if ($node.data('reikidragging')) {
                            overlay.attr('is-dragging', false);
                            $node.data('reikidragging', false);
                            return;
                        }

                        var $first = $node.parents('.ui-sortable').first();
                        if ($first.data("ui-sortable")) {
                            $first.sortable('enable');
                        }

                        $node.data('reikidragging', true);
                        overlay.attr('is-dragging', true);

                        $('[contenteditable="true"]').attr('contenteditable', false);
                        $('[contenteditable="true"]').blur();
                        triggerDrag($node[0], event);
                        root.CP_Customizer.isSorting = true;

                        root.CP_Customizer.preview.hideTextElementCUI();
                    };


                    hoverOverlay.find('.move').off('mousedown.cp').on('mousedown.cp', function (event) {
                        _(moveHandlerCallback).delay(50, $(this), event);
                    });


                    hoverOverlay.find('.move').off('mouseup.cp').on('mouseup.cp', function (event) {
                        var overlay = $(this).closest('.node-hover-overlay');
                        overlay.attr('is-dragging', false);
                    });

                    hoverOverlay.activateHeatZone = function () {
                        var $this = $(this);
                        $this.addClass('heatzone');

                        var top = $this.find('.overlay-top'),
                            left = $this.find('.overlay-left'),
                            right = $this.find('.overlay-right'),
                            bottom = $this.find('.overlay-bottom');

                        if (top.find('.zone').length === 0) {
                            top.append('<div class="zone" />');
                        }

                        if (left.find('.zone').length === 0) {
                            left.append('<div class="zone" />');
                        }

                        if (right.find('.zone').length === 0) {
                            right.append('<div class="zone" />');
                        }

                        if (bottom.find('.zone').length === 0) {
                            bottom.append('<div class="zone" />');
                        }

                        var node = $this.data('node');
                        var $node = CP_Customizer.preview.jQuery(node);

                        var nodeRect = {
                            top: $node.offset().top,
                            bottom: $node.offset().top + node.offsetHeight,
                            height: node.offsetHeight,
                            left: node.offsetLeft,
                            right: node.offsetLeft + node.offsetWidth,
                            width: node.offsetWidth
                        }

                        var docHeight = $(node).closest('body').height();
                        var docWidth = $(node).closest('body').width();


                        top.find('.zone').css({
                                height: nodeRect.top,
                                width: docWidth,
                                left: -1 * nodeRect.left
                            }
                        );

                        bottom.find('.zone').css({
                                height: docHeight - nodeRect.bottom,
                                width: docWidth,
                                left: -1 * nodeRect.left
                            }
                        );

                        left.find('.zone').css({
                                height: nodeRect.height,
                                width: nodeRect.left
                                //top: -1 * nodeRect.top - nodeRect.height / 2
                            }
                        );

                        right.find('.zone').css({
                                height: nodeRect.height,
                                width: docWidth - nodeRect.right
                                // top: -1 * nodeRect.top - nodeRect.height / 2
                            }
                        );

                        hoverOverlay.off('click.zone').on('click.zone', '.zone', function (event) {
                            hoverOverlay.removeClass('heatzone');

                            event.preventDefault();
                            event.stopPropagation();

                            var x = event.clientX,
                                y = event.clientY,
                                elementMouseIsOver = CP_Customizer.preview.frame().document.elementFromPoint(x, y);

                            //
                            hoverOverlay.addClass('heatzone');
                            CP_Customizer.preview.blur();
                            _.delay(function () {
                                hoverOverlay.removeClass('heatzone');
                                CP_Customizer.preview.jQuery(elementMouseIsOver).trigger('mouseover');
                            }, 10);
                            return false;
                        });
                    };

                    return hoverOverlay;

                }
                ,

                rowItemHoverOverlay: function () {
                    var $ = root.CP_Customizer.preview.jQuery();
                    var itemHoverOverlay = $('[data-overlay="cp-item-hover-overlay"]');

                    if (itemHoverOverlay.length) {
                        return itemHoverOverlay;
                    }

                    itemHoverOverlay = $('<div data-overlay="cp-item-hover-overlay" class="item-hover-overlay"> <div h-align-right title="Delete item" class="remove"></div> </div>');

                    root.CP_Customizer.overlays.overlaysContainer().append(itemHoverOverlay);

                    itemHoverOverlay.hide();

                    itemHoverOverlay.find('.remove').click(function () {
                        var node = $(itemHoverOverlay.data('node'));
                        root.CP_Customizer.preview.removeNode(node);
                        root.CP_Customizer.hooks.doAction('section_list_item_refresh');
                        itemHoverOverlay.hide();
                    });

                    return itemHoverOverlay;
                }
                ,


                addOverlay: function () {

                    var $ = root.CP_Customizer.preview.jQuery();
                    var addOverlay = $('[data-overlay="cp-addoverlay"]');

                    if (addOverlay.length) {
                        return addOverlay;
                    }

                    addOverlay = $('<div data-overlay="cp-addoverlay" class="add-content-overlay"><div class="buttons" align-bottom h-align-center><div class="add" title="Add element">Add element</div></div></div>');
                    root.CP_Customizer.overlays.overlaysContainer().append(addOverlay);
                    addOverlay.hide();

                    addOverlay.find('.add').prepend('<div class="add-element-bubble"><div class="elements-container"></div></div>');

                    addOverlay.find('.add').click(function (event) {
                        addOverlay.find('.add').find('.add-element-bubble').toggleClass('visible');
                    });

                    root.CP_Customizer.content.addContentItemsTo(addOverlay.find('.elements-container'));

                    addOverlay.find('.elements-container').on('cp-insert-content-item', function (event, type, insertHandler) {
                        event.preventDefault();
                        var $node = $(addOverlay.data('node'));
                        var index = $node.children().length;

                        insertHandler(type, $node, index, after);

                        function after($node) {
                            root.CP_Customizer.preview.decorateElements($node);
                            root.CP_Customizer.overlays.updateOverlay(addOverlay, $(addOverlay.data('node')));
                            CP_Customizer.renderNodeShortcodes($node);
                        }
                    });

                    return addOverlay;
                }
                ,

                assignNode: function (overlay, node, cover) {
                    var $ = root.CP_Customizer.preview.jQuery();
                    if (overlay.attr('is-dragging') && overlay.attr('is-dragging') === "true") {
                        return;
                    }
                    if ($(overlay.data('node')).is(node)) {
                        return;
                    } else {
                        $(overlay.data('node')).blur();
                    }

                    overlay.data('node', $(node)[0]);

                    function updateOverlay() {
                        root.CP_Customizer.overlays.updateOverlay(overlay, $(node), cover);
                    }

                    overlay.on('reiki.update_overlays', '*', function (event) {
                        setTimeout(updateOverlay, 0);
                    });

                    root.CP_Customizer.preview.hideTextElementCUI();
                    updateOverlay();
                }

            }
            ,

            content: {
                __registeredItems: {
                    'link':
                        {
                            icon: 'fa-link',
                            data:
                                '<a data-cpid="new" data-container-editable="true" data-content-code-editable href="#">new link</a>'
                        }
                    ,
                    'button':
                        {
                            icon: 'fa-external-link-square',
                            data:
                                '<a data-cpid="new" data-container-editable="true" data-content-code-editable class="button blue" href="#">new button</a>'
                        }
                    ,
                    'heading':
                        {
                            icon: 'fa-header',
                            items:
                                function () {
                                    var result = {};
                                    for (var i = 1; i <= 6; i++) {
                                        result['h' + i] = {
                                            label: "H" + i,
                                            data: '<h' + i + '>Heading ' + i + '</h' + i + '>',
                                            toolip: "Heading " + i
                                        };
                                    }

                                    return result;
                                }
                        }
                    ,

                    'paragraph':
                        {
                            icon: 'fa-align-left',
                            data:
                                '<p data-cpid="new" data-content-editable="true" contenteditable="true">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
                        }
                    ,

                    'image':
                        {
                            icon: 'fa-picture-o',
                            data:
                                '<img data-cpid="new" class="custom-image" data-content-code-editable="true" data-content-editable="true" contenteditable="true" src="#"/>'
                        }
                    ,

                    'icon':
                        {
                            icon: 'fa-flag',
                            items:
                                function () {
                                    var result = {};
                                    for (var i = 1; i <= 6; i++) {
                                        result['fa' + i] = {
                                            icon: 'fa-flag fa' + i,
                                            data: '<i class="fa cp-icon fa' + i + ' fa-flag"></i>',
                                            toolip: "Font Icon " + i
                                        };
                                    }

                                    return result;
                                }
                        },
                    'separator':
                        {
                            'icon':
                                "fa-minus",
                            data:
                                '<div class="spacer" data-type="group"><span class="fa before"></span><i data-content-code-editable="true" class="fa fa-bandcamp"></i><span class="fa after"></span></div>'
                        }
                },

                registerItem: function (data) {

                    if (data) {
                        for (var key in data) {
                            if (data[key].contentElementSelector) {
                                CP_Customizer.addContentElementsSelectors(data[key].contentElementSelector);
                            }
                        }
                    }

                    _.extend(this.__registeredItems, data);
                },

                getItemData: function (type) {
                    types = type.split('.');
                    var start = this.__registeredItems;

                    for (var i = 0; i < types.length; i++) {
                        var _type = types[i];

                        if (i + 1 < types.length) {
                            var _items = start[_type].items;
                            if (_(_items).isFunction()) {
                                _items = _items.call();

                            }
                            start = _items;
                        } else {
                            return start[_type].data;
                        }
                    }
                },

                getItemAfter: function (type) {
                    types = type.split('.');
                    var start = this.__registeredItems;

                    for (var i = 0; i < types.length; i++) {
                        var _type = types[i];

                        if (i + 1 < types.length) {
                            var _items = start[_type].items;
                            if (_(_items).isFunction()) {
                                _items = _items.call();

                            }
                            start = _items;
                        } else {
                            return start[_type].after;
                        }
                    }
                },

                getContentItems: function (data, subitems, parentId) {
                    data = data || this.__registeredItems;
                    subitems = subitems || false;
                    var self = this;
                    var $result = $("<div />");
                    $.each(data, function (id, option) {
                        var title = option.toolip || option.tooltip || id;
                        var idAttr = parentId ? parentId + "." + id : id;
                        var _item = $('<i class="fa ' + (option.icon || "") + '" title="' + title + '" data-' + (option.items ? "parent" : "content") + '-id="' + idAttr + '"></i>');

                        if (option.label) {
                            _item.append('<span class="item-label">' + option.label + '</span>');
                        }

                        if (option.items) {

                            var _items = option.items;

                            if (_(_items).isFunction()) {
                                _items = option.items.call();
                            }

                            var subitemsContainer = $('<div class="subitems-container" />');
                            subitemsContainer.append(self.getContentItems(_items, true, idAttr));
                            _item.append(subitemsContainer);
                        }

                        $result.append(_item);
                    });

                    return $result.html();

                },


                addContentItemsTo: function ($container) {
                    $container.append(CP_Customizer.content.getContentItems());
                    var self = this;
                    $container.off('click.cp-new-content').on('click.cp-new-content', 'i.fa[data-content-id]', function (event) {
                        event.preventDefault();
                        event.stopPropagation();

                        var node_type = $(this).data('content-id');
                        $container.trigger('cp-insert-content-item', [node_type, self.insertNewContent]);
                    });

                    $container.off('click.cp-new-parent').on('click.cp-new-parent', 'i.fa[data-parent-id]', function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        $(this).toggleClass('expanded');
                        $(this).siblings().removeClass('expanded');
                    });
                }
                ,

                insertNewContent: function (type, $container, index, after) {
                    var $ = CP_Customizer.preview.jQuery();
                    var $new = $(CP_Customizer.content.getItemData(type));
                    var itemAfter = CP_Customizer.content.getItemAfter(type);
                    CP_Customizer.preview.insertNode($new, $container, index);
                    setTimeout(function () {
                        $new.trigger('click');
                        if (_(after).isFunction()) {
                            after($new);


                        }
                        if (_.isFunction(itemAfter)) {
                            itemAfter($new);
                        }
                    }, 100);
                }
            }

        }
    ;

    top.CP_Customizer = root.CP_Customizer = CP_Customizer;


    var previewLoadedMessageCallback = function (event) {
        if (event.data === 'cloudpress_update_customizer') {

            if (root.__isCPChangesetPreview) {
                CP_Customizer.preview.jQuery('html').addClass('cp__changeset__preview');
                return;
            }

            _(CP_Customizer).extend(window.cpCustomizerGlobal);
            CP_Customizer.trigger('PREVIEW_LOADED');

            CP_Customizer.preview.addContentBinds();

            CP_Customizer.preview.jQuery('a').on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
            });

            CP_Customizer.preview.decorateMods();
            CP_Customizer.preview.decorateElements();

            CP_Customizer.preview.frame().wp.customize.preview.bind('loading-initiated', function () {
                CP_Customizer.showLoader();
                CP_Customizer.trigger('PREVIEW_LOADING_START');
            });

            CP_Customizer.hideLoader();


        }
    };

    root.addEventListener('message', previewLoadedMessageCallback);


    $(root).bind('keydown', function (event) {
        if (event.ctrlKey || event.metaKey) {
            var key = String.fromCharCode(event.which).toLowerCase();
            if (key === "s") {
                event.preventDefault();
                event.stopPropagation();
                root.CP_Customizer.save();
            }
        }
    });

    $(root.document).find('input#save').unbind('click').bind('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        root.CP_Customizer.save();
    });


    // UTILS

    function getTitleElement(name, node, category) {
        var label = "";
        if (typeof name === "function") {
            label = name(node);
        } else {
            if (!_.isUndefined(name)) {
                label = name;
            } else {
                return "";
            }
        }

        return "<span data-category=\"" + category + "\" class=\"cog-item title\">" + label + "</span>";
    }

    function getButtonElement(itemData, node, category) {
        var template = '<span data-category="' + category + '" class="cog-item ' + (itemData.classes || "") + '"></span>';

        var $button = $(template).attr({
            'data-name': (itemData.name || 'button')
        });
        $button.text(itemData.title || 'Button');


        // key is event handler
        $.each(itemData, function (key, data) {
            if (key === 'on_hover') {
                var callbackIn = function () {
                    data[0].call($button, node);
                };
                var callbackOut = function () {

                    data[1].call($button, node);
                };
                $button.hover(callbackIn, callbackOut);

            } else if (key.indexOf('on_') === 0) {
                var ev = key.replace('on_', '');
                var callback = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    data.call($button, node);
                };
                $button.bind(ev, callback);
            }
        });

        return $button;
    }

    function getItemsElements(itemsArray, node, category) {
        result = [];
        for (var i = 0; i < itemsArray.length; i++) {
            var itemData = itemsArray[i];
            var $item = getButtonElement(itemData, node, category);
            result.push($item);
        }
        return result;
    }

})(jQuery, window);
