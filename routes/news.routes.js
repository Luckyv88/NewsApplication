// routes/news.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Official NewsAPI categories (used for validation)
const NEWS_API_CATEGORIES = [
    'business', 'entertainment', 'general', 
    'health', 'science', 'sports', 'technology'
];

// 🌟 CRITICAL FIX: MAP YOUR CUSTOM NAVBAR NAMES TO OFFICIAL NEWSAPI CATEGORIES 🌟
const CATEGORY_MAP = {
    'movies': 'entertainment',
    'cricket': 'sports', // Fixes the Cricket issue
    'india': 'general', // Maps 'India' to general world headlines
    'lifestyle': 'entertainment', 
    'viral': 'general', 
    'world': 'general',
    'videos': 'entertainment',
    'business': 'business',
    'education': 'science',
    'webstories': 'technology',
    'Home': 'general', // Ensure 'Latest' also maps correctly
};

// Base URL of NewsAPI
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/top-headlines';

// Controller function to fetch news
const getNews = async (req, res) => {
    // 1. API Key Check
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        console.error('SERVER ERROR: Missing NEWS_API_KEY in environment variables.');
        return res.status(500).json({ status: 'error', message: 'Configuration error: Missing API key.', articles: [] });
    }

    // 2. Determine Request Parameters
    const city = req.query.city;
    
    // Get the category from the query, default to 'general'
    let requestedCategory = req.query.category?.toLowerCase() || 'general';

    // Remove hyphens if any (e.g., 'web-stories' -> 'webstories')
    requestedCategory = requestedCategory.replace(/-/g, ''); 
    
    // 🌟 Apply the mapping and ensure a valid category is used 🌟
    const finalCategory = CATEGORY_MAP[requestedCategory] || 
                          (NEWS_API_CATEGORIES.includes(requestedCategory) ? requestedCategory : 'general');
    
    // Base parameters (removed 'country')
    let params = { apiKey, pageSize: 40 }; 
    let apiUrl = NEWS_API_BASE_URL;

    if (city) {
        // 1. City Search (Keyword search takes priority)
        params.q = city; 
    } else {
        // 2. Category Search (Used the mapped/validated category)
        params.category = finalCategory; // 🌟 CORRECTED LINE 🌟
    }

    try {
        // 3. Initial API Request
        let response = await axios.get(apiUrl, { params });
        let articles = response.data.articles || [];

        // 4. Fallback Logic for City Search (falls back to the general category)
        if (articles.length === 0 && city) {
            console.log(`No results for city: ${city}. Falling back to general news.`);
            
            // Fallback params always use 'general' as the working category for global search
            const fallbackParams = { apiKey, pageSize: 40, category: 'general' };
            const fallback = await axios.get(apiUrl, { params: fallbackParams });
            articles = fallback.data.articles || [];
        }

        // 5. Success Response (even if articles is empty)
        let message = articles.length > 0 
            ? 'News data fetched successfully' 
            : 'No news found for the current selection.';

        res.json({ status: 'ok', message: message, articles });

    } catch (err) {
        // 6. Error Handling
        let errorMessage = 'An unknown error occurred while fetching news.';
        let statusCode = 500;

        if (err.response) {
            const apiError = err.response.data;
            errorMessage = apiError.message || err.message;
            statusCode = err.response.status;
            // Log the specific NewsAPI error for server-side debugging
            console.error(`NewsAPI Error (${apiError.code}): ${errorMessage}`);
        } else {
            errorMessage = err.message;
            console.error(`AXIOS/Network Error: ${errorMessage}`);
        }

        res.status(statusCode).json({ 
            status: 'error', 
            message: `Failed to fetch news. Check API Key or server logs. Detail: ${errorMessage}`, 
            articles: [] 
        });
    }
};


// GET /api/news?category=...&city=...
router.get('/', getNews);

module.exports = router;