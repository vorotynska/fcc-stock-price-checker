const Stock = require("../models");
const superagent = require("superagent");
const bcrypt = require("bcrypt");

const getStock = async (req, res) => {
    var {
        stock,
        like
    } = req.query;
    like = like === "true"; // req.query gives a string, which here is turned into bool.
    const ip = req.socket.remoteAddress;

    if (!Array.isArray(stock)) {
        stock = [stock];
    }

    var stockData = [];
    for (var s of stock) {
        s = s.toUpperCase(); // To keep it tidy in DB.
        sd = await stockPriceChecker(s);
        if (!sd || typeof sd.body === "string") {
            // stockPriceChecker returns object if it contains anything of value
            stockData.push({
                error: "external source error",
                likes: 0
            });
        } else {
            stockData.push({
                stock: s,
                price: sd.body.latestPrice
            });
        }
    }

    if (stock.length == 1) {
        if (!stockData[0].hasOwnProperty("error")) {
            var result = await buildStockLikes(
                stockData[0].stock,
                stockData[0].price,
                ip,
                like
            );
        } else {
            var result = stockData;
        }
    } else if (stock.length == 2) {
        // If more stock were to be added, then rel_likes would be broken and the app wouldn't work anyway.
        var result = [];
        for (var s of stockData) {
            if (!s.hasOwnProperty("error")) {
                // Repetition of code (see above). Could be improved.
                result.push(await buildStockLikes(s.stock, s.price, ip, like));
            } else {
                result.push(s);
            }
        }
        rel_likes = result[0].likes - result[1].likes;
        result[0]["rel_likes"] = rel_likes;
        result[1]["rel_likes"] = -rel_likes;
        for (var r of result) {
            delete r.likes;
        }
    } else {
        var result = "app broken";
    }
    return res.json({
        stockData: result
    });
};

const buildStockLikes = async (stock, price, ip, like) => {
    var likes = 0;
    var foundIP = false;
    const stockInDB = await Stock.findOne({
        stock: stock
    });

    if (!stockInDB && like) {
        // Stock doesn't exist in DB but was liked: add it and set likes to 1.
        await Stock.create({
            stock: stock,
            ip: [await hashIP(ip)]
        });
        likes = 1;
    } else if (stockInDB && like) {
        // Stock does exist and was liked.
        var ipLength = stockInDB.ip.length;
        for (i = 0; i < ipLength; i++) {
            if (bcrypt.compare(ip, stockInDB.ip[i])) {
                foundIP = true;
                break;
            }
        }
        likes = ipLength;
        if (!foundIP) {
            // If user's ip doesn't exist, add it do db and add 1 to the likes.
            await stockInDB.ip.push([await hashIP(ip)]);
            likes += 1;
        }
    } else if (stockInDB && !like) {
        // If the stock exists but wasn't liked.
        likes = stockInDB.ip.length;
    }
    return {
        stock: stock,
        price: price,
        likes: likes
    };
};

const stockPriceChecker = async (stock) => {
    try {
        var url =
            "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/" +
            stock +
            "/quote";
        return await superagent.get(url);
    } catch (e) {
        if (e.status === 404) {
            return false;
        }
    }
};

const hashIP = async (ip) => {
    return bcrypt.hash(ip, 10);
};

module.exports = {
    getStock
};