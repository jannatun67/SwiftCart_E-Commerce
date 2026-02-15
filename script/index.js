// Home page js code 









// Products
    (function() {
      // ---------- GLOBAL CART STATE (localStorage) ----------
      let cart = JSON.parse(localStorage.getItem('swiftcart_cart')) || [];
      
      function saveCart() {
        localStorage.setItem('swiftcart_cart', JSON.stringify(cart));
        updateCartUI();
        renderCartSidebar();   // cart sidebar reflects changes
      }

      function updateCartUI() {
        const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        document.getElementById('cartCountBadge').innerText = totalItems;
      }

      // add to cart
      window.addToCart = function(product) {
        const existing = cart.find(p => p.id === product.id);
        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
        } else {
          cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        gsap.to("#cartIcon", { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
      };

      // remove from cart (challenge)
      window.removeFromCart = function(productId) {
        cart = cart.filter(p => p.id !== productId);
        saveCart();
      };

      // update quantity
      window.updateQuantity = function(productId, delta) {
        const idx = cart.findIndex(p => p.id === productId);
        if (idx === -1) return;
        const newQty = (cart[idx].quantity || 1) + delta;
        if (newQty <= 0) {
          removeFromCart(productId);
        } else {
          cart[idx].quantity = newQty;
          saveCart();
        }
      };

      // clear cart
      window.clearCart = function() {
        cart = [];
        saveCart();
      };

      // render cart sidebar (extra cart page)
      function renderCartSidebar() {
        const container = document.getElementById('cartItemsContainer');
        if (!container) return;
        if (cart.length === 0) {
          container.innerHTML = '<div class="text-center text-gray-500 py-10"><i class="fa-solid fa-basket-shopping text-5xl mb-3 opacity-30"></i><p>Your cart is empty</p></div>';
          document.getElementById('cartTotal').innerText = '$0.00';
          return;
        }
        let html = '';
        let total = 0;
        cart.forEach(item => {
          const itemTotal = item.price * (item.quantity || 1);
          total += itemTotal;
          html += `
            <div class="flex gap-3 border-b pb-3">
              <img src="${item.image}" class="w-16 h-16 object-contain bg-gray-100 rounded" alt="${item.title}">
              <div class="flex-1">
                <h4 class="text-sm font-semibold truncate">${item.title}</h4>
                <div class="flex items-center mt-1 text-sm">
                  <span class="font-bold text-indigo-700">$${item.price}</span>
                  <div class="flex items-center ml-auto border rounded">
                    <button onclick="updateQuantity(${item.id}, -1)" class="px-2 py-0.5 hover:bg-gray-200"><i class="fa-solid fa-minus"></i></button>
                    <span class="px-3 py-0.5">${item.quantity || 1}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="px-2 py-0.5 hover:bg-gray-200"><i class="fa-solid fa-plus"></i></button>
                  </div>
                </div>
                <button onclick="removeFromCart(${item.id})" class="text-xs text-rose-600 mt-1"><i class="fa-regular fa-trash-can"></i> Remove</button>
              </div>
            </div>
          `;
        });
        container.innerHTML = html;
        document.getElementById('cartTotal').innerText = `$${total.toFixed(2)}`;
      }

      // toggle cart sidebar (extra cart page)
      window.toggleCartSidebar = function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        sidebar.classList.toggle('open');
        overlay.classList.toggle('hidden');
        if (sidebar.classList.contains('open')) renderCartSidebar();
      };

      // ---------- HAMBURGER ----------
      const menuBtn = document.getElementById('mobileMenuBtn');
      const mobileMenu = document.getElementById('mobileMenu');
      menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('open');
        mobileMenu.classList.toggle('hidden');
      });

      // ---------- FETCH CATEGORIES & PRODUCTS ----------
      const categoryList = document.getElementById('categoryList');
      const productGrid = document.getElementById('productGrid');
      const productCountSpan = document.getElementById('productCount');
      let allProducts = [];

      // fetch categories
      fetch('https://fakestoreapi.com/products/categories')
        .then(res => res.json())
        .then(cats => {
          categoryList.innerHTML = '';
          // "All" button
          const allBtn = document.createElement('button');
          allBtn.innerText = 'All';
          allBtn.className = 'px-4 py-2 rounded-full border border-indigo-300 text-sm font-medium hover:bg-indigo-100 transition category-btn';
          allBtn.dataset.category = 'all';
          allBtn.addEventListener('click', () => filterProducts(null, allBtn));
          categoryList.appendChild(allBtn);

          cats.forEach(cat => {
            const btn = document.createElement('button');
            btn.innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
            btn.className = 'px-4 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-indigo-100 transition category-btn';
            btn.dataset.category = cat;
            btn.addEventListener('click', () => filterProducts(cat, btn));
            categoryList.appendChild(btn);
          });
          // set active all
          document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('category-active'));
          allBtn.classList.add('category-active');
        })
        .catch(() => categoryList.innerHTML = '<span class="text-red-500">error</span>');

      // fetch all products
      fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(products => {
          allProducts = products;
          renderProducts(products);
        })
        .catch(() => productGrid.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load products</div>');

      function renderProducts(productsArray) {
        if (!productsArray.length) {
          productGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">No products match</div>';
          productCountSpan.innerText = '0 products';
          return;
        }
        let html = '';
        productsArray.forEach(p => {
          html += `<div class="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col">
            <img src="${p.image}" alt="${p.title}" class="product-card-img w-full">
            <div class="p-4 flex-1 flex flex-col">
              <span class="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full self-start">${p.category}</span>
              <h3 class="font-semibold mt-2 line-clamp-2">${p.title}</h3>
              <div class="flex justify-between items-center mt-2">
                <span class="text-xl font-bold text-indigo-700">$${p.price}</span>
                <span class="text-sm text-gray-600"><i class="fa-regular fa-star text-amber-400"></i> ${p.rating.rate} (${p.rating.count})</span>
              </div>
              <div class="flex gap-2 mt-4">
                <button data-id="${p.id}" class="detailsBtn flex-1 border border-indigo-600 text-indigo-700 px-2 py-1.5 rounded-lg text-sm hover:bg-indigo-50"><i class="fa-regular fa-eye mr-1"></i>Details</button>
                <button data-product='${JSON.stringify(p).replace(/'/g, "&apos;")}' class="addToCartBtn flex-1 bg-indigo-600 text-white px-2 py-1.5 rounded-lg text-sm hover:bg-indigo-700"><i class="fa-solid fa-cart-plus mr-1"></i>Add</button>
              </div>
            </div>
          </div>`;
        });
        productGrid.innerHTML = html;
        productCountSpan.innerText = `${productsArray.length} products`;

        // attach details
        document.querySelectorAll('.detailsBtn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const product = allProducts.find(p => p.id == id);
            if (product) showModal(product);
          });
        });
        // attach add to cart
        document.querySelectorAll('.addToCartBtn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const prodStr = e.currentTarget.dataset.product;
            const product = JSON.parse(prodStr.replace(/&apos;/g, "'"));
            addToCart(product);
          });
        });
      }

      function filterProducts(category, btnElement) {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('category-active'));
        btnElement.classList.add('category-active');
        if (!category || category === 'all') {
          renderProducts(allProducts);
        } else {
          fetch(`https://fakestoreapi.com/products/category/${category}`)
            .then(res => res.json())
            .then(filtered => renderProducts(filtered))
            .catch(() => productGrid.innerHTML = '<div class="col-span-full text-center text-red-500">error</div>');
        }
      }

      // ---------- MODAL ----------
      const modal = document.getElementById('productModal');
      const modalContent = document.getElementById('modalContent');
      const closeModal = document.getElementById('closeModal');
      window.showModal = function(product) {
        modalContent.innerHTML = `
          <div class="flex flex-col md:flex-row gap-6">
            <img src="${product.image}" class="w-full md:w-1/2 object-contain max-h-64" alt="${product.title}">
            <div>
              <h3 class="text-2xl font-bold">${product.title}</h3>
              <p class="text-gray-600 mt-2">${product.description}</p>
              <div class="flex items-center mt-4"><span class="text-3xl font-bold text-indigo-700">$${product.price}</span><span class="ml-4 text-gray-600"><i class="fa-regular fa-star text-amber-400"></i> ${product.rating.rate} /5 (${product.rating.count})</span></div>
              <button id="modalAddToCart" class="mt-6 bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-xl w-full text-lg"><i class="fa-solid fa-cart-shopping mr-2"></i>Add to Cart</button>
            </div>
          </div>
        `;
        modal.classList.remove('hidden');
        document.getElementById('modalAddToCart').addEventListener('click', () => { addToCart(product); modal.classList.add('hidden'); });
      };
      closeModal.addEventListener('click', () => modal.classList.add('hidden'));
      window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

      // initial cart UI
      updateCartUI();

      // close cart sidebar if click on overlay
      document.getElementById('overlay').addEventListener('click', toggleCartSidebar);
    })();


    //  extra safety for cart persistence 
  
    window.addEventListener('storage', (e) => {
      if (e.key === 'swiftcart_cart') {
        cart = JSON.parse(e.newValue) || [];
        updateCartUI();
        if (document.getElementById('cartSidebar').classList.contains('open')) renderCartSidebar();
      }
    });

  