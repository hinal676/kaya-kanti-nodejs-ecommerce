// ============================================================================
// KAYA KANTI - CELEBRATING INDIAN BEAUTY - Pure Node.js
// ============================================================================
// Imports
// ============================================================================
const fs = require("fs");
const http = require("http");
const url = require("url");
const path = require("path");

// routing determines how the server responds to a client's request based
// on the URL path and HTTP method (GET, POST, PUT, DELETE, etc)

// ============================================================================
// CONFIGURATION
// ============================================================================
const PORT = 8000;
const HOSTNAME = "127.0.0.1";

// ============================================================================
// READ FILES
// ============================================================================
const productsData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/products.json`, "utf-8"),
);

const templateHome = fs.readFileSync(
  `${__dirname}/templates/template-home.html`,
  "utf-8",
);

const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8",
);

const templateProducts = fs.readFileSync(
  `${__dirname}/templates/template-products.html`,
  "utf-8",
);

const templateProductDetail = fs.readFileSync(
  `${__dirname}/templates/template-product-detail.html`,
  "utf-8",
);

const templateCart = fs.readFileSync(
  `${__dirname}/templates/template-cart.html`,
  "utf-8",
);

const templateCheckout = fs.readFileSync(
  `${__dirname}/templates/template-checkout.html`,
  "utf-8",
);

const templateContact = fs.readFileSync(
  `${__dirname}/templates/template-contact.html`,
  "utf-8",
);

// ============================================================================
// TEMPLATE REPLACEMENT FUNCTION
// ============================================================================
const replaceTemplate = (template, product) => {
  // Build ingredients tags
  const ingredientsArray = product.ingredients.split(", ");
  const ingredientsTags = ingredientsArray
    .map((ing) => `<span class="ingredient-tag">${ing}</span>`)
    .join("");

  // Build benefits tags
  const benefitsArray = product.benefits.split(" • ");
  const benefitsTags = benefitsArray
    .map((benefit) => `<span class="benefit-tag">${benefit}</span>`)
    .join("");

  // Replace all placeholders
  let output = template
    .replace(/{%ID%}/g, product.id)
    .replace(/{%PRODUCTNAME%}/g, product.productName)
    .replace(/{%CATEGORY%}/g, product.category)
    .replace(/{%IMAGE%}/g, product.image)
    .replace(/{%PRICE%}/g, product.price)
    .replace(/{%RATING%}/g, product.rating)
    .replace(/{%SHORT_DESCRIPTION%}/g, product.shortDescription)
    .replace(/{%DESCRIPTION%}/g, product.description)
    .replace(/{%INGREDIENTS_TAGS%}/g, ingredientsTags)
    .replace(/{%BENEFITS_TAGS%}/g, benefitsTags)
    .replace(/{%QUANTITY%}/g, product.quantity)
    .replace(/{%INGREDIENTS%}/g, product.ingredients);

  return output;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get featured products (first 3 products)
 */
const getFeaturedProducts = () => {
  return productsData.slice(0, 6);
};

/**
 * Get related products (excluding the current product)
 */
const getRelatedProducts = (currentProductId) => {
  return productsData
    .filter(
      (product, index) =>
        index !== parseInt(currentProductId) && index < currentProductId + 4,
    )
    .slice(0, 3);
};

/**
 * Get all products as cards
 */
const getAllProductsHTML = () => {
  return productsData
    .map((product) => replaceTemplate(templateCard, product))
    .join("");
};

/**
 * Get featured products as cards
 */
const getFeaturedProductsHTML = () => {
  return getFeaturedProducts()
    .map((product) => replaceTemplate(templateCard, product))
    .join("");
};

/**
 * Get all Skin Care products as cards
 */
const getSkinCareProductsHTML = () => {
  return productsData
    .filter((p) => p.category === "Skin Care")
    .map((product) => replaceTemplate(templateCard, product))
    .join("");
};

/**
 * Get all Hair Care products as cards
 */
const getHairCareProductsHTML = () => {
  return productsData
    .filter((p) => p.category === "Hair Care")
    .map((product) => replaceTemplate(templateCard, product))
    .join("");
};

/**
 * Get first 6 Skin Care products for home page
 */
const getHomeSkinCareProductsHTML = () => {
  return productsData
    .filter((p) => p.category === "Skin Care")
    .slice(0, 6)
    .map((product) => replaceTemplate(templateCard, product))
    .join("");
};

/**
 * Get first 6 Hair Care products for home page
 */
const getHomeHairCareProductsHTML = () => {
  return productsData
    .filter((p) => p.category === "Hair Care")
    .slice(0, 6)
    .map((product) => replaceTemplate(templateCard, product))
    .join("");
};

/**
 * Get related products as cards
 */
const getRelatedProductsHTML = (currentProductId) => {
  return getRelatedProducts(currentProductId)
    .map((product) => replaceTemplate(templateCard, product))
    .join("");
};

/**
 * Serve static files (CSS, JS, images)
 */
const serveStaticFile = (filePath, res) => {
  const fullPath = path.join(__dirname, filePath);

  // Prevent directory traversal attacks
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  try {
    const file = fs.readFileSync(fullPath);
    const ext = path.extname(filePath);
    const mimeTypes = {
      ".css": "text/css",
      ".js": "text/javascript",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".eot": "application/vnd.ms-fontobject",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(file);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("File Not Found");
  }
};

/**
 * Send 404 error response
 */
const send404 = (res) => {
  const errorPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Page Not Found</title>
        <link rel="stylesheet" href="/public/styles.css">
    </head>
    <body>
        <header>
            <nav>
                <a href="/" class="logo">✨ Kaya Kanti</a>
                <ul class="nav-links">
                    <li><a href="/">Home</a></li>
                    <li><a href="/products">Products</a></li>
                    <li><a href="/cart">🛒 Cart</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
        </header>
        <main>
            <section class="hero">
                <div class="hero-content">
                    <h1>404 - Page Not Found</h1>
                    <p class="hero-subtitle">Sorry, the page you're looking for doesn't exist.</p>
                    <a href="/" class="cta-button">Go Back Home</a>
                </div>
            </section>
        </main>
        <footer>
            <div class="footer-bottom">
                <p>&copy; 2024 Kaya Kanti. Celebrating Indian Beauty. Made with 💚</p>
            </div>
        </footer>
    </body>
    </html>
  `;

  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(errorPage);
};

