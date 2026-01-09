import * as cheerio from "cheerio";

export const scrapeUrl = async (url: string): Promise<string> => {
  try {
    // 1. Fetch HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // 2. Parse with Cheerio
    const $ = cheerio.load(html);

    // 3. Remove clutter
    $("script").remove();
    $("style").remove();
    $("nav").remove();
    $("footer").remove();
    $("iframe").remove();
    $(".ad").remove();
    $(".advertisement").remove();

    // 4. Extract Main Content
    // Try to find common main content containers or fallback to body
    const mainContent =
      $("article").text() ||
      $("main").text() ||
      $("#content").text() ||
      $(".content").text() ||
      $("body").text();

    const title = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content") || "";

    // 5. Clean text (normalize whitespace)
    const cleanText = mainContent.replace(/\s+/g, " ").trim();

    return `
      Title: ${title}
      Description: ${metaDescription}
      Content: ${cleanText}
    `.trim();
  } catch (error) {
    console.error("Scraping failed:", error);
    // Fallback: If scraping fails, at least return the URL so AI knows what to look for (maybe it knows the domain)
    // or throw error to trigger 'Error' state.
    // Let's decide to throw, so we can retry or manual fix.
    throw error;
  }
};
