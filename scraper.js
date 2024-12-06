const axios = require('axios');
const cheerio = require('cheerio');
const ejs = require('ejs');
const express = require('express');
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

async function getRichListData() {
    try {
        const response = await axios.get('https://www.coincarp.com/currencies/solana/richlist/');
        const html = response.data;
        const $ = cheerio.load(html);

        // Initialize array to store rich list data
        const richList = [];

        // Find the table and iterate through rows
        $('table tr').each((index, element) => {
            // Skip header row
            if (index === 0) return;

            const columns = $(element).find('td');
            if (columns.length > 0) {
                richList.push({
                    rank: $(columns[0]).text().trim(),
                    address: $(columns[1]).text().trim(),
                    quantity: $(columns[2]).text().trim(),
                    percentage: $(columns[3]).text().trim()
                });
            }
        });

        // Get summary statistics
        const stats = [];
        $('div:contains("Solana Holders Statistics")').next().find('li').each((_, element) => {
            stats.push($(element).text().trim());
        });

        return {
            richList: richList,
            stats: stats,
            timestamp: new Date().toLocaleString()
        };
    } catch (error) {
        console.error('Error scraping data:', error.message);
        throw error;
    }
}

// Add route to serve the rich list
app.get('/', async (req, res) => {
    try {
        const data = await getRichListData();
        res.render('richlist', data);
    } catch (error) {
        res.status(500).send('Error fetching rich list data');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 