/**
 * Send 500 error response
 */
const send500 = (res, error) => {
  const errorPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>500 - Server Error</title>
        <link rel="stylesheet" href="/public/styles.css">
    </head>
    <body>
        <header>
            <nav>
                <a href="/" class="logo-link"><img src="/public/kaya-kanti-logo.png" alt="Kaya Kanti" class="logo" /></a>
                <ul class="nav-links">
                    <li><a href="/">Home</a></li>
                    <li><a href="/products">Products</a></li>
                    <li><a href="/cart">🛒 Cart</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
        </header>
        <main>
            <section class="hero">
                <div class="hero-content">
                    <h1>500 - Server Error</h1>
                    <p class="hero-subtitle">Something went wrong on our end.</p>
                    <a href="/" class="cta-button">Go Back Home</a>
                </div>
            </section>
        </main>
        <footer>
            <div class="footer-bottom">
                <p>&copy; 2024 Kaya Kanti. Celebrating Indian Beauty. Made with 💚</p>
            </div>
        </footer>
    </body>
    </html>
  `;

  res.writeHead(500, { "Content-Type": "text/html" });
  res.end(errorPage);
};

// ============================================================================
// SERVER
// ============================================================================
const server = http.createServer((req, res) => {
  try {
    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    console.log(
      `${req.method} ${pathname}${req.url.substring(pathname.length)}`,
    );

    // ========================================================================
    // STATIC FILES ROUTING
    // ========================================================================
    if (pathname.startsWith("/public/")) {
      serveStaticFile(pathname, res);
      return;
    }

    // ========================================================================
    // API ENDPOINTS
    // ========================================================================
    if (pathname === "/api/products") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(productsData));
      return;
    }

    // ========================================================================
    // HOME PAGE
    // ========================================================================
    if (pathname === "/" || pathname === "/home" || pathname === "/index") {
      let output = templateHome
        .replace("{%SKIN_CARE_PRODUCTS%}", getHomeSkinCareProductsHTML())
        .replace("{%HAIR_CARE_PRODUCTS%}", getHomeHairCareProductsHTML());

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(output);
      return;
    }

    // ========================================================================
    // PRODUCTS PAGE
    // ========================================================================
    if (pathname === "/products" || pathname === "/products.html") {
      const allProducts = getAllProductsHTML();
      let output = templateProducts.replace("{%ALL_PRODUCTS%}", allProducts);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(output);
      return;
    }

    // ========================================================================
    // PRODUCT DETAIL PAGE
    // ========================================================================
    if (pathname === "/product") {
      const productId = parseInt(query.id);

      if (
        isNaN(productId) ||
        productId < 0 ||
        productId >= productsData.length
      ) {
        send404(res);
        return;
      }

      const product = productsData[productId];
      const relatedProducts = getRelatedProductsHTML(productId);

      let output = replaceTemplate(templateProductDetail, product);
      output = output.replace("{%RELATED_PRODUCTS%}", relatedProducts);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(output);
      return;
    }

    // ========================================================================
    // CART PAGE
    // ========================================================================
    if (pathname === "/cart" || pathname === "/cart.html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(templateCart);
      return;
    }

    // ========================================================================
    // CHECKOUT PAGE
    // ========================================================================
    if (pathname === "/checkout" || pathname === "/checkout.html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(templateCheckout);
      return;
    }

    // ========================================================================
    // CONTACT US PAGE
    // ========================================================================
    if (pathname === "/contact" || pathname === "/contact.html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(templateContact);
      return;
    }

    // ========================================================================
    // 404 - PAGE NOT FOUND
    // ========================================================================
    send404(res);
  } catch (err) {
    console.error("Server Error:", err);
    send500(res, err);
  }
});

// ============================================================================
// START SERVER
// ============================================================================
server.listen(PORT, HOSTNAME, () => {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   ✨ Kaya Kanti - Celebrating Indian Beauty               ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log(
    `║   Server running at: http://${HOSTNAME}:${PORT}              ║`,
  );
  console.log("║                                                            ║");
  console.log("║   Available Routes:                                        ║");
  console.log("║   - Home:           http://localhost:8000/                 ║");
  console.log("║   - Products:       http://localhost:8000/products         ║");
  console.log("║   - Product Detail: http://localhost:8000/product?id=X     ║");
  console.log("║   - Cart:           http://localhost:8000/cart             ║");
  console.log("║   - Checkout:       http://localhost:8000/checkout         ║");
  console.log("║   - Contact:        http://localhost:8000/contact          ║");
  console.log("║   - API:            http://localhost:8000/api/products     ║");
  console.log("║                                                            ║");
  console.log("║   Press Ctrl+C to stop the server                          ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );
});

// ============================================================================
// ERROR HANDLING
// ============================================================================
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
