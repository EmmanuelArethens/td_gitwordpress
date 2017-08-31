(function (root, CP_Customizer, $) {

    CP_Customizer.registerShortcodePopupControls(
        "one_page_express_contact_form",
        {
            "shortcode": {
                control: {
                    label: "3rd party form shortcode",
                    type: "text",
                    setParse: function (value) {
                    
                        return value.replace(/^\[+/, '').replace(/\]+$/, '');
                    },

                    getParse: function (value) {
                        if (!value) {
                            value = CP_Customizer.getMod('one_page_express_contact_form_shortcode');
                        }

                        var val = value.replace(/^\[+/, '').replace(/\]+$/, '');

                        if (!val) return "";
                        return "[" + CP_Customizer.utils.htmlDecode(val) + "]";
                    }
                }
            }
        }
    );

    CP_Customizer.hooks.addAction('shortcode_edit_one_page_express_contact_form', CP_Customizer.editEscapedShortcodeAtts);

})(window, CP_Customizer, jQuery);