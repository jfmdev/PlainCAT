// Service for initialize the application's menu.
myApp.factory('Editor', ['$rootScope', function($rootScope) {
    var ipcRenderer = require('electron').ipcRenderer;

    // Save containers (for use them when listening events).
    var mainContainers = {};

    // Paste machine translation (on target).
    $rootScope.$on('paste-translation', function(event, data) {
        var container = mainContainers['target'];
        if(container) {
            var paragraph = container.children().eq(data.index);
            paragraph.text(data.text);

            // Trigger event indicating the paragrah was edited.
            $rootScope.$broadcast('paragraph-edited', {
                'type': 'target', 
                'index': paragraph.index()
            });
        }
    });

    // Paste word suggestion.
    ipcRenderer.on('paste-misspelled', function(event, word) {
        // Search container currently having a textarea.
        for (var type in mainContainers) {
          var container = mainContainers[type];
          var textarea = container.find('textarea');

          if(textarea.size() > 0) {
              var caretStart = textarea[0].selectionStart;
              var caretEnd = textarea[0].selectionEnd;
              var text = textarea.val();

              var newText = text.substring(0, caretStart) + word + text.substring(caretEnd, text.length);
              var newCaret = caretStart + word.length;
              textarea.val(newText);
              textarea.selectRange(newCaret);
          }
        }
    });

    // Define factory.
    var factory = {
        // Initialize an editor.
        initialize: function(type, selector, twinSelector, docLines) {
            // Initialize variables.
            var container = $(selector);
            var twinContainer = $(twinSelector);
            mainContainers[type] = container;

            // Load document.
            container.html(factory.formatText(docLines));

            // Assign behaviour for focus and hover event.
            $(selector).children('p')
              .focus( factory.onFocus(type, container, twinContainer) )
              .mouseenter( factory.onMouseEnter(container, twinContainer) )
              .mouseleave( factory.onMouseLeave(container, twinContainer) );
        },

        // Behaviour for the focus event on a paragraph.
        onFocus: function(type, container, twinContainer) {
            return function(event) {
                var paragraph = $(this);

                // Highlight twin paragraph.
                var twinParagraph = twinContainer.children().eq(paragraph.index());
                twinParagraph.addClass('editing');

                // Add textarea and hide paragraph.
                var content = paragraph.text();
                paragraph.after('<textarea rows="1">'+content+'</textarea>');
                var textarea = paragraph.next();
                textarea.val(content);
                textarea.focus();
                paragraph.hide();

                // Trigger event indicating that a paragraph was focused.
                $rootScope.$broadcast('paragraph-focused', {
                    'type': type, 
                    'content': content, 
                    'index': paragraph.index()
                })

                // Move caret to trigger again the spellchecker (note the language used by the spellchecker is set by the 'paragram-focused' event)
                textarea.selectRange(content.length, content.length);

                // Make height of the textarea to match the content.
                autosize(textarea);

                // Assign behaviour for the blur event.
                textarea.blur(function(event) {
                    // Remove highlight on twin.
                    twinParagraph.removeClass('editing');

                    // If content was updated, trigger the corresponding event.
                    if(paragraph.text() !== textarea.val()) {
                        $rootScope.$broadcast('paragraph-edited', {
                            'type': type, 
                            'index': paragraph.index()
                        });
                    }

                    // If the content is empty, then remove the paragraph, otherwise, update it.
                    var content = factory.getLines(textarea.val());
                    if(content.length == 0) {
                        paragraph.remove();
                    } else {
                        // Set firs line on starting paragraph.
                        paragraph.text(content[0]);
                        paragraph.show();

                        // Verify if the content has more than one line.
                        var lastP = paragraph;
                        var dataIndex = paragraph.attr('data-index');
                        for(var i=1; i<content.length; i++) {
                            // Create paragraph.
                            var pi = '<p data-index="'+dataIndex+'" contenteditable="true">' + content[i] + '</p>';
                            lastP.after(pi);

                            // Set behaviours.
                            lastP = lastP.next();
                            lastP
                              .focus( factory.onFocus(container, twinContainer) )
                              .mouseenter( factory.onMouseEnter(container, twinContainer) )
                              .mouseleave( factory.onMouseLeave(container, twinContainer) );
                        }
                    }

                    // Remove text area.
                    textarea.remove();
                });
            };
        },

        // Behaviour for the mouse enter event on a paragraph.
        onMouseEnter: function(container, twinContainer) {
            return function(event) {
                // Remove highlight from all other paragrah (sometimes mouse leave event don't triggers).
                container.find('p').removeClass('highlight');
                twinContainer.find('p').removeClass('highlight');

                // Highlight twin paragraph.
                var paragraph = $(this);
                var index = paragraph.parent().children('p').index(paragraph);
                var twinParagraph = twinContainer.children('p').eq(index);
                twinParagraph.addClass('highlight');
            }
        },

        // Behaviour for the mouse leave event on a paragraph.
        onMouseLeave: function(container, twinContainer) {
            return function(event) {
                var paragraph = $(this);
                var index = paragraph.parent().children('p').index(paragraph);
                var twinParagraph = twinContainer.children().eq(index);
                twinParagraph.removeClass('highlight');
            }
        },

        // Get all non empty lines from a text.
        getLines: function(text) {
            var res = [];

            if(text != null && text.length > 0) {
                var lines = text.split(/\r\n|\r|\n/);
                for(var i=0; i<lines.length; i++) {
                    if(lines[i] != null && lines[i].length > 0) {
                        res.push(lines[i]);
                    }
                }
            }
            return res;
        },

        // Generates the HTML code for a list of paragraphs.
        formatText: function(lines) {
            var res = '';
            for(var i=0; i<lines.length; i++) {
                res += '<p data-index="'+i+'" contenteditable="true">' + _.escape(lines[i].text) + '</p>';
            }
            return res;
        },

        // Get all content of <p> elements as an array of string.
        getContentAsArray: function(type) {
            var res = [];
            $('#' + type + '-file').children('p').each(function(index, element) {
                res.push($(element).text());
            });
            return res;
        },

        // Get all content of <p> elements as a string.
        getContentAsString: function(type) {
            // TODO: Ideally should replace new paragraphs in original file.
            var paragraphSeparator =  ipcRenderer.sendSync('get-platform') !== 'win32'? '\n' : '\r\n';
            var content = this.getContentAsArray(type).join(paragraphSeparator);
            return content;
        },
    };

    // Return factory.
    return factory;
}]);