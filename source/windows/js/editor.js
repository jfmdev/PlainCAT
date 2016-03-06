
// Declare module.
var editorSvc = angular.module('editorSvc', []);

// Service for initialize the application's menu.
menuSvc.factory('Editor', function() {
    // Define factory.
    var factory = {
        // Initialize an editor.
        initialize: function(selector, twinSelector, docLines) {
            // Initialize variables.
            var container = $(selector);
            var twinContainer = $(twinSelector);
            
            // Load document.
            container.html(factory.formatText(docLines));
            
            // Assign behaviour for focus and hover event.
            $(selector).children('p')
              .focus( factory.onFocus(container, twinContainer) )
              .mouseenter( factory.onMouseEnter(container, twinContainer) )
              .mouseleave( factory.onMouseLeave(container, twinContainer) );
        },
        
        // Behaviour for the focus event on a paragraph.
        onFocus: function(container, twinContainer) {
            return function(event) {
                var paragraph = $(this);
                
                // Highlight twin paragraph.
                var twinParagraph = twinContainer.children().eq(paragraph.index());
                twinParagraph.addClass('editing');
                
                // Add textarea and hide paragraph.
                var content = paragraph.text();
                paragraph.after('<textarea rows="1">' + content + '</textarea>');
                var textarea = paragraph.next();
                textarea.focus();
                paragraph.hide();
                
                // Make height of the textarea to match the content.
                autosize(textarea);
                
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
            }
        },
        
        // Behaviour for the mouse enter event on a paragraph.
        onMouseEnter: function(container, twinContainer) {
            return function(event) {
                var paragraph = $(this);
                var index = paragraph.parent().children('p').index(paragraph);
                var twinParagraph = twinContainer.children().eq(index);
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
                res += '<p data-index="'+i+'" contenteditable="true">' + lines[i].text + '</p>';
            }
            return res;
        }
    };

    // Return factory.
    return factory;
});

