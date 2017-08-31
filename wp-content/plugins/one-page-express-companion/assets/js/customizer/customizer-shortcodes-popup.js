(function (root, CP_Customizer, $) {

    CP_Customizer.__shortcodesPopupControls = {};

    CP_Customizer.registerShortcodePopupControls = function (tag, controls) {
        CP_Customizer.__shortcodesPopupControls[tag] = controls;
    };

    CP_Customizer.getShortcodePopupFields = function (shortcodeData) {
        var controls = CP_Customizer.hooks.applyFilters('filter_shortcode_popup_controls', CP_Customizer.__shortcodesPopupControls);
        var attrs = controls[shortcodeData.tag] || [];
        var controls = [];
        for (var attrName in attrs) {
            if (attrs.hasOwnProperty(attrName)) {
                var control = attrs[attrName].control;
                if (control.getValue) {
                    control.value = control.getValue(attrName, shortcodeData.tag);
                } else {
                    if (shortcodeData.attrs && shortcodeData.attrs.hasOwnProperty(attrName)) {
                        control.value = shortcodeData.attrs[attrName];
                    } else {
                        control.value = control.default || "";
                    }
                }
                control.name = attrName;
                control.id = attrName;
                if (control.getParse) {
                    control.value = control.getParse(control.value);
                }
                controls.push(control);
            }
        }
        return controls;
    };

    CP_Customizer.openShortcodePopupEditor = function (callback, $node, shortcode) {
        var popupContainer = $('#cp-container-editor');

        var fields = CP_Customizer.getShortcodePopupFields(shortcode);

        var fallback = CP_Customizer.shortcodesAttrs && CP_Customizer.shortcodesAttrs[shortcode];

        if (!fields.length || fallback) {
            return;
        }

        function setContent() {
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i],
                    value = {},
                    node = field.node;
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

                if (field.setValue) {
                    field.setValue(field.id, value, shortcode.tag);
                } else {
                    shortcode.attrs[field.id] = field.setParse ? field.setParse(value) : value;
                }
            }

            callback(shortcode.attrs);
            CP_Customizer.closePopUps();
            CP_Customizer.updateState();
        }


        popupContainer.find('[id="cp-item-ok"]').off().click(setContent);
        popupContainer.find('[id="cp-item-cancel"]').off().click(function () {
            CP_Customizer.closePopUps();
        });

        var content = '';
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i],
                type = field.type || 'text';
            content += (CP_Customizer.jsTPL[type] ? CP_Customizer.jsTPL[type](field) : '');
        }

        popupContainer.find('#cp-items').html(content);

        CP_Customizer.popUp('Manage Options', "cp-container-editor", {
            width: "600"
        });
    };


    CP_Customizer.editEscapedShortcodeAtts = function ($node, shortcode) {
        CP_Customizer.openShortcodePopupEditor(function (attrs) {
            shortcode.attrs = attrs;

            var shortcodeText = '[' + shortcode.tag;
            var attrs = [];
            for (var attr in shortcode.attrs) {
                if ((shortcode.attrs[attr] + "").trim() != "") {

                    attrs.push(attr + '="' + htmlEscape(htmlEscape(shortcode.attrs[attr])) + '"');
                }
            }

            if (attrs.length) {
                shortcodeText += ' ' + attrs.join(' ');
            }

            shortcodeText += ']';

            CP_Customizer.updateNodeShortcode($node, shortcodeText);

        }, $node, shortcode);
    };

    function htmlEscape(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
})(window, CP_Customizer, jQuery);

