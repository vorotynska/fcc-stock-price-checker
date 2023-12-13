const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    var likes;
    test("Test GET /api/stock-prices with a valid NASDAQ symbol to as stock query parameter", (done) => {
        chai
            .request(server)
            .get("/api/stock-prices?stock=GOOG")
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    assert.equal(res.status, 200);
                    assert.property(
                        res.body,
                        "stockData",
                        "Return value should contain a stockData property."
                    );
                    assert.property(
                        res.body.stockData,
                        "stock",
                        "Return value inside stockData should contain a stock property."
                    );
                    assert.equal(
                        res.body.stockData.stock,
                        "GOOG",
                        "Return value inside stockData.stock should equal given stock."
                    );
                    assert.property(
                        res.body.stockData,
                        "price",
                        "Return value inside stockData should contain a price property."
                    );
                    assert.property(
                        res.body.stockData,
                        "likes",
                        "Return value inside stockData should contain a likes property."
                    );
                    done();
                }
            });
    });
    test("Test GET /api/stock-prices where a valid return's stockData contains a stock symbol as a string, the price as a number and likes as a number", (done) => {
        chai
            .request(server)
            .get("/api/stock-prices?stock=GOOG")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(
                    res.body.stockData,
                    "stock",
                    "Return value in stockData should contain a stock property."
                );
                assert.isString(
                    res.body.stockData.stock,
                    "stock value should be a string"
                );
                assert.property(
                    res.body.stockData,
                    "price",
                    "Return value in stockData should contain a price property."
                );
                assert.isNumber(
                    res.body.stockData.price,
                    "price value should be a number"
                );
                assert.property(
                    res.body.stockData,
                    "likes",
                    "Return value in stockData should contain a likes property."
                );
                assert.isNumber(
                    res.body.stockData.likes,
                    "likes value should be a number"
                );
                done();
            });
    });
    test("Test GET /api/stock-prices with one valid stock and a like.", (done) => {
        chai
            .request(server)
            .get("/api/stock-prices?stock=GOOG&like=true")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(
                    res.body.stockData,
                    "stock",
                    "Return value in stockData should contain a stock property."
                );
                assert.property(
                    res.body.stockData,
                    "price",
                    "Return value in stockData should contain a price property."
                );
                assert.property(
                    res.body.stockData,
                    "likes",
                    "Return value in stockData should contain a likes property."
                );
                assert.isAbove(res.body.stockData.likes, 0);
                likes = res.body.stockData.likes;
                done();
            });
    });
    test("Test GET /api/stock-prices again with one valid stock and a like to ensure that there's no increase in likes when the like is coming from the same ip.", (done) => {
        chai
            .request(server)
            .get("/api/stock-prices?stock=GOOG")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(
                    res.body.stockData,
                    "stock",
                    "Return value in stockData should contain a stock property."
                );
                assert.property(
                    res.body.stockData,
                    "price",
                    "Return value in stockData should contain a price property."
                );
                assert.property(
                    res.body.stockData,
                    "likes",
                    "Return value in stockData should contain a likes property."
                );
                assert.equal(res.body.stockData.likes, likes);
                done();
            });
    });
    test("Test GET /api/stock-prices with two stocks.", (done) => {
        chai
            .request(server)
            .get("/api/stock-prices?stock=GOOG&stock=MSFT")
            .end((err, res) => {
                assert.isArray(
                    res.body.stockData,
                    "The value in stockData should an Array"
                );
                assert.property(
                    res.body.stockData[0],
                    "rel_likes",
                    "the objects in the Array should contain the property rel_likes"
                );
                assert.property(
                    res.body.stockData[1],
                    "rel_likes",
                    "the objects in the Array should contain the property rel_likes"
                );
                assert.equal(
                    res.body.stockData[0].rel_likes,
                    -res.body.stockData[1].rel_likes,
                    "the two object should have opposite relative like values"
                );
                done();
            });
    });
})