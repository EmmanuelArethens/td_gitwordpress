(function ($) {
    CP_Customizer.addModule(function () {
        CP_Customizer.utils = CP_Customizer.utils || {};
        CP_Customizer.utils.phpTrim = function (str, charlist) {

            var whitespace = [
                ' ',
                '\n',
                '\r',
                '\t',
                '\f',
                '\x0b',
                '\xa0',
                '\u2000',
                '\u2001',
                '\u2002',
                '\u2003',
                '\u2004',
                '\u2005',
                '\u2006',
                '\u2007',
                '\u2008',
                '\u2009',
                '\u200a',
                '\u200b',
                '\u2028',
                '\u2029',
                '\u3000'
            ].join('');

            var l = 0;
            var i = 0;
            str += '';

            if (charlist) {
                whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1')
            }
            l = str.length
            for (i = 0; i < l; i++) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(i)
                    break
                }
            }
            l = str.length
            for (i = l - 1; i >= 0; i--) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(0, i + 1)
                    break
                }
            }
            return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
        };

        CP_Customizer.utils.normalizeBackgroundImageValue = function (value) {
            value = value.replace(/url\((.*)\)/, "$1");
            return CP_Customizer.utils.phpTrim(value, "\"'");
        };


        CP_Customizer.utils.htmlDecode = function (value) {
            return $('<div/>').html(value).text();
        };

        CP_Customizer.utils.htmlEscape = function (str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };


        CP_Customizer.utils.setToPath = function (schema, path, value) {

            if (!schema) {
                return schema;
            }

            var pList = path.split('.');
            var len = pList.length;

            if (len > 1) {
                var first = pList.shift();
                var remainingPath = pList.join('.');
                schema[first] = CP_Customizer.utils.setToPath(schema[first], remainingPath, value);
            } else {
                schema[path] = value;
            }

            return schema;
        }

        CP_Customizer.utils.normalizeShortcodeString = function (shortcode) {
            shortcode = CP_Customizer.utils.htmlDecode(shortcode);

            return '[' + CP_Customizer.utils.phpTrim(shortcode) + ']';
        }
    });
})(jQuery);
