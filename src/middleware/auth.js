const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Pata token kutoka header
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({
            error: 'Hakuna token. Tafadhali ingia'
        });
    }

    try {
        // Ondoa "Bearer " kama ipo
        const cleanToken = token.replace('Bearer ', '');
        
        // Thibitisha token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // Weka mtumiaji kwenye request
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({
            error: 'Token si sahihi au imeisha muda'
        });
    }
};