(function() {
    var __templates = {};

    function getCPTemplate(id) {
        var text = jQuery("#cp-content-templates-" + id)[0].innerHTML;

        text = text.split('<inline-script').join('<script');
        text = text.split('</inline-script').join('</script');

        return _.template(text);
    }

    window.CP_Customizer.addModule(function(CP_Customizer) {
        var contentTemplates = {
            text: getCPTemplate("text"),
            'text-with-checkbox': getCPTemplate("text-with-checkbox"),
            link: getCPTemplate("link"),
            image: getCPTemplate("image"),
            icon: getCPTemplate("icon"),
            list: getCPTemplate("list"),
            'linked-icon': getCPTemplate("linked-icon"),
            getCPScriptTemplate: getCPTemplate
        };

        CP_Customizer.jsTPL = _.extend(CP_Customizer.jsTPL, contentTemplates);
    });
})();