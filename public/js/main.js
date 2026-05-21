document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
            mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Đóng menu' : 'Mở menu');
        });
    }

    // Close mobile nav on click
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav) mobileNav.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.setAttribute('aria-label', 'Mở menu');
            }
        });
    });

    // Scroll reveal motion
    const revealSelectors = [
        '.hero-content',
        '.hero-visual-card',
        '.benefit-card',
        '.section-heading-row',
        '.stat-item',
        '.product-info',
        '.pricing-table-wrapper',
        '.platform-copy',
        '.platform-media',
        '.pricing-card',
        '.process-step',
        '.contact-info',
        '.contact-image',
        '.lead-form',
        '.faq-item'
    ];

    const revealItems = Array.from(document.querySelectorAll(revealSelectors.join(',')))
        .filter((item, index, items) => items.indexOf(item) === index);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ('IntersectionObserver' in window && !reduceMotion && revealItems.length) {
        const revealTimers = new WeakMap();
        const revealDelays = new WeakMap();

        document.body.classList.add('reveal-ready');

        const getRevealDirection = (item, groupIndex) => {
            if (item.matches('.hero-content, .product-info, .platform-copy, .contact-info, .contact-image')) {
                return 'reveal-from-left';
            }

            if (item.matches('.hero-visual-card, .pricing-table-wrapper, .platform-media, .lead-form')) {
                return 'reveal-from-right';
            }

            if (groupIndex % 3 === 0) return 'reveal-from-left';
            if (groupIndex % 3 === 2) return 'reveal-from-right';
            return 'reveal-from-up';
        };

        revealItems.forEach(item => {
            const siblingGroup = Array.from(item.parentElement ? item.parentElement.children : [])
                .filter(child => revealItems.includes(child));
            const groupIndex = Math.max(siblingGroup.indexOf(item), 0);

            item.classList.add('scroll-reveal', getRevealDirection(item, groupIndex));
            revealDelays.set(item, Math.min(groupIndex * 90, 270));
        });

        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const item = entry.target;
                const pendingTimer = revealTimers.get(item);

                if (pendingTimer) {
                    window.clearTimeout(pendingTimer);
                }

                if (entry.isIntersecting) {
                    const timer = window.setTimeout(() => {
                        item.classList.add('is-revealed');
                        revealTimers.delete(item);
                    }, revealDelays.get(item) || 0);
                    revealTimers.set(item, timer);
                } else {
                    item.classList.remove('is-revealed');
                    revealTimers.delete(item);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.16
        });

        revealItems.forEach(item => revealObserver.observe(item));
    }

    // Lead Form Submission
    const leadForm = document.getElementById('leadForm');
    const formMsg = document.getElementById('formMsg');
    const submitBtn = document.getElementById('submitBtn');

    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(leadForm);
            const data = Object.fromEntries(formData.entries());
            data.name = (data.name || '').trim().slice(0, 100);
            data.phone = (data.phone || '').trim().slice(0, 20);
            data.message = (data.message || '').trim().slice(0, 1000);

            // Basic validation
            if (!data.name || !data.phone || !data.message) {
                formMsg.textContent = 'Vui lòng điền đầy đủ họ tên, số điện thoại và nội dung tư vấn.';
                formMsg.className = 'form-msg error';
                return;
            }

            if (!/^[0-9+\-\s().]{8,20}$/.test(data.phone)) {
                formMsg.textContent = 'Số điện thoại không hợp lệ.';
                formMsg.className = 'form-msg error';
                return;
            }

            formMsg.style.display = '';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang gửi...';

            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(resData => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Nhận tư vấn ngay';
                
                if (resData.success) {
                    formMsg.textContent = resData.message;
                    formMsg.className = 'form-msg success';
                    leadForm.reset();
                    
                    if (typeof fbq === 'function') {
                        fbq('track', 'Lead');
                    }
                } else {
                    formMsg.textContent = resData.error || 'Có lỗi xảy ra, vui lòng thử lại sau.';
                    formMsg.className = 'form-msg error';
                }
                
                setTimeout(() => {
                    formMsg.style.display = 'none';
                }, 5000);
            })
            .catch(err => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Nhận tư vấn ngay';
                formMsg.textContent = 'Lỗi kết nối, vui lòng thử lại.';
                formMsg.className = 'form-msg error';
                formMsg.style.display = '';
            });
        });
    }
});
