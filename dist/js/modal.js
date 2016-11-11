/**
 * Hex Modals
 *
 * Authors: 
 *     Alex Shortt     <alex@hexdigital.com>
 *     Jamie Warburton <jamie@hexdigital.com>
 *
 * A modal container is injected on the fly when a modal link is clicked. 
 * If it has already been created, such as when clicking a modal link from
 * within modal, the .modal__content will simply be updated instead.
 * The content is loaded in via ajax, by loading the div from that page that
 * has the class set in `self.classContent`.
 * When closed, the modal is removed from the DOM.
 *
 * To use: 
 *   On your target page, add a div with class set to the value of `self.classContent` below.
 *   On your destination page, add a link with class set to `self.classModalLink` below.
 *   Style your overlay with `self.classOverlay` & the main modal container with `self.classModal`.
 *   You can add a close button and a loader for when the ajax appears by styling those too.
 *
 * If you need to perform some javascript functions on a page once it's loaded, you can use the
 * modalLoaded() function, which will be called anytime new modal content is loaded. This function
 * could be used to re-bind handlers to a form when it's loaded in, for example.
 */
var modals = function() {
    var self = this;
    self.init = function () {
        self.setClasses();
        self.listeners();
    };
    self.setClasses = function() {
        // Set these classes based on your CSS, or use them in your CSS
        self.$selectorAppendModal = $('body'); // Selector to append modal and overlay to

        self.classContent = 'modal__content'; // Class of content to load into modal from other pages via ajax
        self.classModalLink = 'modal__link'; // A link that opens a modal
        self.classOverlay = 'overlay-background'; // The overlay background via :after
        self.classModal = 'modal'; // The modal object itself
        self.classWrapper = 'modal__wrapper'; // The wrapper class to use in the modal
        self.classCloseButton = 'modal__close-btn'; // A modal close button
        self.classLoader = 'modal__loader'; // Loading animation container
        self.classClosingModal = 'modal--closing'; // A modal that is closing, used for closing animation

        self.htmlLoader = '<div class="loader"></div>'; // The markup for the loader
    };
    self.listeners = function() {
        $(document).on('click', '.' + self.classModalLink, function(event) {
            event.preventDefault();
            self.getLocation = event.target;
            self.modalType = $(this).data('modal-type');
            self.showModal();
        });
        $(document).on('click', '.' + self.classCloseButton, function() {
            self.closeModal();
        });
        $(document).on('click', '[class*=' + self.classModal + ']', function(event) {
            event.stopPropagation();
        });
        $(document).on('click', function() {
            if ($('.' + self.classModal).length) {
                self.closeModal();
            }
        });
        $(document).keyup(function(event) {
            if (event.keyCode == 27) {
                self.closeModal();
            }
        });
    };
    self.showModal = function() {
        // If we open a modal from within a modal
        if ($('.' + self.classModal).length) {
            self.updateModal();
        } else {
            self.createModal();
        }
        if (typeof modalLoaded === 'function') { 
            modalLoaded();
        }
    };
    self.createModal = function() {
        var modalTypeString = undefined === self.modalType ? '' : ' modal--' + self.modalType;
        self.setBackground('open');
        self.$selectorAppendModal.prepend('<div class="' + self.classModal + modalTypeString + '"><div class="' + self.classWrapper + '"></div></div>');
        $('.' + self.classModal).prepend('<div class="' + self.classLoader + '">' + self.htmlLoader + '</div>');
        self.loadModal();
    };
    self.updateModal = function() {
        $('.' + self.classModal).prepend('<div class="' + self.classLoader + '">' + self.htmlLoader + '</div>');
        $('.' + self.classModal + ' .' + self.classWrapper)
            .children()
            .remove();
        self.loadModal();
    };
    self.loadModal = function() {
        self.addCloseButton();
        $('.' + self.classModal + ' .' + self.classWrapper).load(self.getLocation + ' .' + self.classContent, function() {
            $('.' + self.classLoader).remove();
        });
    };
    self.addCloseButton = function() {
        if (!$('.' + self.classCloseButton).length) {
            $('.' + self.classModal).prepend('<div class="' + self.classCloseButton + '"></div>');
        }
    };
    self.closeModal = function() {
        $('.' + self.classModal).addClass(self.classClosingModal);
        $('.' + self.classModal).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
            $('.' + self.classModal).remove();
            self.setBackground('close');
        });
    };
    self.setBackground = function(state) {
        if ('open' === state) {
            self.$selectorAppendModal.addClass(self.classOverlay);
        } else {
            self.$selectorAppendModal.removeClass(self.classOverlay);
        }
    };
    self.init();
};
