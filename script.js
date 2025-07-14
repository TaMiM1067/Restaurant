document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GLOBAL: MOBILE NAVIGATION ---
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksLi = document.querySelectorAll('.nav-links li');
    if (burger) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            navLinksLi.forEach((link, index) => {
                link.style.animation ? link.style.animation = '' : link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            });
        });
    }

    // --- 2. GLOBAL: STICKY HEADER ---
    const header = document.getElementById('header');
    if (header) { window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50)); }

    // --- 3. GLOBAL: DARK/LIGHT MODE TOGGLE ---
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme);
            themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // --- 4. MENU PAGE: ORDERING SYSTEM ---
    if (document.getElementById('place-order-btn')) {
        const checkboxes = document.querySelectorAll('.menu-checkbox');
        const totalAmountElement = document.getElementById('total-amount');
        const placeOrderBtn = document.getElementById('place-order-btn');
        const modalOverlay = document.getElementById('invoice-modal-overlay');
        const closeModalBtn = document.getElementById('close-invoice-modal');
        const confirmOrderBtn = document.getElementById('confirm-order-btn');
        const invoiceItemsContainer = document.getElementById('invoice-items');
        const invoiceSubtotal = document.getElementById('invoice-subtotal');
        const invoiceTax = document.getElementById('invoice-tax');
        const invoiceTotal = document.getElementById('invoice-total');
        const dineInRadio = document.getElementById('dine-in-radio');
        const takeawayRadio = document.getElementById('takeaway-radio');
        const dineInDetails = document.getElementById('dine-in-details');
        const takeawayDetails = document.getElementById('takeaway-details'); // This was not used before, but good to have a reference
        const modalName = document.getElementById('modal-name');
        const modalPhone = document.getElementById('modal-phone');
        const modalDate = document.getElementById('modal-date');
        const modalTime = document.getElementById('modal-time');
        const modalGuests = document.getElementById('modal-guests');
        const TAX_RATE = 0.08;

        const updatePageTotal = () => {
            let total = 0;
            checkboxes.forEach(cb => {
                const menuItem = cb.closest('.menu-item');
                menuItem.classList.toggle('selected', cb.checked);
                if (cb.checked) total += parseFloat(menuItem.dataset.price);
            });
            totalAmountElement.textContent = `$${total.toFixed(2)}`;
            return total;
        };

        const resetOrderForm = () => {
            checkboxes.forEach(cb => cb.checked = false);
            takeawayRadio.checked = true;
            dineInDetails.classList.add('hidden');
            [modalName, modalPhone, modalDate, modalTime, modalGuests].forEach(input => input.value = '');
            updatePageTotal();
        };

        placeOrderBtn.addEventListener('click', () => {
            const subtotal = updatePageTotal();
            if (subtotal === 0) { alert('Please select at least one item.'); return; }
            invoiceItemsContainer.innerHTML = '';
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    const item = cb.closest('.menu-item');
                    const itemName = item.querySelector('h3').textContent;
                    const itemPrice = parseFloat(item.dataset.price).toFixed(2);
                    invoiceItemsContainer.innerHTML += `<div class="invoice-item"><span>${itemName}</span><span>$${itemPrice}</span></div>`;
                }
            });
            const tax = subtotal * TAX_RATE;
            const total = subtotal + tax;
            invoiceSubtotal.textContent = `$${subtotal.toFixed(2)}`;
            invoiceTax.textContent = `$${tax.toFixed(2)}`;
            invoiceTotal.textContent = `$${total.toFixed(2)}`;
            modalOverlay.classList.add('active');
        });

        dineInRadio.addEventListener('change', () => { dineInDetails.classList.remove('hidden'); });
        takeawayRadio.addEventListener('change', () => { dineInDetails.classList.add('hidden'); });
        closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });

        confirmOrderBtn.addEventListener('click', () => {
            let confirmationMessage = '';
            
            // Validate personal details first, as they are always required in the new layout
            if (!modalName.value || !modalPhone.value) {
                alert('Please provide your Name and Mobile Number.');
                return;
            }

            if (dineInRadio.checked) {
                // Then, if it's Dine-In, validate the reservation fields
                if (!modalDate.value || !modalTime.value || !modalGuests.value) {
                    alert('Please fill in all reservation details (Date, Time, and Guests).');
                    return;
                }
                confirmationMessage = `Thank you, ${modalName.value}!\n\nYour Dine-In order for ${invoiceTotal.textContent} is confirmed.\n\nYour table for ${modalGuests.value} guest(s) is reserved for ${modalDate.value} at ${modalTime.value}. We will contact you at ${modalPhone.value} if needed.\n\nWe look forward to seeing you!`;
            } else { // Takeaway
                confirmationMessage = `Thank you, ${modalName.value}!\n\nYour Takeaway order for ${invoiceTotal.textContent} has been confirmed.\nWe will contact you at ${modalPhone.value} when it's ready for pickup.`;
            }
            
            alert(confirmationMessage);
            modalOverlay.classList.remove('active');
            resetOrderForm();
        });
        
        checkboxes.forEach(cb => cb.addEventListener('change', updatePageTotal));
        updatePageTotal();
    }

    // --- 5. INDEX PAGE: RESERVATION FORM ---
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const name = document.getElementById('name').value; const email = document.getElementById('email').value; const phone = document.getElementById('phone').value; const guests = document.getElementById('guests').value; const date = document.getElementById('date').value; const time = document.getElementById('time').value;
            if (name && email && phone && guests && date && time) {
                const formMessage = document.getElementById('form-message');
                formMessage.textContent = `Thank you, ${name}! Your reservation for ${guests} guest(s) on ${date} at ${time} is confirmed.`;
                formMessage.className = 'success';
                reservationForm.reset();
                setTimeout(() => { formMessage.className = 'hidden'; }, 5000);
            } else {
                alert('Please fill out all required fields.');
            }
        });
    }

    // --- 6. GLOBAL: FADE-IN ANIMATION ON SCROLL ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }
});