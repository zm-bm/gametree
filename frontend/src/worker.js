import stockfish from 'stockfish/src/stockfish-nnue-16';

const engine = stockfish();
engine.onmessage = function (event) {
    console.log("Message from Stockfish: ", event.data);
};

// Listen to messages from the main thread
self.onmessage = function (e) {
    engine.postMessage(e.data);
};
