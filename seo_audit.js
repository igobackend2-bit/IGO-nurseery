const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, Header, Footer
} = require('/usr/local/lib/node_modules_global/lib/node_modules/docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const RED = "C0392B";
const ORANGE = "E67E22";
const GREEN = "27AE60";
const DARK = "1A1A2E";
const ACCENT = "16213E";
const LIGHT_RED = "FDECEA";
const LIGHT_ORANGE = "FEF5E7";
const LIGHT_GREEN = "EAFAF1";
const GRAY_BG = "F2F3F4";

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: DARK })],
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "2471A3", space: 4 } }
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: ACCENT })],
    spacing: { before: 280, after: 120 }
  });
}

function para(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22, color: "333333", ...options })],
    spacing: { before: 60, after: 60 }
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold, color: "333333" })],
    spacing: { before: 40, after: 40 }
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: DARK }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: ACCENT }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, font: "Arial", color: "333333" }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } }
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ children: [new TextRun({ text: "IGO Nursery — SEO Audit Report 2026", font: "Arial", size: 18, color: "888888" })], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2471A3", space: 2 } } })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ children: [new TextRun({ text: "Confidential | igonursery.com  |  Page ", font: "Arial", size: 18, color: "888888" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "888888" })], alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 2 } } })] })
    },
    children: [
      // COVER
      new Paragraph({ children: [new TextRun({ text: "" })], spacing: { before: 480 } }),
      new Paragraph({ children: [new TextRun({ text: "IGO NURSERY", bold: true, font: "Arial", size: 64, color: "1A1A2E" })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: "SEO AUDIT REPORT", bold: true, font: "Arial", size: 40, color: "2471A3" })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: "www.igonursery.com", font: "Arial", size: 26, color: "666666" })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: "Prepared: May 2026  |  Live Website Audit", font: "Arial", size: 22, color: "999999" })], alignment: AlignmentType.CENTER, spacing: { before: 160, after: 480 } }),

      // Score summary table
      new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [2340, 2340, 2340, 2340],
        rows: [new TableRow({ children: [
          new TableCell({ borders, shading: { fill: "FEF5E7", type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "42/100", bold: true, font: "Arial", size: 48, color: ORANGE })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Overall Score", font: "Arial", size: 20, color: "666666" })] })] }),
          new TableCell({ borders, shading: { fill: LIGHT_RED, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8", bold: true, font: "Arial", size: 48, color: RED })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Critical Issues", font: "Arial", size: 20, color: "666666" })] })] }),
          new TableCell({ borders, shading: { fill: LIGHT_ORANGE, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "6", bold: true, font: "Arial", size: 48, color: ORANGE })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "High Issues", font: "Arial", size: 20, color: "666666" })] })] }),
          new TableCell({ borders, shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4", bold: true, font: "Arial", size: 48, color: GREEN })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Wins Found", font: "Arial", size: 20, color: "666666" })] })] })
        ]})]
      }),

      new Paragraph({ children: [new TextRun({ text: "" })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // 1. EXECUTIVE SUMMARY
      heading1("1. Executive Summary"),
      para("IGO Nursery (www.igonursery.com) is a well-branded AgriTech nursery and plant e-commerce website based in Chennai, India. While the site has strong visual design and brand positioning, it has significant SEO gaps that are severely limiting its organic search visibility."),
      para(""),
      para("This audit was conducted by live-crawling all main pages, analysing page source, JavaScript rendering, heading structure, schema markup, internal linking, canonical configuration, and on-page elements. The site scored 42/100 overall, with 8 critical issues that must be fixed immediately to avoid continued indexing failures."),
      para(""),
      para("The three most damaging issues are:", { bold: true }),
      bullet("Every page on the site has an identical title tag and meta description — Google treats them all as the same page."),
      bullet("All pages have a canonical URL pointing to the homepage — Google is instructed to ignore all inner pages."),
      bullet("The homepage has only 2 real anchor links — Google's crawler cannot discover any inner pages."),
      para(""),
      para("With focused remediation, this site has strong potential to rank in the top 5 in India for keywords like 'buy plants online India', 'nursery plants Chennai', 'indoor plants online', and hundreds of long-tail plant product searches."),

      new Paragraph({ children: [new PageBreak()] }),

      // 2. STRENGTHS
      heading1("2. What Is Already Working (Strengths)"),
      bullet("Robots.txt is correctly configured — /admin, /api and /private are blocked; sitemap is declared."),
      bullet("Homepage has exactly one H1 tag — correct heading structure start."),
      bullet("Open Graph (OG) meta tags are present — Facebook/WhatsApp sharing cards will work."),
      bullet("Twitter Card meta tags are configured — Twitter preview enabled."),
      bullet("LocalBusiness JSON-LD schema is present — helps Google Maps and local pack visibility."),
      bullet("Meta robots is set to 'index, follow, max-image-preview:large' — correct for e-commerce."),
      bullet("HTTPS is active on all pages — secure connection confirmed."),
      bullet("og:locale is set to en_IN — correctly targets Indian audiences."),

      new Paragraph({ children: [new PageBreak()] }),

      // 3. CRITICAL ISSUES
      heading1("3. Critical Issues — Fix Immediately"),

      heading2("Issue #1 — ALL Pages Have Identical Title Tags"),
      new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 8160], rows: [new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_RED, type: ShadingType.CLEAR }, width: { size: 1200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CRITICAL", bold: true, font: "Arial", size: 20, color: RED })] })] }),
        new TableCell({ borders, width: { size: 8160, type: WidthType.DXA }, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: 'Every page (/lab, /store, /shop) uses: "Buy Plants Online | IGO Nursery — Premium Nursery Plants & AgriTech Greenery". Confirmed by live audit.', font: "Arial", size: 21, color: "444444" })] })] })
      ]})]}) ,
      para(""),
      para("Why it matters: Google uses the title tag as its primary signal to understand what a page is about. When all pages share the same title, Google cannot differentiate them and will likely only index the homepage — every inner page loses its ranking potential.", { italics: true }),
      para(""),
      para("Fix — Example unique titles:", { bold: true }),
      bullet("Homepage: Buy Plants Online India | IGO Nursery Chennai | Premium Plants Delivered"),
      bullet("/store: Shop 116+ Plants Online | Herbs, Indoor, Outdoor, Cacti | IGO Nursery India"),
      bullet("/lab: IGO AgriLab | Precision Plant Science & Soil R&D | Muttukadu Chennai"),
      bullet("Product page: Buy Monstera Plant Online India | Rs.899 | Free Delivery | IGO Nursery"),

      para(""),
      heading2("Issue #2 — Wrong Canonical URL on All Inner Pages"),
      new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 8160], rows: [new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_RED, type: ShadingType.CLEAR }, width: { size: 1200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CRITICAL", bold: true, font: "Arial", size: 20, color: RED })] })] }),
        new TableCell({ borders, width: { size: 8160, type: WidthType.DXA }, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: 'Confirmed: /store and /lab both have canonical = "https://www.igonursery.com/" (homepage). This tells Google to ignore all inner pages.', font: "Arial", size: 21, color: "444444" })] })] })
      ]})]}) ,
      para(""),
      para("Why it matters: A canonical tag tells Google this page is a duplicate and the real version is elsewhere. Because all your pages point canonical to the homepage, you are literally instructing Google to skip your /store, /lab, and all product pages.", { italics: true }),
      para(""),
      para("Fix: Set canonical dynamically to the current page URL in your React Head/Next.js Head component. Never hardcode the homepage URL as canonical in a shared layout.", { bold: true }),
      bullet("/store canonical must be: https://www.igonursery.com/store"),
      bullet("/lab canonical must be: https://www.igonursery.com/lab"),
      bullet("Product pages: https://www.igonursery.com/product/[slug]"),

      para(""),
      heading2("Issue #3 — Only 2 Real Anchor Links on the Entire Homepage"),
      new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 8160], rows: [new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_RED, type: ShadingType.CLEAR }, width: { size: 1200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CRITICAL", bold: true, font: "Arial", size: 20, color: RED })] })] }),
        new TableCell({ borders, width: { size: 8160, type: WidthType.DXA }, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Confirmed: Only 2 <a href> links exist on the homepage — both external. All internal navigation uses JavaScript routing without real anchor tags.", font: "Arial", size: 21, color: "444444" })] })] })
      ]})]}) ,
      para(""),
      para("Why it matters: Google's crawler follows <a href> links to discover your pages. JavaScript onClick buttons are invisible to Googlebot. Your entire /store with 116 products is undiscoverable from the homepage.", { italics: true }),
      para(""),
      para("Fix: Replace all navigation buttons with real <a href> elements:", { bold: true }),
      bullet("<a href='/store'>Shop Plants</a>  instead of a JavaScript button"),
      bullet("<a href='/lab'>Enter the Lab</a>  instead of an onClick div"),
      bullet("All navigation menu items must use real anchor tags"),
      bullet("Footer links must also use <a href> not JavaScript"),

      para(""),
      heading2("Issue #4 — JavaScript-Rendered SPA (No Server-Side HTML)"),
      new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 8160], rows: [new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_RED, type: ShadingType.CLEAR }, width: { size: 1200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CRITICAL", bold: true, font: "Arial", size: 20, color: RED })] })] }),
        new TableCell({ borders, width: { size: 8160, type: WidthType.DXA }, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "When fetching raw HTML, the page body returns empty — only meta tags are visible. All page content is rendered via JavaScript (React SPA mode).", font: "Arial", size: 21, color: "444444" })] })] })
      ]})]}) ,
      para(""),
      para("Why it matters: Google can render JavaScript but uses a second-wave crawl that may be delayed by days or weeks. Content not in the initial HTML is deprioritised. Your product listings on /store are at high risk of never being indexed.", { italics: true }),
      para(""),
      para("Fix: Enable Next.js Server-Side Rendering (SSR) or Static Site Generation (SSG):", { bold: true }),
      bullet("Use getServerSideProps() or getStaticProps() on product pages"),
      bullet("Ensure page content is in the HTML response before JavaScript executes"),
      bullet("At minimum, implement dynamic rendering to serve pre-rendered HTML to Googlebot"),

      para(""),
      heading2("Issue #5 — No Individual Product Pages or URLs"),
      new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 8160], rows: [new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_RED, type: ShadingType.CLEAR }, width: { size: 1200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CRITICAL", bold: true, font: "Arial", size: 20, color: RED })] })] }),
        new TableCell({ borders, width: { size: 8160, type: WidthType.DXA }, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "All 116 products live on a single /store URL. No individual product URLs, no per-product titles, no unique content.", font: "Arial", size: 21, color: "444444" })] })] })
      ]})]}) ,
      para(""),
      para("Why it matters: This is the single biggest missed opportunity. People search for specific plants — 'buy monstera plant online India', 'snake plant price Chennai'. Each product needs its own URL and page to rank for these searches. You are missing 100+ potential ranking pages.", { italics: true }),
      para(""),
      para("Fix — Create individual product pages:", { bold: true }),
      bullet("URL structure: /product/monstera-plant, /product/snake-plant, /product/areca-palm"),
      bullet("Each page needs: unique title, meta description, H1, care guide, and Product schema"),
      bullet("Category pages: /plants/indoor, /plants/outdoor, /plants/herbs, /plants/cacti"),

      para(""),
      heading2("Issue #6 — No Product Schema Markup"),
      new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 8160], rows: [new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_RED, type: ShadingType.CLEAR }, width: { size: 1200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CRITICAL", bold: true, font: "Arial", size: 20, color: RED })] })] }),
        new TableCell({ borders, width: { size: 8160, type: WidthType.DXA }, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Only LocalBusiness schema exists. No Product schema, no BreadcrumbList, no Review, no FAQ, no ItemList.", font: "Arial", size: 21, color: "444444" })] })] })
      ]})]}) ,
      para(""),
      para("Fix: Add JSON-LD Product schema on each product page with name, price (INR), availability, and aggregateRating. This enables rich snippets — price and star ratings appear directly in Google search results.", { bold: true }),

      para(""),
      heading2("Issue #7 — No H1 Tag on the /store Page"),
      new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 8160], rows: [new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_RED, type: ShadingType.CLEAR }, width: { size: 1200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CRITICAL", bold: true, font: "Arial", size: 20, color: RED })] })] }),
        new TableCell({ borders, width: { size: 8160, type: WidthType.DXA }, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Confirmed: The /store page — your most commercially important page — has NO H1 tag at all. Zero keyword signal for this page.", font: "Arial", size: 21, color: "444444" })] })] })
      ]})]}) ,
      para(""),
      para("Fix: Add H1 to the store page: 'Buy Plants Online India — 116+ Premium Nursery Plants | IGO Nursery'", { bold: true }),

      para(""),
      heading2("Issue #8 — All Pages Share the Same Meta Description"),
      new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 8160], rows: [new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_RED, type: ShadingType.CLEAR }, width: { size: 1200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CRITICAL", bold: true, font: "Arial", size: 20, color: RED })] })] }),
        new TableCell({ borders, width: { size: 8160, type: WidthType.DXA }, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: 'All pages share: "Discover premium nursery plants, saplings & precision AgriTech greenery at IGO Nursery. Shop indoor, outdoor & agricultural plants. Order online today!" (151 chars)', font: "Arial", size: 21, color: "444444" })] })] })
      ]})]}) ,
      para(""),
      para("Fix: Write a unique meta description (150-160 chars) for every page:", { bold: true }),
      bullet("/store: 'Shop 116+ premium nursery plants online in India. Indoor, outdoor, herbs, cacti & fruit plants. Polyhouse-grown with 99% health guarantee. Free pan-India delivery.'"),
      bullet("/lab: 'Visit IGO AgriLab — precision plant science division. IoT soil monitoring, climate acclimatisation, pathogen detection. Request a site audit for your landscape project.'"),

      new Paragraph({ children: [new PageBreak()] }),

      // 4. HIGH PRIORITY
      heading1("4. High Priority Issues — Fix Within 30 Days"),

      heading2("Issue #9 — No Blog or Content Marketing Section"),
      para("The site has zero informational content. This means you are missing massive organic traffic from people researching plants before buying."),
      para(""),
      para("High-value blog topics to create:", { bold: true }),
      bullet("'Best Indoor Plants for Chennai Apartments (2026 Guide)' — targets 'indoor plants Chennai'"),
      bullet("'How to Care for Monstera in Indian Humidity' — targets 'monstera care India'"),
      bullet("'Top 10 Low-Maintenance Outdoor Plants for Indian Gardens'"),
      bullet("'Benefits of Snake Plants for Air Purification — IGO Lab Study'"),
      bullet("'Complete Guide to Starting a Kitchen Garden at Home in India'"),

      para(""),
      heading2("Issue #10 — All Product Descriptions Are Template-Based"),
      para("All 116 products use the same template: '[NAME] - Premium quality nursery plant, acclimatized for [category] growth and durability.' This is thin, duplicate content that Google penalises."),
      para(""),
      para("Fix: Write unique 200-300 word descriptions for each product including:", { bold: true }),
      bullet("Care instructions: watering frequency, sunlight needs, soil type"),
      bullet("Suitability for Indian climate zones"),
      bullet("IGO Lab acclimatisation details specific to that plant"),
      bullet("Start with highest-traffic products: Monstera, Snake Plant, Money Plant, Areca Palm, Aloe Vera"),

      para(""),
      heading2("Issue #11 — No Breadcrumb Navigation or Schema"),
      para("No breadcrumbs on any page. Breadcrumbs help Google understand site structure and display navigation paths in search results (Home > Plants > Indoor > Monstera)."),
      para("Fix: Add visible breadcrumb nav on all inner pages + BreadcrumbList JSON-LD schema.", { bold: true }),

      para(""),
      heading2("Issue #12 — /shop Redirects to /store (URL Inconsistency)"),
      para("Visiting /shop redirects to /store. This creates an unnecessary redirect chain and splits link equity. Fix: Use one canonical URL (/store) and add a 301 permanent redirect from /shop to /store."),

      para(""),
      heading2("Issue #13 — Sitemap.xml May Have Encoding Issues"),
      para("The sitemap is declared in robots.txt (correct) but returned binary-encoded data instead of readable XML. Fix: Verify sitemap is plain-text XML, include all pages, and submit to Google Search Console.", { bold: true }),

      para(""),
      heading2("Issue #14 — No FAQ Schema (Missed Rich Snippet Opportunity)"),
      para("No FAQ sections exist anywhere. FAQ schema lets your answers appear directly in Google results, increasing click-through rates."),
      para(""),
      para("High-value FAQs to add:", { bold: true }),
      bullet("'Do you deliver plants across India?' — Yes, pan-India delivery with zero-damage packaging."),
      bullet("'What is your health guarantee?' — 99.2% health guarantee backed by IGO Lab certification."),
      bullet("'How long does delivery take?' — 3-7 business days depending on location."),
      bullet("'Can I return a damaged plant?' — Yes, 15-day free returns, no questions asked."),

      para(""),
      heading2("Issue #15 — No hreflang Tags"),
      para("No hreflang tags are present. For future-proofing multilingual content (Tamil, Hindi), add at minimum: <link rel='alternate' hreflang='en-IN' href='https://www.igonursery.com/'>."),

      new Paragraph({ children: [new PageBreak()] }),

      // 5. QUICK WINS
      heading1("5. Quick Wins — Fix Within 7 Days"),
      heading2("Issue #16 — 2 Images Missing Alt Text"),
      para("2 of 43 homepage images have no alt text. Fix: Add descriptive alt text to all images across all pages. Example: alt='Monstera Deliciosa indoor plant in terracotta pot — IGO Nursery Chennai'"),

      para(""),
      heading2("Issue #17 — OG Image Uses Logo Instead of Plant Photo"),
      para("The Open Graph image (shown on WhatsApp/Facebook/LinkedIn shares) is the IGO logo. Fix: Replace with a high-quality 1200x630px photo of your best plants. This significantly improves social sharing click-through rates."),

      para(""),
      heading2("Issue #18 — Heading Hierarchy Skips H3 (H2 to H4 Jump)"),
      para("Homepage heading order jumps from H2 (portfolio section) to H4 (project cards), skipping H3. Fix: Change project card headings (ECR Ocean Villa, The Palms Resort, etc.) from H4 to H3."),

      para(""),
      heading2("Issue #19 — H1 Contains Line Breaks and All-Caps Text"),
      para("Current H1 has embedded line breaks and all-caps text which reduces keyword clarity for Google. Fix: Clean H1 to: 'Premium Nursery Plants & AgriTech Greenery — IGO Nursery India'. Apply visual effects via CSS only."),

      para(""),
      heading2("Issue #20 — No WebSite or WebPage Schema"),
      para("No WebSite schema (which enables Google Sitelinks search box) and no WebPage schema on inner pages. Fix: Add WebSite schema with SearchAction to homepage, and WebPage schema to all main pages."),

      new Paragraph({ children: [new PageBreak()] }),

      // 6. PRIORITY TABLE
      heading1("6. Priority Action Plan"),
      para(""),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [960, 3100, 2300, 3000],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 960, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Priority", bold: true, font: "Arial", size: 19, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 3100, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Issue", bold: true, font: "Arial", size: 19, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 2300, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "SEO Impact", bold: true, font: "Arial", size: 19, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 3000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Action Required", bold: true, font: "Arial", size: 19, color: "FFFFFF" })] })] }),
          ]}),
          ...([
            ["CRITICAL", "Duplicate title tags on all pages", "Pages not ranking individually", "Unique dynamic title per route", LIGHT_RED, RED],
            ["CRITICAL", "All canonicals point to homepage", "Inner pages will never rank", "Set canonical to current page URL", LIGHT_RED, RED],
            ["CRITICAL", "Only 2 anchor links site-wide", "Pages not crawlable by Google", "Replace JS buttons with <a href> links", LIGHT_RED, RED],
            ["CRITICAL", "SPA - no server-side HTML", "Content invisible to Google", "Enable Next.js SSR/SSG", LIGHT_RED, RED],
            ["CRITICAL", "No individual product pages", "100+ ranking pages missing", "Create /product/[slug] for 116 products", LIGHT_RED, RED],
            ["CRITICAL", "No Product JSON-LD schema", "No rich snippets in SERP", "Add Product schema to all product pages", LIGHT_RED, RED],
            ["CRITICAL", "No H1 on /store page", "No keyword signal on shop page", "Add H1: Buy Plants Online India | IGO", LIGHT_RED, RED],
            ["CRITICAL", "Duplicate meta descriptions", "Google rewrites or ignores them", "Write unique meta desc per page", LIGHT_RED, RED],
            ["HIGH", "No blog / content section", "Missing informational traffic", "Create 10+ plant care blog posts", LIGHT_ORANGE, ORANGE],
            ["HIGH", "Template product descriptions", "Thin/duplicate content penalty", "Unique 200-300 word desc per product", LIGHT_ORANGE, ORANGE],
            ["HIGH", "No breadcrumb nav/schema", "Missing navigational structure", "Add breadcrumbs + BreadcrumbList schema", LIGHT_ORANGE, ORANGE],
            ["HIGH", "/shop - /store URL conflict", "Split link equity", "301 redirect /shop to /store", LIGHT_ORANGE, ORANGE],
            ["HIGH", "Sitemap encoding issue", "Sitemap not crawled by Google", "Fix and resubmit via Search Console", LIGHT_ORANGE, ORANGE],
            ["HIGH", "No FAQ schema", "Missing People Also Ask rankings", "Add FAQPage schema to key pages", LIGHT_ORANGE, ORANGE],
            ["QUICK WIN", "2 images missing alt text", "Image SEO + accessibility loss", "Add descriptive alt text to all images", LIGHT_GREEN, GREEN],
            ["QUICK WIN", "OG image is the logo", "Poor social share previews", "Set OG image to 1200x630 plant photo", LIGHT_GREEN, GREEN],
            ["QUICK WIN", "H2 to H4 heading skip", "Broken semantic heading structure", "Change project card heads to H3", LIGHT_GREEN, GREEN],
            ["QUICK WIN", "No WebSite/WebPage schema", "No sitelinks search box possible", "Add WebSite schema with SearchAction", LIGHT_GREEN, GREEN],
          ].map(([p, issue, impact, action, bg, tc]) => new TableRow({ children: [
            new TableCell({ borders, shading: { fill: bg, type: ShadingType.CLEAR }, width: { size: 960, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: p, bold: true, font: "Arial", size: 17, color: tc })] })] }),
            new TableCell({ borders, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, width: { size: 3100, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: issue, font: "Arial", size: 19 })] })] }),
            new TableCell({ borders, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, width: { size: 2300, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: impact, font: "Arial", size: 19 })] })] }),
            new TableCell({ borders, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, width: { size: 3000, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: action, font: "Arial", size: 19 })] })] }),
          ]})))
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // 7. KEYWORD OPPORTUNITIES
      heading1("7. Keyword Opportunities You Are Missing"),
      para("These are high-value search terms your products and services should be ranking for but currently cannot, due to the technical issues identified above."),
      para(""),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3400, 1900, 1700, 2360],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 3400, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Keyword", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 1900, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Est. Monthly Searches", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 1700, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Intent", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 2360, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Target Page", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
          ]}),
          ...([
            ["buy plants online India", "40,000+", "Transactional", "/store"],
            ["indoor plants online", "22,000+", "Transactional", "/plants/indoor"],
            ["nursery plants Chennai", "8,000+", "Local", "Homepage"],
            ["buy monstera plant online", "5,500+", "Transactional", "/product/monstera"],
            ["snake plant online India", "4,800+", "Transactional", "/product/snake-plant"],
            ["areca palm online", "4,200+", "Transactional", "/product/areca-palm"],
            ["buy cactus online India", "3,900+", "Transactional", "/plants/cactus"],
            ["herbs plants online India", "3,400+", "Transactional", "/plants/herbs"],
            ["landscape services Chennai", "2,800+", "Commercial", "/landscape"],
            ["garden maintenance Chennai", "2,600+", "Commercial", "/amc"],
            ["air purifying plants India", "6,000+", "Informational", "Blog post"],
            ["best indoor plants Chennai", "3,100+", "Informational", "Blog post"],
            ["plant nursery near me", "180,000+", "Local", "Google Business Profile"],
          ].map(([kw, vol, intent, page]) => new TableRow({ children: [
            new TableCell({ borders, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, width: { size: 3400, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: kw, font: "Arial", size: 20 })] })] }),
            new TableCell({ borders, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, width: { size: 1900, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: vol, font: "Arial", size: 20, bold: true, color: "2471A3" })] })] }),
            new TableCell({ borders, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, width: { size: 1700, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: intent, font: "Arial", size: 20 })] })] }),
            new TableCell({ borders, shading: { fill: "FAFAFA", type: ShadingType.CLEAR }, width: { size: 2360, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: page, font: "Arial", size: 20, color: "2471A3" })] })] }),
          ]})))
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // 8. ROADMAP
      heading1("8. 90-Day SEO Remediation Roadmap"),

      heading2("Week 1–2: Critical Technical Fixes"),
      bullet("Fix canonical URLs — set dynamically per page (never hardcode homepage URL)"),
      bullet("Fix title tags — unique title for every page and route"),
      bullet("Fix meta descriptions — unique per page"),
      bullet("Replace all JavaScript navigation buttons with real <a href> anchor links"),
      bullet("Add H1 to the /store page"),
      bullet("Fix heading hierarchy — change project card H4s to H3"),
      bullet("Verify sitemap.xml, fix encoding, resubmit in Google Search Console"),

      para(""),
      heading2("Week 3–4: Product Pages & Schema"),
      bullet("Create /product/[slug] pages for all 116 products"),
      bullet("Add unique H1, title, meta description, and care content to each product page"),
      bullet("Implement Product JSON-LD schema on all product pages"),
      bullet("Add BreadcrumbList schema site-wide"),
      bullet("Add FAQPage schema to homepage and high-traffic product pages"),
      bullet("Add WebSite schema with SearchAction to homepage"),
      bullet("Enable Next.js SSR/SSG on all key pages"),

      para(""),
      heading2("Month 2: Content & Internal Linking"),
      bullet("Write unique 200-300 word descriptions for top 20 priority products"),
      bullet("Create category landing pages: /plants/indoor, /plants/outdoor, /plants/herbs, /plants/cacti"),
      bullet("Launch blog section with first 5 posts targeting informational keywords"),
      bullet("Build internal linking between blog posts and product pages"),
      bullet("Add breadcrumb navigation visually to all pages"),
      bullet("Replace OG image with a compelling 1200x630 hero plant photo"),

      para(""),
      heading2("Month 3: Scale & Monitor"),
      bullet("Complete unique product descriptions for all 116 items"),
      bullet("Publish 10 additional blog posts targeting long-tail keywords"),
      bullet("Monitor Google Search Console: Coverage, Impressions, Core Web Vitals"),
      bullet("Optimise Google Business Profile for local 'plant nursery near me' searches"),
      bullet("Build backlinks from gardening blogs, Chennai local directories, agri publications"),
      bullet("Target LCP (Largest Contentful Paint) under 2.5 seconds via Core Web Vitals report"),

      new Paragraph({ children: [new PageBreak()] }),

      // 9. SCORECARD
      heading1("9. SEO Category Score Card"),
      para(""),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3300, 1500, 1500, 3060],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 3300, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "SEO Category", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Current", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Target", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: "1A1A2E", type: ShadingType.CLEAR }, width: { size: 3060, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Key Gap", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
          ]}),
          ...([
            ["Technical SEO (canonical, crawlability, sitemap)", "20/100", "85/100", "Fix canonical + anchor links + SSR", LIGHT_RED],
            ["On-Page SEO (titles, H tags, meta descriptions)", "35/100", "90/100", "Unique titles & descriptions per page", LIGHT_RED],
            ["Content & Keyword Targeting", "30/100", "80/100", "Product descriptions + blog content", LIGHT_ORANGE],
            ["Schema / Structured Data", "25/100", "85/100", "Product, FAQ, Breadcrumb schemas", LIGHT_RED],
            ["Internal Linking", "10/100", "80/100", "Real <a href> links throughout site", LIGHT_RED],
            ["Local SEO", "55/100", "85/100", "LocalBusiness schema good — expand GMB", LIGHT_ORANGE],
            ["Social / OG Tags", "70/100", "90/100", "Replace OG image with plant photo", LIGHT_GREEN],
            ["Page Speed & Core Web Vitals", "65/100", "85/100", "Monitor after SSR implementation", LIGHT_ORANGE],
          ].map(([cat, curr, target, gap, bg]) => new TableRow({ children: [
            new TableCell({ borders, shading: { fill: bg, type: ShadingType.CLEAR }, width: { size: 3300, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: cat, font: "Arial", size: 19 })] })] }),
            new TableCell({ borders, shading: { fill: bg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: curr, font: "Arial", size: 19, bold: true, color: RED })] })] }),
            new TableCell({ borders, shading: { fill: bg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: target, font: "Arial", size: 19, bold: true, color: GREEN })] })] }),
            new TableCell({ borders, shading: { fill: bg, type: ShadingType.CLEAR }, width: { size: 3060, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: gap, font: "Arial", size: 19 })] })] }),
          ]})))
        ]
      }),

      para(""),
      para(""),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "— End of SEO Audit Report | IGO Nursery | igonursery.com | May 2026 —", font: "Arial", size: 20, color: "999999", italics: true })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/sessions/vigilant-kind-carson/mnt/Igo-Nursery/IGO_Nursery_SEO_Audit_2026.docx', buffer);
  console.log('SUCCESS: SEO Audit report saved.');
}).catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
