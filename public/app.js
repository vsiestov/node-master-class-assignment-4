/**
 * Front-end main application module
 */

if (!window.module) {
    window.module = {};
}

module.materials = (function () {
    "use strict";

    var controls = {
            addingToCartLoading: false,
            server: {
                addToCart: '/carts',
                deleteFromCart: '/carts'
            }
        },
        handlers = {

            /**
             * Hide form validation message
             */
            toggleFormChips: () => {
                controls.formMessage.classList.toggle('visible');
            },

            /**
             * Add item to the cart
             *
             * @param event
             */
            addToCartAction: (event) => {
                if (controls.addingToCartLoading) {
                    return;
                }

                controls.addingToCartLoading = true;

                fetch(controls.server.addToCart, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: event.target.getAttribute('data-id'),
                        count: 1
                    })
                })
                    .then((response) => {
                        return response.json();
                    })
                    .then((response) => {
                        if (response.errors && response.errors.length) {
                            return controls.cartSnackbarObject.show({
                                message: response.errors && response.errors.length ?
                                    response.errors[0] :
                                    'Something went wrong',
                                actionText: 'Close'
                            });
                        }

                        return controls.cartSnackbarObject.show({
                            message: 'Item has been added to your cart',
                            actionText: 'Close'
                        });
                    })
                    .catch((error) => {
                        controls.cartSnackbarObject.show({
                            message: error.errors && error.errors.length ? error.errors[0] : 'Something went wrong',
                            actionText: 'Close'
                        });
                    })
                    .then(() => {
                        controls.addingToCartLoading = false;
                    });
            },

            /**
             * Delete item from the cart
             * @param event
             */
            deleteFromCartAction: (event) => {
                var target = event.target,
                    parentItem = target.parentNode;

                fetch(controls.server.deleteFromCart + '?id=' + target.getAttribute('data-id'), {
                    method: 'DELETE',
                    credentials: 'include',
                })
                    .then((response) => {
                        return response.json();
                    })
                    .then((response) => {
                        parentItem.parentNode.removeChild(parentItem);

                        controls.cartSnackbarObject.show({
                            message: response.message,
                            actionText: 'Close'
                        });
                    })
                    .catch((error) => {
                        console.error(error);

                        controls.cartSnackbarObject.show({
                            message: error.errors && error.errors.length ? error.errors[0] : 'Something went wrong',
                            actionText: 'Close'
                        });
                    });
            },

            /**
             * Add token to submitted form and send to the server
             *
             * @param token
             */
            stripeTokenHandler: (token) => {
                var form = controls.paymentForm,
                    hiddenInput = document.createElement('input');

                hiddenInput.setAttribute('type', 'hidden');
                hiddenInput.setAttribute('name', 'source');
                hiddenInput.setAttribute('value', token.id);

                form.appendChild(hiddenInput);

                form.submit();
            },

            /**
             * Payment form submit process
             * @param event
             */
            submitPaymentForm: (event) => {
                var errorElement = document.getElementById('card-errors');

                event.preventDefault();

                stripe.createToken(controls.card).then(function(result) {
                    if (result.error) {
                        // Inform the customer that there was an error.

                        errorElement.textContent = result.error.message;
                    } else {
                        // Send the token to your server.
                        handlers.stripeTokenHandler(result.token);
                    }
                });
            },

            /**
             * Showing message when credit card catches an error
             * @param event
             */
            creditCardChanged: (event) => {
                var displayError = document.getElementById('card-errors');

                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            }
        },
        stripe = Stripe('pk_test_CynJXhvnHy76k9yUruSiLrpW'),
        elements = stripe.elements();

    /**
     * Init stripe credit card functionality
     */
    function initCreditCard() {
        var style = {
                base: {
                    color: '#32325d',
                    lineHeight: '18px',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            },
            card = elements.create('card', {style: style}),
            creditCardElement = document.getElementById('card-element'),
            form = document.getElementById('payment-form');

        controls.paymentForm = form;
        controls.card = card;

        if (!creditCardElement) {
            return;
        }

        card.mount(creditCardElement);

        card.addEventListener('change', handlers.creditCardChanged, false);
        form.addEventListener('submit', handlers.submitPaymentForm, false);
    }

    /**
     * Set event handlers for DOM controls
     */
    function setEventList() {
        var buttons = controls.buttons,
            buttonsCount = buttons.length,
            textFields = controls.textFields,
            textFieldsCount = textFields.length,
            pizzaItems = controls.pizzaItems,
            pizzaItemsCount = pizzaItems.length,
            cartItems = controls.cartItems,
            cartItemsCount = cartItems.length,
            i;

        for (i = 0; i < buttonsCount; i++) {
            window.mdc.ripple.MDCRipple.attachTo(buttons[i]);
        }

        if (controls.topAppToolbar) {
            window.mdc.topAppBar.MDCTopAppBar.attachTo(controls.topAppToolbar);
        }

        for (i = 0; i < textFieldsCount; i++) {
            new window.mdc.textField.MDCTextField(textFields[i]);
        }

        for (i = 0; i < pizzaItemsCount; i++) {
            pizzaItems[i].addEventListener('click', handlers.addToCartAction, false);
        }

        for (i = 0; i < cartItemsCount; i++) {
            cartItems[i].addEventListener('click', handlers.deleteFromCartAction, false);
        }

        if (controls.formMessage) {
            controls.formMessage.addEventListener('click', handlers.toggleFormChips, false);
        }

        if (controls.cartSnackbar) {
            controls.cartSnackbarObject = new window.mdc.snackbar.MDCSnackbar(controls.cartSnackbar);
        }

        initCreditCard();
    }

    /**
     * Get DOM elements
     */
    function getControls() {
        controls.buttons = Array.from(document.querySelectorAll('.mdc-button')) || [];
        controls.topAppToolbar = document.querySelector('.mdc-top-app-bar');
        controls.textFields = Array.from(document.querySelectorAll('.mdc-text-field')) || [];
        controls.formMessage = document.querySelector('.form-message');
        controls.pizzaItems = Array.from(document.querySelectorAll('.pizza__item .mdc-card__action'));
        controls.cartSnackbar = document.querySelector('.pizza-cart-snackbar');
        controls.cartItems = Array.from(document.querySelectorAll('.carts__item-delete'));

    }

    /**
     * Module initialization
     */
    function init() {
        getControls();
        setEventList();
    }

    return {
        init: init
    };

}());

window.addEventListener('DOMContentLoaded', function () {

    module.materials.init({
    });

}, false);
