// Service for initialize the application's menu.
myApp.factory('Editor', ['$rootScope', 'Shared', function($rootScope, Shared) {
    var ipcRenderer = require('electron').ipcRenderer;
    var container = {};

    // Paste machine translation (on target).
    $rootScope.$on('paste-translation', function(event, data) {
        var row = container.children().eq(data.index);

        // Update paragraph and textarea (if exists).
        var paragraph = row.children().eq(1).find('p');
        paragraph.text(data.text);
        var textarea = row.children().eq(1).find('textarea');
        if(textarea.size() > 0) {
            textarea.val(data.text);
        }

        // Trigger event indicating the paragrah was edited.
        $rootScope.$broadcast('paragraph-edited', {
            'type': 'target', 
            'index': data.index
        });
    });

    // Check for duplicated content when updating a paragraph.
    $rootScope.$on('paragraph-edited', function(event, data) {
        factory.checkDuplicatedContent(data.index);
    });

    // Paste word suggestion.
    ipcRenderer.on('paste-misspelled', function(event, word) {
        // Search container currently having a textarea.
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
    });

    // Change paragraphs columns when updating the corresponding settings.
    Shared.store.watch('paragraphsPos', function(key, newValue) {
        var jqDivs = $('#files-content > .row-paragraph > div');
        if(newValue === 'divided') {
            jqDivs.addClass('col-xs-6').removeClass('col-xs-12')
        } else {
            jqDivs.addClass('col-xs-12').removeClass('col-xs-6')
        }
    });
    
    // Define factory.
    var factory = {
        // Initialization.
        initialize(selector) {
            container = $(selector);
        },

        // Load the content of a file.
        loadContent: function(type, docLines) {
            var col = type === 'source' ? 0 : 1;

            // Add rows (if need).
            if(docLines) {
                var rowsDiff = docLines.length - container.children().size();
                var columnsWidth = Shared.store.get('paragraphsPos') == 'divided' ? 6 : 12;
                for(var j=0; j<rowsDiff; ++j) {
                    container.append([
                        '<div class="row row-paragraph">',
                            '<div class="col-xs-' + columnsWidth + ' col-source"></div>',
                            '<div class="col-xs-' + columnsWidth + ' col-target"></div>',
                        '</div>',
                    ].join(''));
                }
            }

            // Append content.
            var rows = container.children();
            for(var i=0; i<rows.length; ++i) {
                // Set content.
                var row = rows.eq(i);
                var cell = row.children().eq(col);
                if(docLines) {
                    var content = i < docLines.length ? _.escape(docLines[i].text) : '';
                    cell.html('<p contenteditable="true">' + content + '</p>');

                    // Assign behaviour for focus event.
                    cell.children('p').focus(factory.onFocus);
                } else {
                    cell.html('<p></p>');
                }

                // Check if the content is duplicated.
                factory.checkDuplicatedContent(i);
            }

            // Remove empty rows (if any).
            factory.removeEmptyRows();
        },

        removeEmptyRows: function() {0
            // Remove empty rows (if any).
            var rowsCount = container.children().length;
            for(var k=rowsCount; k>0; --k) {
                var row = container.children().eq(k-1);
                var p1 = row.children().eq(0).find('p');
                var p2 = row.children().eq(1).find('p');
                if(p1.text().length == 0 && p2.text().length == 0) {
                    row.remove();
                } else {
                    k = 0;
                }
            }
        },

        checkDuplicatedContent: function(index) {
            var row = container.children().eq(index);
            if(row.size() > 0) {
                var p1 = row.children().eq(0).find('p');
                var p2 = row.children().eq(1).find('p');
                if(p1.text() === p2.text()) {
                    p2.addClass('text-light');
                } else {
                    p2.removeClass('text-light');
                }
            }
        },

        removeCurrentTextarea: function() {
            var textarea = container.find('textarea');
            if(textarea.size() > 0) {
                var row = textarea.parent().parent();
                var paragraph = textarea.parent().find('p');

                // Remove highlight from row.
                row.removeClass('editing');

                // Show paragraph and temove textarea.
                paragraph.show();
                textarea.remove();
            }
        },

        // Behaviour for the focus event on a paragraph.
        onFocus: function(event) {
            // Initialization.
            var paragraph = $(this);
            var type = paragraph.parent().index() == 0 ? 'source' : 'target';
            var row = paragraph.parent().parent();

            // Remove current textarea (if any).
            factory.removeCurrentTextarea();

            // Highlight row.
            row.addClass('editing');

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
                'index': row.index(),
            })

            // Move caret to trigger again the spellchecker (note the language used by the spellchecker is set by the 'paragram-focused' event)
            textarea.selectRange(content.length, content.length);

            // Make height of the textarea to match the content.
            autosize(textarea);

            // Assign behaviour for the blur event.
            textarea.blur(function(event) {

                // Check if content was updated.
                if(paragraph.text() !== textarea.val()) {
                    // Update paragraph.
                    paragraph.text(textarea.val());

                    // Trigger the corresponding event
                    $rootScope.$broadcast('paragraph-edited', {
                        'type': type, 
                        'index': row.index()
                    });
                }
            });
        },

        // Get all content of <p> elements as an array of string.
        getContentAsArray: function(type) {
            var res = [];

            var col = type === 'source' ? 0 : 1;
            container.children().each(function(index, row) {
                var paragraph = $(row).children().eq(col).find('p');
                res.push(paragraph.text());
            });

            return res;
        },

        // Get the content of a give paragraph.
        getParagraphContent: function(type, index) {
            var col = type === 'source' ? 0 : 1;
            var row = container.children().eq(index);
            var paragraph = row.children().eq(col).find('p');
            return paragraph.text();
        },
    };

    // Return factory.
    return factory;
}]);
