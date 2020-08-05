"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextPlay = exports.slackerCompatability = exports.prepareCard = exports.getCardAttachment = exports.roundToNearest = exports.cleanName = exports.scoreRelease = void 0;
require('dotenv').config();
require('source-map-support').install();
var TRELLO_API_KEY = process.env.TRELLO_API_KEY;
var TRELLO_OAUTH_TOKEN = process.env.TRELLO_OAUTH_TOKEN;
var TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || '';
var TRELLO_QUEUE_LIST_NAME = process.env.TRELLO_QUEUE_LIST_NAME;
if (!TRELLO_API_KEY) {
    throw new Error("No TRELLO_API_KEY");
}
if (!TRELLO_OAUTH_TOKEN) {
    throw new Error("No TRELLO_OAUTH_TOKEN");
}
if (!TRELLO_BOARD_ID) {
    throw new Error("No TRELLO_BOARD_ID");
}
if (!TRELLO_QUEUE_LIST_NAME) {
    throw new Error("No TRELLO_QUEUE_LIST_NAME");
}
var trello_node_api_1 = __importDefault(require("trello-node-api"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var Trello = new trello_node_api_1.default(TRELLO_API_KEY, TRELLO_OAUTH_TOKEN);
var date_fns_1 = require("date-fns");
var currYear = date_fns_1.format(new Date(), 'yyyy');
var sharesBySlacker = {};
var boardLists = [];
function recordSlackerShare(slacker, score) {
    sharesBySlacker[slacker] = sharesBySlacker[slacker] || [];
    sharesBySlacker[slacker].push(score);
}
function listCards(boardId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Trello.board.searchCards(boardId)];
        });
    });
}
var sharedRgx = /^(?<album>.+), by (?<artist>.*?)( shared by (?<slacker>.+))?$/ism;
var artAlbRgx = /^(?<album>[^|]+?)\s+\|\s+(?<artist>.+)$/ism;
var releaseDateRgx = /(^|[^\d])(?<mon>[1-9]|1[012])\/(?<day>[1-9]|[12][0-9]|3[01])(?:\/(?<year>\d{2,4}))?($|[^\d])/ism;
var totalShares = 0;
var shareScores = [];
function scoreRelease(release) {
    if (release.has_older) {
        return -1;
    }
    if (release.has_ripper) {
        if (release.has_not_bad) {
            return 4;
        }
        return 5;
    }
    if (release.has_not_bad) {
        if (release.has_flusher) {
            return 2;
        }
        return 3;
    }
    if (release.has_flusher) {
        return 1;
    }
    return 0;
}
exports.scoreRelease = scoreRelease;
function cleanName(name) {
    return name
        .toLowerCase()
        .replace(/(^(\s+|[^a-z0-9]+)|(\s+|[^a-z0-9]+)$)/gsm, '')
        .replace(/-/gsm, '')
        .replace(/[^a-z0-9_]+/gsm, '_');
}
exports.cleanName = cleanName;
function roundToNearest(num, nth) {
    if (nth === void 0) { nth = 10; }
    var n = parseInt(nth.toString(), 10);
    return Math.round(Math.round(num / n) * n);
}
exports.roundToNearest = roundToNearest;
function getCardAttachment(cardId, attachmentId) {
    return __awaiter(this, void 0, void 0, function () {
        var attach, image, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Trello.card.searchAttachmentByAttachmentId(cardId, attachmentId)];
                case 1:
                    attach = _b.sent();
                    return [4 /*yield*/, node_fetch_1.default(attach.url)];
                case 2:
                    image = _b.sent();
                    _a = attach;
                    return [4 /*yield*/, image.buffer()];
                case 3:
                    _a.imageBuffer = _b.sent();
                    return [2 /*return*/, attach];
            }
        });
    });
}
exports.getCardAttachment = getCardAttachment;
function prepareCard(c) {
    return __awaiter(this, void 0, void 0, function () {
        var card, match, match, match, mon, day, year, _a, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    card = {
                        id: c.id,
                        idBoard: c.idBoard,
                        idList: c.idList,
                        idLabels: c.idLabels,
                        name: c.name,
                        desc: c.desc,
                        score: 0,
                        _meta: c
                    };
                    card.name = card.name.replace(/\s+$/gism, '');
                    if (sharedRgx.test(card.name)) {
                        match = sharedRgx.exec(card.name);
                        if (match && match.groups) {
                            card.artist = match.groups.artist;
                            card.album = match.groups.album;
                            if (match.groups.slacker) {
                                card.slacker = match.groups.slacker;
                            }
                        }
                    }
                    else if (artAlbRgx.test(card.name)) {
                        match = artAlbRgx.exec(card.name);
                        if (match && match.groups) {
                            card.artist = match.groups.artist.trim();
                            card.album = match.groups.album.trim();
                        }
                    }
                    c.labels.forEach(function (l) {
                        card["has_" + cleanName(l.name)] = true;
                    });
                    card.score = scoreRelease(card);
                    if (releaseDateRgx.test(card.desc)) {
                        match = releaseDateRgx.exec(card.desc);
                        if (match && match.groups) {
                            mon = parseInt(match.groups.mon, 10);
                            day = parseInt(match.groups.day, 10);
                            year = parseInt(match.groups.year || currYear, 10);
                            card.releaseDate = new Date(year, mon, day);
                        }
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    if (!(c.cover && c.cover.idAttachment)) return [3 /*break*/, 3];
                    _a = card;
                    return [4 /*yield*/, getCardAttachment(card.id, c.cover.idAttachment)];
                case 2:
                    _a.cover = _b.sent();
                    _b.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    err_1 = _b.sent();
                    console.log(err_1);
                    process.exit(0);
                    return [3 /*break*/, 5];
                case 5: 
                // console.log(attachments);
                return [2 /*return*/, card];
            }
        });
    });
}
exports.prepareCard = prepareCard;
function slackerCompatability() {
    return __awaiter(this, void 0, void 0, function () {
        var cards, averageNumberVotesTotal, totalAverageRating, maxShares, rankedSlackers, sortField;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sharesBySlacker = {};
                    totalShares = 0;
                    return [4 /*yield*/, listCards(TRELLO_BOARD_ID)];
                case 1:
                    cards = _a.sent();
                    return [4 /*yield*/, Promise.all(cards.map(function (c) { return __awaiter(_this, void 0, void 0, function () {
                            var card;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, prepareCard(c)];
                                    case 1:
                                        card = _a.sent();
                                        if (card.slacker && card.score >= 1) {
                                            recordSlackerShare(card.slacker, card.score);
                                            totalShares++;
                                            shareScores.push(card.score);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _a.sent();
                    averageNumberVotesTotal = Object.keys(sharesBySlacker).reduce(function (prev, slacker) { return prev + sharesBySlacker[slacker].length; }, 0) / Object.keys(sharesBySlacker).length;
                    totalAverageRating = shareScores.reduce(function (p, c) { return p + c; }, 0) / shareScores.length;
                    maxShares = Object.keys(sharesBySlacker).reduce(function (p, slacker) { return Math.max(p, sharesBySlacker[slacker].length); }, 0);
                    rankedSlackers = [];
                    Object.keys(sharesBySlacker).forEach(function (slacker) {
                        var shortBy = maxShares - sharesBySlacker[slacker].length;
                        var slackerShares = __spreadArrays(sharesBySlacker[slacker], (new Array(shortBy).fill(totalAverageRating)));
                        var totalScoreForItem = sharesBySlacker[slacker].reduce(function (p, c) { return p + c; }, 0);
                        var average = totalScoreForItem / sharesBySlacker[slacker].length;
                        var count = sharesBySlacker[slacker].length;
                        var weightedAverage = slackerShares.reduce(function (p, c) { return p + c; }, 0) / maxShares;
                        // const bayesianWeightedRank =
                        //     (averageNumberVotesTotal * totalAverageRating +
                        //         item.votesForItem * item.totalScoreForItem) /
                        //     (averageNumberVotesTotal + item.votesForItem);
                        var bayesianWeightedRank = (averageNumberVotesTotal * totalAverageRating +
                            count * totalScoreForItem) /
                            (averageNumberVotesTotal + count);
                        rankedSlackers.push({ slacker: slacker, average: average, count: count, bayesianWeightedRank: bayesianWeightedRank, weightedAverage: weightedAverage, percent: (weightedAverage / 5) * 100 });
                    });
                    sortField = 'weightedAverage';
                    rankedSlackers.sort(function (a, b) {
                        if (a[sortField] < b[sortField]) {
                            return 1;
                        }
                        if (a[sortField] > b[sortField]) {
                            return -1;
                        }
                        return 0;
                    });
                    return [2 /*return*/, rankedSlackers];
            }
        });
    });
}
exports.slackerCompatability = slackerCompatability;
function getNextPlay() {
    return __awaiter(this, void 0, void 0, function () {
        var queueList, results, options;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(boardLists.length < 1)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Trello.board.searchLists(TRELLO_BOARD_ID)];
                case 1:
                    boardLists = _a.sent();
                    _a.label = 2;
                case 2:
                    queueList = __spreadArrays(boardLists.filter(function (l) { return cleanName(l.name) === cleanName(TRELLO_QUEUE_LIST_NAME); }), [false]).shift();
                    if (!queueList) {
                        throw new Error("Couldn't find a Trello list called \"" + TRELLO_QUEUE_LIST_NAME + "\"");
                    }
                    return [4 /*yield*/, Trello.board.searchCards(TRELLO_BOARD_ID)];
                case 3:
                    results = _a.sent();
                    return [4 /*yield*/, Promise.all(results
                            .filter(function (c) { return c.idList === queueList.id; })
                        // .map(c => prepareCard(c))
                        )];
                case 4:
                    options = _a.sent();
                    if (options.length < 1) {
                        throw new Error("nothing in the queue, check back later");
                    }
                    return [2 /*return*/, prepareCard(options[0])];
            }
        });
    });
}
exports.getNextPlay = getNextPlay;
// module.exports = {
//     cleanName,
//     getNextPlay,
//     prepareCard,
//     scoreRelease,
//     slackerCompatability
// };
//# sourceMappingURL=helpers.js.map