export const run: ActionRun = async ({ params, logger, api, connections }) => {
  const shopId = params.shopId;
  
  if (!shopId) {
    throw new Error("shopId parameter is required");
  }

  logger.info({ shopId }, "Installing web pixel for shop");

  // Get the shop record to verify it exists
  const shop = await api.shopifyShop.findOne(shopId);
  if (!shop) {
    throw new Error(`Shop with ID ${shopId} not found`);
  }

  // Web pixel script content
  const pixelScript = `
(function() {
  // Utility functions
  function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  function setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + "=" + value + "; expires=" + expires + "; path=/; SameSite=Lax";
  }

  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // Initialize tracking
  let clickId = getCookie('ipick_click_id') || getQueryParam('ipick_click_id');
  if (clickId && !getCookie('ipick_click_id')) {
    setCookie('ipick_click_id', clickId);
  }

  let sessionId = getCookie('ipick_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    setCookie('ipick_session_id', sessionId);
  }

  // Event tracking function
  function trackEvent(eventType, eventData = {}) {
    const payload = {
      event_type: eventType,
      session_id: sessionId,
      click_id: clickId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      shop_id: '${shopId}',
      ...eventData
    };

    // Send to collector endpoint
    fetch('/collector', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).catch(function(error) {
      console.warn('iPick tracking error:', error);
    });
  }

  // Track page view
  trackEvent('page_view', {
    page_title: document.title,
    page_path: window.location.pathname
  });

  // Track product views
  if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta && window.ShopifyAnalytics.meta.product) {
    const product = window.ShopifyAnalytics.meta.product;
    trackEvent('product_view', {
      product_id: product.id,
      product_title: product.title,
      product_type: product.type,
      product_vendor: product.vendor,
      product_price: product.price
    });
  }

  // Track checkout events
  if (window.Shopify && window.Shopify.checkout) {
    const checkout = window.Shopify.checkout;
    trackEvent('checkout_view', {
      checkout_id: checkout.token,
      total_price: checkout.total_price,
      currency: checkout.currency,
      line_items: checkout.line_items
    });
  }

  // Track cart events via cart drawer/page detection
  function trackCartView() {
    if (window.location.pathname.includes('/cart') || document.querySelector('[data-cart-drawer]')) {
      fetch('/cart.js')
        .then(function(response) { return response.json(); })
        .then(function(cart) {
          trackEvent('cart_view', {
            item_count: cart.item_count,
            total_price: cart.total_price,
            currency: window.Shopify && window.Shopify.currency && window.Shopify.currency.active,
            items: cart.items.map(function(item) {
              return {
                id: item.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price
              };
            })
          });
        })
        .catch(function(error) {
          console.warn('Cart tracking error:', error);
        });
    }
  }

  // Initial cart check
  trackCartView();

  // Listen for cart updates
  document.addEventListener('DOMContentLoaded', function() {
    trackCartView();
  });

  // Listen for navigation changes (for SPAs)
  let currentPath = window.location.pathname;
  setInterval(function() {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      trackEvent('page_view', {
        page_title: document.title,
        page_path: currentPath
      });
    }
  }, 1000);
})();
`;

  // GraphQL mutation to create web pixel
  const mutation = `
    mutation webPixelCreate($webPixel: WebPixelInput!) {
      webPixelCreate(webPixel: $webPixel) {
        webPixel {
          id
          settings
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    webPixel: {
      settings: {
        accountID: shopId
      }
    }
  };

  try {
    // Use the writeToShopify action for rate limit awareness
    const result = await api.enqueue(api.writeToShopify, {
      shopId,
      mutation,
      variables
    });

    logger.info({ shopId, result }, "Web pixel installation initiated");

    // Update shop record to mark pixel as installed
    await api.shopifyShop.update(shopId, {
      // Store the pixel installation status in a custom field or alerts
      alerts: {
        ...shop.alerts,
        webPixelInstalled: true,
        webPixelInstalledAt: new Date().toISOString()
      }
    });

    return {
      success: true,
      message: "Web pixel installation initiated successfully",
      shopId
    };

  } catch (error) {
    logger.error({ shopId, error: error.message }, "Failed to install web pixel");
    
    // Update shop record to mark pixel installation as failed
    await api.shopifyShop.update(shopId, {
      alerts: {
        ...shop.alerts,
        webPixelInstallationFailed: true,
        webPixelInstallationError: error.message,
        webPixelLastAttempt: new Date().toISOString()
      }
    });

    throw new Error(`Failed to install web pixel: ${error.message}`);
  }
};

export const params = {
  shopId: { type: "string" }
};
