
// Declare module.
var editorSvc = angular.module('editorSvc', ['translatorSvc']);

// Service for initialize the application's menu.
editorSvc.factory('Editor', function(Translator, $rootScope) {
    // Define factory.
    var factory = {
        // Initialize an editor.
        initialize: function(type, selector, twinSelector, docLines) {
            // Initialize variables.
            var container = $(selector);
            var twinContainer = $(twinSelector);
                
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
                $rootScope.$broadcast('paragraph-focused', {'type': type, 'content': content})
                
                // Make height of the textarea to match the content.
                autosize(textarea);

                // Trigger the spellchecker for all words (an not only on active words) by moving the caret around the text.
                for(var i=0; i<content.length; i++) {
                    textarea.selectRange(i,i+1);
                }
                textarea.selectRange(content.length, content.length);
                
                // Assign behaviour for the blur event.
                textarea.blur(function(event) {
                    // Remove highlight on twin.
                    twinParagraph.removeClass('editing');
                    
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
                
                // Search for an automatic translation.
                var APIkey = "somekey"; // TODO: use a key selected by the user.
                var lang = Translator.getLanguageCode('source') + "-" + Translator.getLanguageCode('destination');
                $("#footer > div").html('<div class="loading">Translating...</div>');
                $.ajax({
                    dataType: "json",
                    url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
                    data: {'key': APIkey, 'lang': lang, 'text': content},
                    success: function(data) {
                        $("#footer > div").text(data.text);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        $("#footer > div").html('<div class="error">Translation could not be obtained (' + textStatus + " - " + errorThrown + ')</div>');
                    }
                });
            };
        },
        
        // Behaviour for the mouse enter event on a paragraph.
        onMouseEnter: function(container, twinContainer) {
            return function(event) {
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
        
        // Get all content of <p> elements as an string.
        getContent: function(selector) {
            var res = [];
            $(selector).children('p').each(function(index, element) {
                res.push($(element).text());
            });
            return res;
        }
    };

    // Return factory.
    return factory;
});
